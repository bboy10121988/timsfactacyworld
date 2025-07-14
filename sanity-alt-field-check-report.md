# Sanity CMS 圖片 Alt 欄位檢查報告

## 檢查摘要
檢查日期：2025年7月10日  
檢查範圍：所有 Sanity CMS schema 中的圖片欄位  
檢查目的：確保所有圖片都有 alt 替代文字欄位，符合無障礙和 SEO 最佳實務

## 檢查結果

### ✅ 已正確設定 alt 欄位的圖片區塊

#### 1. Header Schema (`header.ts`)
- **圖片欄位**：`logo`
- **Alt 設定**：✅ 已設定，且為必填欄位
- **描述**：Store logo 的替代文字

#### 2. 主橫幅區塊 (`mainBanner.ts`)
- **圖片欄位**：`backgroundImage`
- **Alt 設定**：✅ 已設定
- **描述**：背景圖片的替代文字，用於無障礙和 SEO 優化

#### 3. 圖文區塊 (`imageTextBlock.ts`)
- **圖片欄位**：`image`, `leftImage`, `rightImage`
- **Alt 設定**：✅ 全部已設定
- **描述**：
  - `image`：圖片的替代文字
  - `leftImage`：左側圖片的替代文字
  - `rightImage`：右側圖片的替代文字

#### 4. 服務卡片區塊 (`serviceCardSection.ts`)
- **圖片欄位**：`cardImage` (設計師專用圖片)
- **Alt 設定**：✅ 已設定
- **描述**：設計師專用圖片的替代文字

### ❌ 修復前遺漏 alt 欄位的圖片區塊

#### 1. 文章 Schema (`post.ts`) - 已修復 ✅
- **圖片欄位**：`mainImage` (封面圖片)
- **修復前狀態**：❌ 缺少 alt 欄位
- **修復後狀態**：✅ 已添加 alt 欄位
- **修復內容**：
  - 添加 alt 欄位
  - 設定為必填欄位
  - 添加描述：「封面圖片的替代文字，用於無障礙和 SEO 優化」

#### 2. 作者 Schema (`author.ts`) - 已修復 ✅
- **圖片欄位**：`image` (大頭照)
- **修復前狀態**：❌ 缺少 alt 欄位
- **修復後狀態**：✅ 已添加 alt 欄位
- **修復內容**：
  - 添加 alt 欄位
  - 設定為必填欄位
  - 添加 hotspot 選項
  - 添加描述：「作者大頭照的替代文字，用於無障礙和 SEO 優化」

### ✅ 無圖片欄位的區塊
以下區塊不包含圖片欄位，無需檢查：
- `contentSection.ts` - 一般內容區塊（僅文字內容）
- `youtubeSection.ts` - YouTube 影片區塊（使用影片網址）
- `featuredProducts.ts` - 精選商品區塊（使用 Medusa 商品資料）
- `blogSection.ts` - 部落格文章區塊（引用文章資料）

## 修復內容詳細說明

### 1. post.ts 修復
```typescript
// 修復前
{
  name: 'mainImage',
  title: '封面圖片',
  type: 'image',
  options: { hotspot: true },
},

// 修復後
{
  name: 'mainImage',
  title: '封面圖片',
  type: 'image',
  options: { hotspot: true },
  fields: [
    {
      name: 'alt',
      title: '替代文字',
      type: 'string',
      description: '封面圖片的替代文字，用於無障礙和 SEO 優化',
      validation: (Rule: any) => Rule.required().error('封面圖片的替代文字為必填欄位')
    }
  ]
}
```

### 2. author.ts 修復
```typescript
// 修復前
{ name: 'image', title: '大頭照', type: 'image' }

// 修復後
{ 
  name: 'image', 
  title: '大頭照', 
  type: 'image',
  options: { hotspot: true },
  fields: [
    {
      name: 'alt',
      title: '替代文字',
      type: 'string',
      description: '作者大頭照的替代文字，用於無障礙和 SEO 優化',
      validation: (Rule: any) => Rule.required().error('作者大頭照的替代文字為必填欄位')
    }
  ]
}
```

## 無障礙和 SEO 效益

### 無障礙改善
1. **螢幕閱讀器支援**：視障用戶可以透過 alt 文字了解圖片內容
2. **圖片載入失敗**：網路不穩時顯示替代文字
3. **符合 WCAG 標準**：達到網頁無障礙規範要求

### SEO 優化
1. **搜尋引擎索引**：Google 等搜尋引擎可以理解圖片內容
2. **圖片搜尋排名**：提升在 Google 圖片搜尋中的排名
3. **內容相關性**：增強頁面內容的語意完整性

## 後續建議

### 1. 內容管理最佳實務
- 編輯人員應該為所有圖片填寫有意義的 alt 文字
- Alt 文字應簡潔描述圖片內容，避免過於冗長
- 裝飾性圖片可以使用空的 alt 屬性

### 2. 定期檢查
- 建議每季檢查新增的 schema 是否包含 alt 欄位
- 監控內容編輯是否確實填寫 alt 文字

### 3. 開發指引
- 新增圖片欄位時必須包含 alt 子欄位
- 考慮設定為必填欄位以確保內容品質

## 檢查工具
可以使用以下命令檢查所有圖片是否有 alt 欄位：
```bash
grep -r "type: 'image'" sanity_cms/schemas/
```

## 總結
✅ **檢查完成**：所有 Sanity CMS 中的圖片欄位現在都已正確設定 alt 替代文字欄位  
✅ **符合標準**：達到 WCAG 無障礙規範和 SEO 最佳實務要求  
✅ **內容品質**：提升網站整體的無障礙性和搜尋引擎友善度
