import { PortableText } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'

interface ContentSectionProps {
  heading: string
  content: PortableTextBlock[]
}

const ContentSection = ({ heading, content }: ContentSectionProps) => {
  return (
    <div className="py-12">
      <div className="content-container">
        {heading && <h2 className="text-3xl font-bold mb-4">{heading}</h2>}
        <div className="prose lg:prose-xl">
          <PortableText value={content} />
        </div>
      </div>
    </div>
  )
}

export default ContentSection
