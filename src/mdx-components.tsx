import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  a: (props) => <a {...props} className="underline decoration-accent underline-offset-4 hover:text-accent" />,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
