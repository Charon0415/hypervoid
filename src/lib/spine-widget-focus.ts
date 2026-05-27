export type SpineWidgetFocus = {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  padding?: number;
};

type FocusableSpineWidget = {
  canvas?: HTMLCanvasElement;
  config?: { fitToCanvas?: boolean };
  context?: { gl?: WebGLRenderingContext | WebGL2RenderingContext };
  mvp?: { ortho2d: (x: number, y: number, width: number, height: number) => void };
  resize?: () => void;
  skeleton?: { x?: number; y?: number };
};

export function applySpineWidgetFocus(
  widget: FocusableSpineWidget,
  focus: SpineWidgetFocus,
) {
  const fallbackResize = widget.resize?.bind(widget);

  widget.resize = () => {
    const canvas = widget.canvas;
    const gl = widget.context?.gl;
    const mvp = widget.mvp;
    if (!canvas || !gl || !mvp) {
      fallbackResize?.();
      return;
    }

    const cssW = Math.max(1, canvas.clientWidth);
    const cssH = Math.max(1, canvas.clientHeight);
    const dpr = window.devicePixelRatio || 1;
    const pixelW = Math.floor(cssW * dpr);
    const pixelH = Math.floor(cssH * dpr);

    if (canvas.width !== pixelW || canvas.height !== pixelH) {
      canvas.width = pixelW;
      canvas.height = pixelH;
    }

    const canvasAspect = cssW / cssH;
    const focusAspect = focus.width / focus.height;
    const padding = focus.padding ?? 1;
    let viewW = focus.width;
    let viewH = focus.height;

    if (canvasAspect > focusAspect) {
      viewW = focus.height * canvasAspect;
    } else {
      viewH = focus.width / canvasAspect;
    }

    viewW *= padding;
    viewH *= padding;
    if (widget.skeleton) {
      widget.skeleton.x = 0;
      widget.skeleton.y = 0;
    }
    mvp.ortho2d(
      focus.centerX - viewW / 2,
      focus.centerY - viewH / 2,
      viewW,
      viewH,
    );
    gl.viewport(0, 0, canvas.width, canvas.height);
  };

  if (widget.config) widget.config.fitToCanvas = false;
  widget.resize();
}
