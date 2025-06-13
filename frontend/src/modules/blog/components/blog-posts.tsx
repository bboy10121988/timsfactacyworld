import BlogCard from "./blog-card"
import type { BlogPost } from "./blog-card"
import client from "@lib/sanity"

async function getBlogPosts(category?: string, limit: number = 6) {
  try {
    // 1. 建立基本查詢條件
    const baseQuery = `_type == "post"`
    
    // 2. 建立分類過濾條件
    const categoryFilter = category ? `&& $category in categories[]->title` : ''
    
    // 3. 組合完整查詢
    const query = `*[${baseQuery} ${categoryFilter}] | order(publishedAt desc) [0...${limit}] {
      title,
      slug,
      mainImage {
        asset->{
          url
        }
      },
      publishedAt,
      categories[]->{
        title
      },
      _id,
      status,
      body // 添加文章內文
    }`

    // 4. 設置查詢參數
    const params = category ? { category } : {}

    // 5. 執行查詢並傳入參數
    const posts = await client.fetch<BlogPost[]>(query, params)
    return posts
  } catch (error) {
    console.error('取得部落格文章時發生錯誤:', error)
    return []
  }
}

export default async function BlogPosts({ 
  category,
  limit = 6,
  title = "最新文章"
}: { 
  category?: string
  limit?: number
  title?: string 
}) {
  try {
    const posts = await getBlogPosts(category, limit)

    // 檢查並過濾無效的文章
    const validPosts = posts?.filter(post => (
      post && 
      post.title && 
      post.slug?.current &&
      post.mainImage?.asset?.url
    ))

    if (!validPosts || validPosts.length === 0) {
      return (
        <div className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center text-gray-500">
              目前還沒有已發布的文章
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="py-12 bg-gray-50">
        <div className="content-container">
          <div className="section-header-container">
            <h2 className="h1">{title}</h2>
            {/* 顯示調試信息 */}
            <div className="text-sm text-gray-500 mt-2">
              {`找到 ${posts?.length || 0} 篇文章，其中 ${validPosts?.length || 0} 篇可顯示`}
            </div>
          </div>
          {validPosts && validPosts.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
              {validPosts.map((post) => (
                <BlogCard 
                  key={post._id || post.title} 
                  post={post} 
                />
              ))}
            </ul>
          ) : (
            <div className="text-center text-gray-500">
              目前還沒有已發布的文章
            </div>
          )}
          {validPosts?.length >= limit && (
            <div className="flex justify-center mt-12">
              <a 
                href="/blog" 
                className="btn-secondary"
              >
                查看更多文章
              </a>
            </div>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error('顯示部落格文章時發生錯誤:', error)
    return (
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500">
            載入文章時發生錯誤，請稍後再試
          </div>
        </div>
      </div>
    )
  }
}
