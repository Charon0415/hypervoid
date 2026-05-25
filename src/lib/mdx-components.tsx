import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { ZoomableImage } from "@/components/ZoomableImage";
import { CodeBlock } from "@/components/CodeBlock";
import { VideoEmbed } from "@/components/VideoEmbed";

export const mdxComponents: MDXComponents = {
  a: ({ href, children, ...rest }) => {
    const isInternal = href?.startsWith("/") || href?.startsWith("#");
    if (isInternal && href) {
      return (
        <Link href={href} {...rest}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" {...rest}>
        {children}
      </a>
    );
  },
  img: (props) => <ZoomableImage {...props} />,
  pre: (props) => <CodeBlock {...props} />,
  // Emitted by `remarkVideoEmbed` when a paragraph is a sole YouTube/Bilibili link.
  VideoEmbed: (props: { src: string; title?: string; aspect?: string }) => (
    <VideoEmbed {...props} />
  ),
};
