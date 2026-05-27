export type RemAtlasRegion = {
  name: string;
  rotate: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  offsetX: number;
  offsetY: number;
};

export type RemDrawable = {
  slotName: string;
  attachmentName: string;
  path: string;
  region: RemAtlasRegion;
  vertices: [number, number, number, number, number, number, number, number];
  alpha: number;
};

export type RemSetupPose = {
  version: string | null;
  width: number;
  height: number;
  drawables: RemDrawable[];
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
};

type BoneData = {
  name: string;
  parent: number | null;
  rotation: number;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  shearX: number;
  shearY: number;
  transformMode: number;
};

type BoneWorld = BoneData & {
  a: number;
  b: number;
  c: number;
  d: number;
  worldX: number;
  worldY: number;
};

type SlotData = {
  name: string;
  bone: number;
  attachmentName: string | null;
  alpha: number;
};

type RegionAttachment = {
  name: string;
  path: string;
  rotation: number;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  width: number;
  height: number;
  alpha: number;
};

class SpineInput {
  private offset = 0;
  private readonly decoder = new TextDecoder();
  private readonly view: DataView;

  constructor(private readonly bytes: Uint8Array) {
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }

  readByte(): number {
    const value = this.view.getInt8(this.offset);
    this.offset += 1;
    return value;
  }

  readUnsignedByte(): number {
    const value = this.view.getUint8(this.offset);
    this.offset += 1;
    return value;
  }

  readBoolean(): boolean {
    return this.readUnsignedByte() !== 0;
  }

  readInt32(): number {
    const value = this.view.getInt32(this.offset, false);
    this.offset += 4;
    return value;
  }

  readShort(): number {
    const value = this.view.getInt16(this.offset, false);
    this.offset += 2;
    return value;
  }

  readFloat(): number {
    const value = this.view.getFloat32(this.offset, false);
    this.offset += 4;
    return value;
  }

  readVarInt(optimizePositive: boolean): number {
    let b = this.readUnsignedByte();
    let result = b & 0x7f;
    if ((b & 0x80) !== 0) {
      b = this.readUnsignedByte();
      result |= (b & 0x7f) << 7;
      if ((b & 0x80) !== 0) {
        b = this.readUnsignedByte();
        result |= (b & 0x7f) << 14;
        if ((b & 0x80) !== 0) {
          b = this.readUnsignedByte();
          result |= (b & 0x7f) << 21;
          if ((b & 0x80) !== 0) {
            b = this.readUnsignedByte();
            result |= (b & 0x7f) << 28;
          }
        }
      }
    }
    return optimizePositive ? result : (result >>> 1) ^ -(result & 1);
  }

  readString(): string | null {
    let byteCount = this.readVarInt(true);
    if (byteCount === 0) return null;
    if (byteCount === 1) return "";
    byteCount -= 1;
    const value = this.decoder.decode(
      this.bytes.subarray(this.offset, this.offset + byteCount),
    );
    this.offset += byteCount;
    return value;
  }
}

function colorAlpha(rgba8888: number): number {
  return (rgba8888 & 0xff) / 255;
}

export function parseRemAtlas(text: string): Map<string, RemAtlasRegion> {
  const regions = new Map<string, RemAtlasRegion>();
  const lines = text.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    const name = lines[i]?.trim();
    if (!name || name.endsWith(".png") || name.includes(":")) continue;

    const region: RemAtlasRegion = {
      name,
      rotate: false,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      originalWidth: 0,
      originalHeight: 0,
      offsetX: 0,
      offsetY: 0,
    };

    for (let j = i + 1; j < lines.length; j += 1) {
      const raw = lines[j];
      if (!raw || !raw.startsWith("  ")) break;
      const [key, rawValue] = raw.trim().split(":");
      if (!key || rawValue === undefined) continue;
      const values = rawValue.split(",").map((value) => value.trim());
      if (key === "rotate") region.rotate = values[0] === "true";
      if (key === "xy") {
        region.x = Number(values[0]);
        region.y = Number(values[1]);
      }
      if (key === "size") {
        region.width = Number(values[0]);
        region.height = Number(values[1]);
      }
      if (key === "orig") {
        region.originalWidth = Number(values[0]);
        region.originalHeight = Number(values[1]);
      }
      if (key === "offset") {
        region.offsetX = Number(values[0]);
        region.offsetY = Number(values[1]);
      }
    }

    if (region.width > 0 && region.height > 0) {
      regions.set(region.name, region);
    }
  }

  return regions;
}

