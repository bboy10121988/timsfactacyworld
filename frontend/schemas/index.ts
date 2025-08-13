
import post from './post'
import author from './author'
import category from './category'
import header from './header'
import homePage from './homePage'
import pages from './pages'
import footer from './footer'
import returnPolicy from './returnPolicy'
import seoMeta from './seoMeta'
import productPage from './productPage'
import collectionPage from './collectionPage'

// Block schemas
import mainBanner from './blocks/mainBanner'
import imageTextBlock from './blocks/imageTextBlock'
import featuredProducts from './blocks/featuredProducts'
import blogSection from './blocks/blogSection'
import youtubeSection from './blocks/youtubeSection'
import contentSection from './blocks/contentSection'
import serviceCardSection from './blocks/serviceCardSection'


export const schemaTypes = [
  // Documents - 主要內容類型
  homePage,
  pages,
  post,
  author,
  category,
  header,
  footer,
  returnPolicy,
  
  // SEO 專用頁面
  productPage,
  collectionPage,

  // Objects - 可重複使用的物件
  seoMeta,

  // Blocks - 頁面區塊組件
  mainBanner,
  imageTextBlock,
  featuredProducts,
  blogSection,
  youtubeSection,
  contentSection,
  serviceCardSection,

]
