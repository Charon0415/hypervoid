"use client";

import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

export function ZoomableImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <Zoom>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...props} alt={props.alt ?? ""} />
    </Zoom>
  );
}
