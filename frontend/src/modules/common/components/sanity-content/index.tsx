import { PortableText } from "@portabletext/react"
import type { PortableTextBlock } from "@portabletext/types"
import type { PortableTextReactComponents } from '@portabletext/react'
import clsx from "clsx"

type SanityContentProps = {
  blocks: PortableTextBlock[]
  className?: string
}

const components: Partial<PortableTextReactComponents> = {
  block: {
    h1: ({children}) => (
      <h1 className="h1 mb-4">{children}</h1>
    ),
    h2: ({children}) => (
      <h2 className="h2 mb-3">{children}</h2>
    ),
    h3: ({children}) => (
      <h3 className="h3 mb-2">{children}</h3>
    ),
    normal: ({children}) => (
      <p className="text-content mb-4">{children}</p>
    ),
    blockquote: ({children}) => (
      <blockquote className="text-content border-l-4 border-gray-300 pl-4 italic my-4">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({children}) => (
      <ul className="text-content list-disc list-inside mb-4 space-y-2">{children}</ul>
    ),
    number: ({children}) => (
      <ol className="text-content list-decimal list-inside mb-4 space-y-2">{children}</ol>
    ),
  },
  marks: {
    strong: ({children}) => (
      <strong className="text-content font-semibold">{children}</strong>
    ),
    em: ({children}) => (
      <em className="text-content italic">{children}</em>
    ),
    code: ({children}) => (
      <code className="text-content bg-gray-100 rounded px-1">
        {children}
      </code>
    ),
    link: ({children, value}) => {
      const rel = !value?.href?.startsWith('/') ? 'noreferrer noopener' : undefined
      return (
        <a 
          href={value?.href}
          rel={rel}
          className="text-content text-blue-600 hover:underline"
        >
          {children}
        </a>
      )
    },
  },
}

const SanityContent = ({ blocks, className }: SanityContentProps) => {
  if (!blocks) {
    return null
  }

  return (
    <div className={clsx("max-w-none", className)}>
      <PortableText value={blocks} components={components} />
    </div>
  )
}

export default SanityContent
