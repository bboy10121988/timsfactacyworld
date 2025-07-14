const excludedPaths = ["/checkout", "/account/*"]

// 从Sanity获取动态路径的函数
async function fetchSanityPaths() {
  try {
    const client = require('./src/lib/sanity/client').default
    const groq = require('groq')
    
    // 获取所有页面
    const pages = await client.fetch(groq`
      *[_type in ["homePage", "pages", "post"]] {
        _type,
        slug,
        seo {
          noIndex
        }
      }
    `)

    return pages.map(page => {
      const path = page._type === 'homePage' ? '/' : `/${page.slug.current}`
      return {
        path,
        noIndex: page.seo?.noIndex || false
      }
    })
  } catch (error) {
    console.error('获取Sanity路径失败:', error)
    return []
  }
}

module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  generateRobotsTxt: true,
  exclude: [...excludedPaths, "/[sitemap]", "/api/*"],
  additionalPaths: async (config) => {
    const sanityPaths = await fetchSanityPaths()
    return sanityPaths.map(item => ({
      loc: item.path,
      changefreq: 'weekly',
      priority: item.path === '/' ? 1.0 : 0.8,
      lastmod: new Date().toISOString(),
      noindex: item.noIndex
    }))
  },
  transform: async (config, path) => {
    // 检查动态路径的noIndex设置
    const sanityPaths = await fetchSanityPaths()
    const matchedPath = sanityPaths.find(p => p.path === path)
    const isNoIndex = matchedPath ? matchedPath.noIndex : false
    
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
      noindex: isNoIndex
    }
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: "*",
        disallow: [...excludedPaths, "/api/*"],
      },
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
    ],
  },
}