export function buildRemSetupPose(
  skeletonBytes: Uint8Array,
  atlasText: string,
): RemSetupPose {
  const atlas = parseRemAtlas(atlasText);
  const input = new SpineInput(skeletonBytes);
  input.readString();
  const version = input.readString();
  const width = input.readFloat();
  const height = input.readFloat();
  const nonessential = input.readBoolean();
  if (nonessential) {
    input.readFloat();
    input.readString();
  }

  const bones = readBones(input, nonessential);
  const slots = readSlots(input);
  skipIkConstraints(input);
  skipTransformConstraints(input);
  skipPathConstraints(input);
  const attachments = readSkin(input, nonessential);
  const skinCount = input.readVarInt(true);
  for (let i = 0; i < skinCount; i += 1) {
    input.readString();
    readSkin(input, nonessential);
  }

  const worldBones = computeWorldBones(bones);
  const drawables: RemDrawable[] = [];
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  slots.forEach((slot, slotIndex) => {
    if (!slot.attachmentName) return;
    const attachment = attachments.get(attachmentKey(slotIndex, slot.attachmentName));
    if (!attachment) return;
    const region = atlas.get(attachment.path);
    if (!region) return;
    const bone = worldBones[slot.bone];
    if (!bone) return;

    const vertices = computeRegionVertices(attachment, region, bone);
    for (let i = 0; i < vertices.length; i += 2) {
      minX = Math.min(minX, vertices[i]);
      minY = Math.min(minY, vertices[i + 1]);
      maxX = Math.max(maxX, vertices[i]);
      maxY = Math.max(maxY, vertices[i + 1]);
    }

    drawables.push({
      slotName: slot.name,
      attachmentName: slot.attachmentName,
      path: attachment.path,
      region,
      vertices,
      alpha: slot.alpha * attachment.alpha,
    });
  });

  if (!Number.isFinite(minX) || !Number.isFinite(minY)) {
    throw new Error("Rem skeleton setup pose produced no drawable regions.");
  }

  return {
    version,
    width,
    height,
    drawables,
    bounds: { minX, minY, maxX, maxY },
  };
}

function readBones(input: SpineInput, nonessential: boolean): BoneData[] {
  const count = input.readVarInt(true);
  const bones: BoneData[] = [];
  for (let i = 0; i < count; i += 1) {
    const name = input.readString() ?? "";
    const parent = i === 0 ? null : input.readVarInt(true);
    const rotation = input.readFloat();
    const x = input.readFloat();
    const y = input.readFloat();
    const scaleX = input.readFloat();
    const scaleY = input.readFloat();
    const shearX = input.readFloat();
    const shearY = input.readFloat();
    input.readFloat();
    const transformMode = input.readVarInt(true);
    bones.push({
      name,
      parent,
      rotation,
      x,
      y,
      scaleX,
      scaleY,
      shearX,
      shearY,
      transformMode,
    });
    if (nonessential) input.readInt32();
  }
  return bones;
}

function readSlots(input: SpineInput): SlotData[] {
  const count = input.readVarInt(true);
  const slots: SlotData[] = [];
  for (let i = 0; i < count; i += 1) {
    const name = input.readString() ?? "";
    const bone = input.readVarInt(true);
    const alpha = colorAlpha(input.readInt32());
    input.readInt32();
    const attachmentName = input.readString();
    input.readVarInt(true);
    slots.push({ name, bone, alpha, attachmentName });
  }
  return slots;
}

function skipIkConstraints(input: SpineInput) {
  const count = input.readVarInt(true);
  for (let i = 0; i < count; i += 1) {
    input.readString();
    input.readVarInt(true);
    const boneCount = input.readVarInt(true);
    for (let ii = 0; ii < boneCount; ii += 1) input.readVarInt(true);
    input.readVarInt(true);
    input.readFloat();
    input.readByte();
  }
}

