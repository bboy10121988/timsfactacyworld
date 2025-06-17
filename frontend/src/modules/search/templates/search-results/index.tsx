'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import ProductPreview from '@modules/products/components/product-preview'
import BlogCard from '@modules/blog/components/blog-card'
import { HttpTypes } from "@medusajs/types"

// 搜尋結果類型定義 - 更新為使用完整的 Medusa 商品類型
type ProductResult = HttpTypes.StoreProduct

// 使用與 BlogCard 相容的類型
import { BlogPost } from '@modules/blog/components/blog-card'
type BlogResult = BlogPost

type SearchResultsProps = {
  query: string
  initialType: string
}

const SearchResults = ({ query, initialType }: SearchResultsProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(initialType || 'all')
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<ProductResult[]>([])
  const [blogs, setBlogs] = useState<BlogResult[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalBlogs, setTotalBlogs] = useState(0)

  // 除錯信息
  console.log('SearchResults props:', { query, initialType, activeTab })

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true)
      console.log('開始搜尋:', { query, activeTab })

      try {
        // 搜尋商品（使用完整格式）
        if (activeTab === 'all' || activeTab === 'products') {
          console.log('搜尋商品...')
          const productsRes = await fetch(`/api/products/search?q=${encodeURIComponent(query)}&limit=24`)
          
          if (productsRes.ok) {
            const data = await productsRes.json()
            console.log('商品搜尋結果:', data)
            console.log('第一個商品詳細資料:', data.products?.[0])
            console.log('第一個商品的變體:', data.products?.[0]?.variants)
            setProducts(data.products || [])
            setTotalProducts(data.products?.length || 0)
          } else {
            console.error('商品搜尋失敗:', await productsRes.text())
            setProducts([])
            setTotalProducts(0)
          }
        }

        // 搜尋部落格文章
        if (activeTab === 'all' || activeTab === 'blogs') {
          console.log('搜尋部落格...')
          const blogsRes = await fetch(`/api/blogs/search?q=${encodeURIComponent(query)}&limit=24`)
          
          if (blogsRes.ok) {
            const data = await blogsRes.json()
            console.log('部落格搜尋結果:', data)
            
            // 轉換數據格式以相容 BlogCard
            const transformedBlogs = (data.posts || []).map((blog: any) => ({
              ...blog,
              _id: blog.id || blog._id,
              slug: blog.slug ? { current: blog.slug } : null,
              mainImage: blog.image ? { asset: { url: blog.image } } : null,
              body: blog.bodyText || blog.excerpt || '',
              categories: blog.categories?.map((cat: string) => ({ title: cat })) || []
            }))
            
            setBlogs(transformedBlogs)
            setTotalBlogs(transformedBlogs.length)
          } else {
            console.error('部落格文章搜尋失敗:', await blogsRes.text())
            setBlogs([])
            setTotalBlogs(0)
          }
        }
      } catch (error) {
        console.error('搜尋出錯:', error)
        if (activeTab === 'all' || activeTab === 'products') {
          setProducts([])
          setTotalProducts(0)
        }
        if (activeTab === 'all' || activeTab === 'blogs') {
          setBlogs([])
          setTotalBlogs(0)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [query, activeTab])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    
    // 更新 URL 查詢參數
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set('type', tab)
    
    // 使用相對路徑，保持當前的 countryCode
    router.push(`?${newParams.toString()}`)
  }

  console.log('渲染搜尋結果:', { 
    isLoading, 
    products: products.length, 
    blogs: blogs.length, 
    totalProducts, 
    totalBlogs 
  })

  return (
    <div className="pt-20 pb-6">
      {/* 標題和標籤區域 - 保持與主選單相同的左右間距 */}
      <div className="px-6 md:px-12 mb-8">
        <h1 className="text-2xl md:text-3xl font-medium">
          「{query}」的搜尋結果
        </h1>
        
        {/* 分頁標籤 */}
        <div className="mt-6 border-b">
          <div className="flex space-x-8">
            <button
              className={`pb-2 px-1 ${
                activeTab === 'all'
                  ? 'border-b-2 border-gray-900 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleTabChange('all')}
            >
              全部
              {!isLoading && <span className="ml-1">({totalProducts + totalBlogs})</span>}
            </button>
            <button
              className={`pb-2 px-1 ${
                activeTab === 'products'
                  ? 'border-b-2 border-gray-900 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleTabChange('products')}
            >
              商品
              {!isLoading && <span className="ml-1">({totalProducts})</span>}
            </button>
            <button
              className={`pb-2 px-1 ${
                activeTab === 'blogs'
                  ? 'border-b-2 border-gray-900 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleTabChange('blogs')}
            >
              部落格
              {!isLoading && <span className="ml-1">({totalBlogs})</span>}
            </button>
          </div>
        </div>
      </div>

      {/* 載入中狀態 */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* 無結果 */}
      {!isLoading && products.length === 0 && blogs.length === 0 && (
        <div className="text-center py-20 px-6 md:px-12">
          <p className="text-gray-500 text-lg">找不到符合「{query}」的結果</p>
          <p className="mt-2 text-gray-400">請嘗試其他關鍵字或瀏覽我們的商品分類</p>
          <div className="mt-6">
            <LocalizedClientLink
              href="/products"
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
            >
              瀏覽所有商品
            </LocalizedClientLink>
          </div>
        </div>
      )}

      {/* 搜尋結果 */}
      <div className="space-y-12">
        {/* 商品結果 */}
        {!isLoading && (activeTab === 'all' || activeTab === 'products') && products.length > 0 && (
          <div>
            {/* 商品標題 - 保持與主選單相同的左右間距 */}
            {activeTab === 'all' && (
              <div className="px-6 md:px-12 mb-6">
                <h2 className="text-2xl font-bold border-l-4 border-gray-900 pl-3">商品 ({products.length})</h2>
              </div>
            )}
            {/* 商品網格 - 使用與其他頁面相同的樣式 */}
            <div className="px-0">
              <ul className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-4 gap-y-8" data-testid="search-products-list">
                {products.map(product => {
                  console.log('渲染搜尋商品:', product.title, '變體數量:', product.variants?.length, '第一個變體:', product.variants?.[0])
                  return (
                    <li key={product.id}>
                      <ProductPreview
                        product={product}
                        isFeatured={false}
                        countryCode="tw"
                      />
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        )}

        {/* 部落格結果 */}
        {!isLoading && (activeTab === 'all' || activeTab === 'blogs') && blogs.length > 0 && (
          <div>
            {/* 部落格標題 - 保持與主選單相同的左右間距 */}
            {activeTab === 'all' && (
              <div className="px-6 md:px-12 mb-6">
                <h2 className="text-2xl font-bold border-l-4 border-gray-900 pl-3">部落格文章 ({blogs.length})</h2>
              </div>
            )}
            {/* 部落格網格 - 左右間距為0，卡片間距也為0 */}
            <div className="px-0">
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
                {blogs.map(blog => (
                  <BlogCard
                    key={blog._id || blog.title}
                    post={blog}
                  />
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchResults
