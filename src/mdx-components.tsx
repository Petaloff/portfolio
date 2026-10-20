import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  a: (props) => <a {...props} className="underline underline-offset-4 decoration-accent hover:text-accent" />,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
