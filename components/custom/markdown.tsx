import Link from "next/link";
import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


// Markdown component for NonMemoizedMarkdown which is a memoized version of the Markdown component.
// NonMemoizedMarkdown is comprised of components that are used to render markdown content.
//components is an object that contains the components used to render the content.
const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  const components = {
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <pre
          {...props}
          className={`${className} text-sm w-[80vw] md:max-w-[500px] overflow-x-scroll bg-gradient-to-r from-[#FFECD1] via-[#FFDBB5] to-[#FFB74D] p-3 rounded-lg mt-2 text-[#3C2F2F]`}
        >
          <code className={`language-${match[1]} text-[#3C2F2F]`}>
            {children}
          </code>
        </pre>
      ) : (
        <code
          className={`text-sm bg-[#FFECD1] py-0.5 px-1 rounded-md text-[#3C2F2F] ${className}`}
          {...props}
        >
          {children}
        </code>
      );
    },
    ol: ({ node, children, ...props }: any) => {
      return (
        <ol
          className="list-decimal list-outside ml-4 text-[#3C2F2F]"
          {...props}
        >
          {children}
        </ol>
      );
    },
    li: ({ node, children, ...props }: any) => {
      return (
        <li className="py-1 text-[#3C2F2F]" {...props}>
          {children}
        </li>
      );
    },
    ul: ({ node, children, ...props }: any) => {
      return (
        <ul
          className="list-disc list-outside ml-4 text-[#3C2F2F]"
          {...props}
        >
          {children}
        </ul>
      );
    },
    strong: ({ node, children, ...props }: any) => {
      return (
        <strong className="font-semibold text-[#3C2F2F]" {...props}>
          {children}
        </strong>
      );
    },
    a: ({ node, children, ...props }: any) => {
      return (
        <Link
          className="text-[#FF9800] hover:underline"
          target="_blank"
          rel="noreferrer"
          {...props}
        >
          {children}
        </Link>
      );
    },
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);