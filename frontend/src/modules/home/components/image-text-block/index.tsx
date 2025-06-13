'use client'

import Image from 'next/image'
import { cn } from '@lib/util/cn'

interface ImageConfig {
  url?: string
  alt?: string
}

interface ImageTextBlockProps {
  heading: string
  content: string
  image?: ImageConfig
  layout: 'imageLeft' | 'imageRight' | 'imageLeftImageRight' | 'textLeftTextRight' | 'centerText'
  leftImage?: ImageConfig
  rightImage?: ImageConfig
  leftContent?: string
  rightContent?: string
}

const ImageTextBlock = ({
  heading,
  content,
  image,
  layout,
  leftImage,
  rightImage,
  leftContent,
  rightContent
}: ImageTextBlockProps) => {
  return (
    <div className="w-full max-w-[1440px] mx-auto">
      {/* 左圖右文布局 */}
      {layout === 'imageLeft' && image && (
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={image.url || ''}
              alt={image.alt || ''}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center space-y-6 px-4 md:px-8">
            <h2 className="h1 mb-4">
              {heading}
            </h2>
            <div 
              className="text-content"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      )}

      {/* 右圖左文布局 */}
      {layout === 'imageRight' && image && (
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col justify-center space-y-6 px-4 md:px-8 order-2 md:order-1">
            <h2 className="h1 mb-4">
              {heading}
            </h2>
            <div 
              className="text-content"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden order-1 md:order-2">
            <Image
              src={image.url || ''}
              alt={image.alt || ''}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      )}

      {/* 中間文字布局 */}
      {layout === 'centerText' && (
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="space-y-6 text-center">
            <h2 className="h1 mb-4">
              {heading}
            </h2>
            <div 
              className="text-content"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      )}

      {/* 雙圖布局 */}
      {layout === 'imageLeftImageRight' && (
        <div className="space-y-8 px-4 md:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="h1 mb-6">
              {heading}
            </h2>
            {content && (
              <div 
                className="text-content"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {leftImage && (
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={leftImage.url || ''}
                  alt={leftImage.alt || ''}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}
            {rightImage && (
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={rightImage.url || ''}
                  alt={rightImage.alt || ''}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 雙文布局 */}
      {layout === 'textLeftTextRight' && (
        <div className="space-y-8 px-4 md:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="h1 mb-6">
              {heading}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {leftContent && (
              <div className="space-y-4">
                <div 
                  className="text-content"
                  dangerouslySetInnerHTML={{ __html: leftContent }}
                />
              </div>
            )}
            {rightContent && (
              <div className="space-y-4">
                <div 
                  className="text-content"
                  dangerouslySetInnerHTML={{ __html: rightContent }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageTextBlock
