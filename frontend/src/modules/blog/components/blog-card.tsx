import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"

export type BlogPost = {
  _id?: string
  _type?: string
  title: string
  body?: string // 添加文章內文欄位
  slug?: {
    current?: string
    _type?: string
  } | null
  mainImage?: {
    asset?: {
      url?: string
      _type?: string
    } | null
    _type?: string
  } | null
  publishedAt?: string
  categories?: Array<{
    title?: string
    _type?: string
  } | null> | null
  cstatus?: string
}

export default function BlogCard({ post }: { post: BlogPost }) {
  // 處理摘要內容
  const getExcerpt = (content: any) => {
    if (typeof content === 'string') {
      return content.slice(0, 100) + '...'
    }
    // 如果是 Portable Text 格式,只取純文字內容
    if (Array.isArray(content)) {
      const text = content
        .filter(block => block._type === 'block')
        .map(block => block.children
          ?.map((child: any) => child.text)
          .join('') || ''
        )
        .join(' ')
      return text.slice(0, 100) + '...'
    }
    return ''
  }

  return (
    <li className="group relative">
      <Link href={`/blog/${post.slug?.current ?? ""}`}>
        <article className="h-full flex flex-col border border-transparent hover:border-gray-200 transition-all duration-200">
          <div className="aspect-[16/9] w-full relative">
            {post.mainImage?.asset?.url ? (
              <Image 
                src={post.mainImage.asset.url}
                alt={post.title}
                className="absolute inset-0 object-cover"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gray-100" />
            )}
          </div>
          <div className="flex flex-col flex-1 px-4 md:px-8 py-4">
            <div className="mb-4">
              {post.categories?.map((category) => (
                <span key={category?.title} className="text-sm text-ui-fg-subtle font-base mr-2">
                  {category?.title}
                </span>
              ))}
            </div>
            <h2 className="h2 mb-2">
              {post.title}
            </h2>
            <p className="text-content text-ui-fg-subtle mb-4">
              {post.body && getExcerpt(post.body)}
            </p>
            <div className="mt-auto">
              {post.publishedAt && (
                <time className="text-sm text-ui-fg-subtle font-base">
                  {format(new Date(post.publishedAt), "yyyy年MM月dd日", { locale: zhTW })}
                </time>
              )}
            </div>
          </div>
        </article>
      </Link>
    </li>
  )
}