function skipTransformConstraints(input: SpineInput) {
  const count = input.readVarInt(true);
  for (let i = 0; i < count; i += 1) {
    input.readString();
    input.readVarInt(true);
    const boneCount = input.readVarInt(true);
    for (let ii = 0; ii < boneCount; ii += 1) input.readVarInt(true);
    input.readVarInt(true);
    input.readBoolean();
    input.readBoolean();
    for (let ii = 0; ii < 10; ii += 1) input.readFloat();
  }
}

function skipPathConstraints(input: SpineInput) {
  const count = input.readVarInt(true);
  for (let i = 0; i < count; i += 1) {
    input.readString();
    input.readVarInt(true);
    const boneCount = input.readVarInt(true);
    for (let ii = 0; ii < boneCount; ii += 1) input.readVarInt(true);
    input.readVarInt(true);
    input.readVarInt(true);
    const spacingMode = input.readVarInt(true);
    input.readVarInt(true);
    input.readFloat();
    input.readFloat();
    if (spacingMode === 1 || spacingMode === 2) {
      // The runtime only scales this value; the binary layout is unchanged.
    }
    input.readFloat();
    input.readFloat();
    input.readFloat();
  }
}

function readSkin(
  input: SpineInput,
  nonessential: boolean,
): Map<string, RegionAttachment> {
  const attachments = new Map<string, RegionAttachment>();
  const slotCount = input.readVarInt(true);
  for (let i = 0; i < slotCount; i += 1) {
    const slotIndex = input.readVarInt(true);
    const attachmentCount = input.readVarInt(true);
    for (let ii = 0; ii < attachmentCount; ii += 1) {
      const attachmentName = input.readString() ?? "";
      const attachment = readAttachment(input, attachmentName, nonessential);
      if (attachment) {
        attachments.set(attachmentKey(slotIndex, attachmentName), attachment);
      }
    }
  }
  return attachments;
}

function readAttachment(
  input: SpineInput,
  attachmentName: string,
  nonessential: boolean,
): RegionAttachment | null {
  const name = input.readString() ?? attachmentName;
  const type = input.readByte();
  if (type === 0) {
    const path = input.readString() ?? name;
    const rotation = input.readFloat();
    const x = input.readFloat();
    const y = input.readFloat();
    const scaleX = input.readFloat();
    const scaleY = input.readFloat();
    // Spine 3.6 binary stores region width/height at 2× the source-image
    // dimensions (full skeleton coordinate space).  Divide by 2 to get the
    // actual source-image half-extents used by the vertex offset formula.
    const width = input.readFloat() / 2;
    const height = input.readFloat() / 2;
    return {
      name,
      path,
      rotation,
      x,
      y,
      scaleX,
      scaleY,
      width,
      height,
      alpha: colorAlpha(input.readInt32()),
    };
  }
  if (type === 1) {
    skipVertices(input, input.readVarInt(true));
    if (nonessential) input.readInt32();
  } else if (type === 2) {
    input.readString();
    input.readInt32();
    const vertexCount = input.readVarInt(true);
    skipFloatArray(input, vertexCount << 1);
    skipShortArray(input);
    skipVertices(input, vertexCount);
    input.readVarInt(true);
    if (nonessential) {
      skipShortArray(input);
      input.readFloat();
      input.readFloat();
    }
  } else if (type === 3) {
    input.readString();
    input.readInt32();
    input.readString();
    input.readString();
    input.readBoolean();
    if (nonessential) {
      input.readFloat();
      input.readFloat();
    }
  } else if (type === 4) {
    input.readBoolean();
    input.readBoolean();
    const vertexCount = input.readVarInt(true);
    skipVertices(input, vertexCount);
    for (let i = 0, n = vertexCount / 3; i < n; i += 1) input.readFloat();
    if (nonessential) input.readInt32();
  } else if (type === 5) {
    input.readFloat();
    input.readFloat();
    input.readFloat();
    if (nonessential) input.readInt32();
  } else if (type === 6) {
    input.readVarInt(true);
    skipVertices(input, input.readVarInt(true));
    if (nonessential) input.readInt32();
  } else {
    throw new Error("Unsupported Spine attachment type: " + type);
  }
  return null;
}

function skipVertices(input: SpineInput, vertexCount: number) {
  const verticesLength = vertexCount << 1;
  if (!input.readBoolean()) {
    skipFloatArray(input, verticesLength);
    return;
  }
  for (let i = 0; i < vertexCount; i += 1) {
    const boneCount = input.readVarInt(true);
    for (let ii = 0; ii < boneCount; ii += 1) {
      input.readVarInt(true);
      input.readFloat();
      input.readFloat();
      input.readFloat();
    }
  }
}

function skipFloatArray(input: SpineInput, count: number) {
  for (let i = 0; i < count; i += 1) input.readFloat();
}

function skipShortArray(input: SpineInput) {
  const count = input.readVarInt(true);
  for (let i = 0; i < count; i += 1) input.readShort();
}

function attachmentKey(slotIndex: number, attachmentName: string): string {
  return slotIndex + ":" + attachmentName;
}

function computeWorldBones(bones: BoneData[]): BoneWorld[] {
  const worldBones: BoneWorld[] = [];
  for (const data of bones) {
    const bone: BoneWorld = { ...data, a: 0, b: 0, c: 0, d: 0, worldX: 0, worldY: 0 };
    const parent = data.parent === null ? null : worldBones[data.parent];
    updateWorldTransform(bone, parent);
    worldBones.push(bone);
  }
  return worldBones;
}

function updateWorldTransform(bone: BoneWorld, parent: BoneWorld | null) {
  if (!parent) {
    const rotationY = bone.rotation + 90 + bone.shearY;
    bone.a = cosDeg(bone.rotation + bone.shearX) * bone.scaleX;
    bone.b = cosDeg(rotationY) * bone.scaleY;
    bone.c = sinDeg(bone.rotation + bone.shearX) * bone.scaleX;
    bone.d = sinDeg(rotationY) * bone.scaleY;
    bone.worldX = bone.x;
    bone.worldY = bone.y;
    return;
  }

  let pa = parent.a;
  let pb = parent.b;
  let pc = parent.c;
  let pd = parent.d;
  bone.worldX = pa * bone.x + pb * bone.y + parent.worldX;
  bone.worldY = pc * bone.x + pd * bone.y + parent.worldY;

  if (bone.transformMode === 0) {
    const rotationY = bone.rotation + 90 + bone.shearY;
    const la = cosDeg(bone.rotation + bone.shearX) * bone.scaleX;
    const lb = cosDeg(rotationY) * bone.scaleY;
    const lc = sinDeg(bone.rotation + bone.shearX) * bone.scaleX;
    const ld = sinDeg(rotationY) * bone.scaleY;
    bone.a = pa * la + pb * lc;
    bone.b = pa * lb + pb * ld;
    bone.c = pc * la + pd * lc;
    bone.d = pc * lb + pd * ld;
    return;
  }

  if (bone.transformMode === 1) {
    const rotationY = bone.rotation + 90 + bone.shearY;
    bone.a = cosDeg(bone.rotation + bone.shearX) * bone.scaleX;
    bone.b = cosDeg(rotationY) * bone.scaleY;
    bone.c = sinDeg(bone.rotation + bone.shearX) * bone.scaleX;
    bone.d = sinDeg(rotationY) * bone.scaleY;
    return;
  }

  if (bone.transformMode === 2) {
    let s = pa * pa + pc * pc;
    let prx: number;
    if (s > 0.0001) {
      s = Math.abs(pa * pd - pb * pc) / s;
      pb = pc * s;
      pd = pa * s;
      prx = Math.atan2(pc, pa) / DEG_RAD;
    } else {
      pa = 0;
      pc = 0;
      prx = 90 - Math.atan2(pd, pb) / DEG_RAD;
    }
    const rx = bone.rotation + bone.shearX - prx;
    const ry = bone.rotation + bone.shearY - prx + 90;
    const la = cosDeg(rx) * bone.scaleX;
    const lb = cosDeg(ry) * bone.scaleY;
    const lc = sinDeg(rx) * bone.scaleX;
    const ld = sinDeg(ry) * bone.scaleY;
    bone.a = pa * la - pb * lc;
    bone.b = pa * lb - pb * ld;
    bone.c = pc * la + pd * lc;
    bone.d = pc * lb + pd * ld;
    return;
  }

  const cos = cosDeg(bone.rotation);
  const sin = sinDeg(bone.rotation);
  let za = pa * cos + pb * sin;
  let zc = pc * cos + pd * sin;
  let s = Math.sqrt(za * za + zc * zc);
  if (s > 0.00001) s = 1 / s;
  za *= s;
  zc *= s;
  s = Math.sqrt(za * za + zc * zc);
  const r = Math.PI / 2 + Math.atan2(zc, za);
  const zb = Math.cos(r) * s;
  const zd = Math.sin(r) * s;
  const la = cosDeg(bone.shearX) * bone.scaleX;
  const lb = cosDeg(90 + bone.shearY) * bone.scaleY;
  const lc = sinDeg(bone.shearX) * bone.scaleX;
  const ld = sinDeg(90 + bone.shearY) * bone.scaleY;
  bone.a = za * la + zb * lc;
  bone.b = za * lb + zb * ld;
  bone.c = zc * la + zd * lc;
  bone.d = zc * lb + zd * ld;
}

