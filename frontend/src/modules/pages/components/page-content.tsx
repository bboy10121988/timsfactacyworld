import { PortableText } from "@portabletext/react"
import Image from "next/image"
import { urlForImage } from "@lib/sanity/image"

const components = {
  types: {
    image: ({ value }: any) => {
      if (!value?.asset?._ref) {
        return null
      }
      const imageUrl = urlForImage(value)
      if (!imageUrl) {
        return null
      }
      return (
        <div className="my-6 relative w-full h-[300px]">
          <Image
            src={imageUrl}
            alt={value.alt || '頁面圖片'}
            fill
            className="object-contain"
          />
        </div>
      )
    },
  },
}

export default function PageContent({ page }: { page: any }) {
  return (
    <div className="content-container pt-0 pb-8">
      <div className="pt-8">
        <h1 className="h1 mb-12">{page.title}</h1>
      </div>
      <div className="flex flex-col gap-12">
        {page.mainSections?.map((section: any, index: number) => {
          // 只在 isActive 明確設為 false 時才不顯示
          if (section.isActive === false) {
            return null;
          }

          return (
            <div key={index} className="text-content">
              {section.title && (
                <h2 className="h2 mb-6">{section.title}</h2>
              )}
              <PortableText
                value={section.content}
                components={components}
              />
            </div>
          );
        })}
      </div>
    </div>
  )
}
