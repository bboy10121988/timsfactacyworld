import { getPostBySlug } from "@lib/sanity"
import SanityContent from "@modules/common/components/sanity-content"
import { notFound } from "next/navigation"
import Image from "next/image"

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="content-container py-12 md:py-16">
      <div className="max-w-4xl mx-auto">
        {post.mainImage && (
          <div className="aspect-[16/9] relative mb-10 rounded-lg overflow-hidden shadow-md">
            <Image 
              src={post.mainImage} 
              alt={post.title || "文章封面圖片"}
              fill
              priority
              className="object-cover hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
              quality={95}
            />
          </div>
        )}
        <h1 className="h1 mb-6">{post.title}</h1>
        <div className="flex gap-x-4 text-body-small text-gray-600 mb-8">
          {post.publishedAt && (
            <span>
              {new Date(post.publishedAt).toLocaleDateString("zh-TW")}
            </span>
          )}
          {post.categories && post.categories.length > 0 && (
            <span className="flex gap-2">
              {post.categories.map(cat => (
                <span key={cat.title} className="text-body-small bg-gray-100 px-3 py-1 rounded-full">
                  {cat.title}
                </span>
              ))}
            </span>
          )}
        </div>
        {post.body && (
          <div className="max-w-none space-y-6">
            <SanityContent blocks={post.body} />
          </div>
        )}
      </div>
    </div>
  )
}
