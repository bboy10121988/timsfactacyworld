import { unstable_noStore as noStore } from 'next/cache'
import Image from 'next/image'
import Link from 'next/link'
import client from "@lib/sanity"
import BlogList from "@modules/blog/components/blog-list"

interface Post {
  _id: string
  title: string
  slug: {
    current?: string
    _type?: string
  }
  publishedAt: string
  mainImage: {
    asset: {
      url: string
    }
  }
  categories: Array<{
    title: string
  }>
  body: any // 新增內文欄位
}

interface Category {
  _id: string
  title: string
}

// 取得所有部落格文章
async function getAllPosts(category?: string) {
  try {
    noStore() // 禁用快取以確保最新資料
    
    const query = category 
      ? `*[_type == "post" && "${category}" in categories[]->title] | order(publishedAt desc) {
          _id,
          title,
          slug,
          publishedAt,
          mainImage {
            asset->{
              url
            }
          },
          categories[]->{
            title
          },
          body // 包含內文
        }`
      : `*[_type == "post"] | order(publishedAt desc) {
          _id,
          title,
          slug,
          publishedAt,
          mainImage {
            asset->{
              url
            }
          },
          categories[]->{
            title
          },
          body // 包含內文
        }`
    
    const posts = await client.fetch<Post[]>(query)
    console.log('Fetched posts:', posts?.length) // 用於除錯
    
    if (!posts) {
      console.warn("No posts found")
      return []
    }
    
    return posts
  } catch (error) {
    console.error("Error fetching posts:", error)
    return []
  }
}

// 取得所有分類
async function getCategories() {
  try {
    noStore()
    const query = `*[_type == "category"] | order(title asc) {
      _id,
      title
    }`
    const categories = await client.fetch<Category[]>(query)
    console.log('Fetched categories:', categories?.length) // 用於除錯
    
    if (!categories) {
      console.warn("No categories found")
      return []
    }
    
    // 確保分類是唯一的（以標題為基準）
    const uniqueCategories = Array.from(
      new Map(categories.map(cat => [cat.title, cat])).values()
    )
    
    return uniqueCategories
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

// 取得最新文章
async function getLatestPosts() {
  try {
    noStore()
    const query = `*[_type == "post"] | order(publishedAt desc)[0...4] {
      _id,
      title,
      slug,
      publishedAt,
      mainImage {
        asset->{
          url
        }
      }
    }`
    const posts = await client.fetch(query)
    return posts || []
  } catch (error) {
    console.error("Error fetching latest posts:", error)
    return []
  }
}

// 取得網站資訊
async function getSiteInfo() {
  try {
    noStore()
    const query = `*[_type == "homePage"][0] {
      title,
      description,
      seoDescription,
      seoTitle
    }`
    const siteInfo = await client.fetch(query)
    console.log('Fetched site info:', siteInfo) // 用於除錯
    return siteInfo || { title: "首頁", description: "", seoDescription: "", seoTitle: "Fantasy World Barber Shop" }
  } catch (error) {
    console.error("Error fetching site info:", error)
    return { title: "首頁", description: "", seoDescription: "", seoTitle: "Fantasy World Barber Shop" }
  }
}

// 移除純靜態 metadata 設定並改用動態生成
export async function generateMetadata() {
  const siteInfo = await getSiteInfo()
  return {
    title: `部落格 | ${siteInfo.seoTitle || 'Fantasy World Barber Shop'}`,
    description: siteInfo.seoDescription || '最新消息與文章'
  }
}

export default async function BlogListPage({
  params,
  searchParams,
}: {
  params: { countryCode: string }
  searchParams: { category?: string }
}) {
  try {
    const [posts, categories, siteInfo, latestPosts] = await Promise.all([
      getAllPosts(searchParams.category),
      getCategories(),
      getSiteInfo(),
      getLatestPosts()
    ])

    return (
      <div className="bg-white min-h-[80vh] mt-[72px]">
        <div className="mx-auto">
          <div className="grid grid-cols-12">
            {/* 左側分類側邊欄 */}
            <aside className="col-span-12 md:col-span-3">
              <nav className="bg-white p-6 sticky top-[96px]">
                <h2 className="h3 border-b pb-2">文章分類</h2>
                <ul className="space-y-3 mt-4">
                  <li>
                    <a 
                      href={`/${params.countryCode}/blog`}
                      className={`text-body-small hover:text-primary-600 block w-full py-1 transition-colors duration-200 ${
                        !searchParams.category ? 'text-primary-600 font-medium' : 'text-gray-500'
                      }`}
                    >
                      全部文章
                    </a>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat._id}>
                      <a 
                        href={`/${params.countryCode}/blog?category=${encodeURIComponent(cat.title)}`}
                        className={`text-body-small hover:text-primary-600 block w-full py-1 transition-colors duration-200 ${
                          searchParams.category === cat.title ? 'text-primary-600 font-medium' : 'text-gray-500'
                        }`}
                      >
                        {cat.title}
                      </a>
                    </li>
                  ))}
                </ul>

                {/* 最新文章四則 */}
                {latestPosts && latestPosts.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">
                      最新文章
                    </h3>
                    <div className="space-y-3">
                      {latestPosts.map((article: any) => (
                        <Link
                          key={article._id}
                          href={`/${params.countryCode}/blog/${article.slug?.current}`}
                          className="block group hover:bg-gray-50 p-2 rounded-lg transition-all duration-200"
                        >
                          <div className="flex space-x-4">
                            {article.mainImage?.asset?.url && (
                              <div className="w-12 h-12 relative flex-shrink-0">
                                <Image
                                  src={article.mainImage.asset.url}
                                  alt={article.title}
                                  fill
                                  className="object-cover rounded"
                                  sizes="48px"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-medium text-gray-900 group-hover:text-blue-600 leading-tight overflow-hidden" 
                                  style={{ 
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                  }}>
                                {article.title}
                              </h4>
                              {article.publishedAt && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(article.publishedAt).toLocaleDateString("zh-TW")}
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </nav>
            </aside>

            {/* 右側主要內容區 */}
            <main className="col-span-12 md:col-span-9">
              {/* 頁面標題 */}
              <header className="bg-white p-8">
                <h1 className="h1">
                  {searchParams.category 
                    ? `${searchParams.category}`
                    : '部落格文章'}
                </h1>
                <p className="text-content text-gray-500 mt-2">探索我們的最新消息與文章</p>
              </header>

              {/* 文章列表 */}
              <section className="bg-transparent">
                {Array.isArray(posts) && posts.length > 0 ? (
                  <BlogList 
                    initialPosts={posts} 
                    categories={categories}
                    countryCode={params.countryCode}
                  />
                ) : (
                  <div className="text-center py-12 bg-white">
                    <p className="text-content text-gray-500">
                      {searchParams.category 
                        ? `在 "${searchParams.category}" 分類中還沒有文章`
                        : '目前還沒有任何文章'}
                    </p>
                  </div>
                )}
              </section>
            </main>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in BlogListPage:", error)
    return (
      <div className="py-12 bg-white min-h-[80vh]">
        <div className="mx-auto text-center">
          <h1 className="h1 text-red-600">載入發生錯誤</h1>
          <p className="mt-4 text-content-responsive text-gray-600">請稍後再試</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-6 py-2 bg-primary-600 text-white hover:bg-primary-700 transition-colors duration-200"
          >
            重新整理
          </button>
        </div>
      </div>
    )
  }
}
