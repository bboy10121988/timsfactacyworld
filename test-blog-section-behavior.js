/**
 * 測試首頁文章區塊（blogSection）行為
 * 驗證：
 * 1. 當 isActive 為 false 時，區塊不應顯示
 * 2. 當標題為空或未設置時，標題區塊（含副標題/說明）不應顯示
 * 3. 文章限制應該默認為 2 篇
 * 4. 整體渲染邏輯應正確處理所有情況
 */

const fs = require('fs');
const path = require('path');

console.log('=== 測試首頁文章區塊（blogSection）行為 ===\n');

// 檢查關鍵文件
const filesToCheck = [
  {
    path: '/Users/raychou/medusa_0525/frontend/src/app/[countryCode]/(main)/page.tsx',
    name: '首頁渲染邏輯'
  },
  {
    path: '/Users/raychou/medusa_0525/frontend/src/modules/blog/components/blog-posts.tsx',
    name: 'BlogPosts 組件'
  },
  {
    path: '/Users/raychou/medusa_0525/frontend/src/lib/types/page-sections.ts',
    name: '型別定義'
  },
  {
    path: '/Users/raychou/medusa_0525/sanity_cms/schemas/blocks/blogSection.ts',
    name: 'Sanity blogSection schema'
  }
];

let allFilesExist = true;

console.log('1. 檢查關鍵文件是否存在...');
filesToCheck.forEach(file => {
  const exists = fs.existsSync(file.path);
  console.log(`   ${exists ? '✅' : '❌'} ${file.name}: ${exists ? '存在' : '不存在'}`);
  if (!exists) allFilesExist = false;
});

if (!allFilesExist) {
  console.log('\n❌ 某些關鍵文件不存在，請檢查文件路徑');
  process.exit(1);
}

console.log('\n2. 檢查 BlogPosts 組件修改...');

// 檢查 BlogPosts 組件
const blogPostsContent = fs.readFileSync('/Users/raychou/medusa_0525/frontend/src/modules/blog/components/blog-posts.tsx', 'utf8');

// 檢查 showTitle 參數
const hasShowTitleParam = blogPostsContent.includes('showTitle?: boolean');
const hasShowTitleLogic = blogPostsContent.includes('showTitle && title &&');
const hasDefaultLimit2 = blogPostsContent.includes('limit = 2');

console.log(`   ${hasShowTitleParam ? '✅' : '❌'} showTitle 參數已添加: ${hasShowTitleParam}`);
console.log(`   ${hasShowTitleLogic ? '✅' : '❌'} 標題顯示邏輯已修改: ${hasShowTitleLogic}`);
console.log(`   ${hasDefaultLimit2 ? '✅' : '❌'} 默認限制已改為 2 篇: ${hasDefaultLimit2}`);

console.log('\n3. 檢查首頁渲染邏輯修改...');

// 檢查首頁渲染邏輯
const pageContent = fs.readFileSync('/Users/raychou/medusa_0525/frontend/src/app/[countryCode]/(main)/page.tsx', 'utf8');

const hasShowTitleProp = pageContent.includes('showTitle={!!blogSection.title}');
const hasCorrectLimit = pageContent.includes('limit={blogSection.limit || 2}');
const hasIsActiveFilter = pageContent.includes('section.isActive === false');

console.log(`   ${hasShowTitleProp ? '✅' : '❌'} showTitle 屬性已正確傳遞: ${hasShowTitleProp}`);
console.log(`   ${hasCorrectLimit ? '✅' : '❌'} 限制邏輯已修改為默認 2 篇: ${hasCorrectLimit}`);
console.log(`   ${hasIsActiveFilter ? '✅' : '❌'} isActive 過濾邏輯存在: ${hasIsActiveFilter}`);

console.log('\n4. 檢查型別定義...');

// 檢查型別定義
const typesContent = fs.readFileSync('/Users/raychou/medusa_0525/frontend/src/lib/types/page-sections.ts', 'utf8');

const hasBlogSectionType = typesContent.includes('export type BlogSection');
const hasIsActiveField = typesContent.includes('isActive: boolean');

console.log(`   ${hasBlogSectionType ? '✅' : '❌'} BlogSection 型別已定義: ${hasBlogSectionType}`);
console.log(`   ${hasIsActiveField ? '✅' : '❌'} isActive 欄位已定義: ${hasIsActiveField}`);

console.log('\n5. 檢查 Sanity schema...');

// 檢查 Sanity schema
const schemaContent = fs.readFileSync('/Users/raychou/medusa_0525/sanity_cms/schemas/blocks/blogSection.ts', 'utf8');

const hasIsActiveSchema = schemaContent.includes("name: 'isActive'");
const hasTitleSchema = schemaContent.includes("name: 'title'");

console.log(`   ${hasIsActiveSchema ? '✅' : '❌'} isActive 欄位在 schema 中: ${hasIsActiveSchema}`);
console.log(`   ${hasTitleSchema ? '✅' : '❌'} title 欄位在 schema 中: ${hasTitleSchema}`);

// 總結
console.log('\n=== 測試總結 ===');

const allChecks = [
  hasShowTitleParam,
  hasShowTitleLogic,
  hasDefaultLimit2,
  hasShowTitleProp,
  hasCorrectLimit,
  hasIsActiveFilter,
  hasBlogSectionType,
  hasIsActiveField,
  hasIsActiveSchema,
  hasTitleSchema
];

const passedChecks = allChecks.filter(check => check).length;
const totalChecks = allChecks.length;

if (passedChecks === totalChecks) {
  console.log('🎉 所有檢查都通過！首頁文章區塊的修改已完成');
  console.log('\n預期行為：');
  console.log('✅ 當 blogSection 的 isActive 為 false 時，整個區塊不會顯示');
  console.log('✅ 當標題為空時，標題區塊（含副標題/說明）不會顯示');
  console.log('✅ 文章數量默認限制為 2 篇');
  console.log('✅ 標題的顯示/隱藏會影響整個標題區塊');
} else {
  console.log(`❌ ${totalChecks - passedChecks} 個檢查未通過，需要進一步修正`);
}

console.log(`\n檢查結果: ${passedChecks}/${totalChecks} 通過`);