function computeRegionVertices(
  attachment: RegionAttachment,
  region: RemAtlasRegion,
  bone: BoneWorld,
): [number, number, number, number, number, number, number, number] {
  const offset = computeRegionOffset(attachment, region);
  const vertices = new Array<number>(8);
  const order = [6, 7, 0, 1, 2, 3, 4, 5];
  for (let i = 0; i < order.length; i += 2) {
    const offsetX = offset[order[i]];
    const offsetY = offset[order[i + 1]];
    vertices[i] = offsetX * bone.a + offsetY * bone.b + bone.worldX;
    vertices[i + 1] = offsetX * bone.c + offsetY * bone.d + bone.worldY;
  }
  return vertices as [number, number, number, number, number, number, number, number];
}

function computeRegionOffset(
  attachment: RegionAttachment,
  region: RemAtlasRegion,
): [number, number, number, number, number, number, number, number] {
  let localX2 = attachment.width / 2;
  let localY2 = attachment.height / 2;
  let localX = -localX2;
  let localY = -localY2;

  if (region.rotate) {
    localX += (region.offsetX / region.originalWidth) * attachment.width;
    localY += (region.offsetY / region.originalHeight) * attachment.height;
    localX2 -=
      ((region.originalWidth - region.offsetX - region.height) /
        region.originalWidth) *
      attachment.width;
    localY2 -=
      ((region.originalHeight - region.offsetY - region.width) /
        region.originalHeight) *
      attachment.height;
  } else {
    localX += (region.offsetX / region.originalWidth) * attachment.width;
    localY += (region.offsetY / region.originalHeight) * attachment.height;
    localX2 -=
      ((region.originalWidth - region.offsetX - region.width) /
        region.originalWidth) *
      attachment.width;
    localY2 -=
      ((region.originalHeight - region.offsetY - region.height) /
        region.originalHeight) *
      attachment.height;
  }

  localX *= attachment.scaleX;
  localY *= attachment.scaleY;
  localX2 *= attachment.scaleX;
  localY2 *= attachment.scaleY;

  const cos = Math.cos(attachment.rotation * DEG_RAD);
  const sin = Math.sin(attachment.rotation * DEG_RAD);
  const localXCos = localX * cos + attachment.x;
  const localXSin = localX * sin;
  const localYCos = localY * cos + attachment.y;
  const localYSin = localY * sin;
  const localX2Cos = localX2 * cos + attachment.x;
  const localX2Sin = localX2 * sin;
  const localY2Cos = localY2 * cos + attachment.y;
  const localY2Sin = localY2 * sin;

  return [
    localXCos - localYSin,
    localYCos + localXSin,
    localXCos - localY2Sin,
    localY2Cos + localXSin,
    localX2Cos - localY2Sin,
    localY2Cos + localX2Sin,
    localX2Cos - localYSin,
    localYCos + localX2Sin,
  ];
}

const DEG_RAD = Math.PI / 180;

function cosDeg(degrees: number): number {
  return Math.cos(degrees * DEG_RAD);
}

function sinDeg(degrees: number): number {
  return Math.sin(degrees * DEG_RAD);
}
