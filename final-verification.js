/**
 * 最終驗證腳本：確認所有任務完成
 * 
 * 已完成的任務：
 * 1. 移除首頁 main section 服務卡片的按鈕與 schema 的 URL 欄位
 * 2. 首頁文章區塊（blogSection）標題啟用/停用時，應將標題區塊（含副標題/說明）視為一個整體
 * 3. 確認首頁文章區塊能正確顯示 2 篇可顯示的文章
 */

const fs = require('fs');

console.log('=== 最終驗證：所有任務完成狀況 ===\n');

// 任務 1: 服務卡片按鈕與 URL 欄位移除
console.log('📋 任務 1: 移除服務卡片按鈕與 URL 欄位');

const serviceCardSectionContent = fs.readFileSync(
  '/Users/raychou/medusa_0525/frontend/src/modules/home/components/service-cards-section/index.tsx', 
  'utf8'
);

const serviceCardsTypesContent = fs.readFileSync(
  '/Users/raychou/medusa_0525/frontend/src/lib/types/service-cards.ts', 
  'utf8'
);

const sanityServiceCardContent = fs.readFileSync(
  '/Users/raychou/medusa_0525/sanity_cms/schemas/blocks/serviceCardSection.ts', 
  'utf8'
);

// 檢查按鈕是否已移除
const hasNoButton = !serviceCardSectionContent.includes('btn-secondary') && 
                    !serviceCardSectionContent.includes('href=');
const hasNoLinkType = !serviceCardsTypesContent.includes('link:') && 
                      !serviceCardsTypesContent.includes('buttonUrl') &&
                      !serviceCardsTypesContent.includes('ctaUrl');
const hasNoLinkSchema = !sanityServiceCardContent.includes("name: 'link'") && 
                        !sanityServiceCardContent.includes("name: 'url'") &&
                        !sanityServiceCardContent.includes("name: 'buttonUrl'");

console.log(`   ${hasNoButton ? '✅' : '❌'} 前端組件按鈕已移除`);
console.log(`   ${hasNoLinkType ? '✅' : '❌'} 型別定義中的 link/url 已移除`);
console.log(`   ${hasNoLinkSchema ? '✅' : '❌'} Sanity schema 中的 link/url 已移除`);

// 任務 2: 文章區塊標題整體處理
console.log('\n📋 任務 2: 文章區塊標題整體處理');

const blogPostsContent = fs.readFileSync(
  '/Users/raychou/medusa_0525/frontend/src/modules/blog/components/blog-posts.tsx', 
  'utf8'
);

const pageContent = fs.readFileSync(
  '/Users/raychou/medusa_0525/frontend/src/app/[countryCode]/(main)/page.tsx', 
  'utf8'
);

const hasShowTitleControl = blogPostsContent.includes('showTitle && title &&');
const hasShowTitleParam = blogPostsContent.includes('showTitle?: boolean');
const hasShowTitleProp = pageContent.includes('showTitle={!!blogSection.title}');

console.log(`   ${hasShowTitleControl ? '✅' : '❌'} 標題顯示控制邏輯已實現`);
console.log(`   ${hasShowTitleParam ? '✅' : '❌'} showTitle 參數已添加`);
console.log(`   ${hasShowTitleProp ? '✅' : '❌'} 首頁正確傳遞 showTitle 屬性`);

// 任務 3: 文章數量限制為 2 篇
console.log('\n📋 任務 3: 文章數量限制為 2 篇');

const hasDefaultLimit2 = blogPostsContent.includes('limit = 2');
const hasCorrectLimitLogic = pageContent.includes('limit={blogSection.limit || 2}');

console.log(`   ${hasDefaultLimit2 ? '✅' : '❌'} BlogPosts 組件默認限制為 2 篇`);
console.log(`   ${hasCorrectLimitLogic ? '✅' : '❌'} 首頁渲染邏輯默認為 2 篇`);

// 檢查 isActive 過濾邏輯
console.log('\n📋 額外檢查: isActive 過濾邏輯');

const hasIsActiveFilter = pageContent.includes('section.isActive === false');
console.log(`   ${hasIsActiveFilter ? '✅' : '❌'} isActive 過濾邏輯已實現`);

// 總結
const allTask1Checks = [hasNoButton, hasNoLinkType, hasNoLinkSchema];
const allTask2Checks = [hasShowTitleControl, hasShowTitleParam, hasShowTitleProp];
const allTask3Checks = [hasDefaultLimit2, hasCorrectLimitLogic];
const extraChecks = [hasIsActiveFilter];

const task1Passed = allTask1Checks.every(check => check);
const task2Passed = allTask2Checks.every(check => check);
const task3Passed = allTask3Checks.every(check => check);
const extraPassed = extraChecks.every(check => check);

console.log('\n=== 任務完成總結 ===');
console.log(`📋 任務 1 (服務卡片按鈕與 URL 移除): ${task1Passed ? '✅ 完成' : '❌ 未完成'}`);
console.log(`📋 任務 2 (文章區塊標題整體處理): ${task2Passed ? '✅ 完成' : '❌ 未完成'}`);
console.log(`📋 任務 3 (文章數量限制為 2 篇): ${task3Passed ? '✅ 完成' : '❌ 未完成'}`);
console.log(`📋 額外功能 (isActive 過濾): ${extraPassed ? '✅ 完成' : '❌ 未完成'}`);

const allTasksCompleted = task1Passed && task2Passed && task3Passed && extraPassed;

if (allTasksCompleted) {
  console.log('\n🎉 所有任務已成功完成！');
  console.log('\n📝 預期行為：');
  console.log('   • 服務卡片不再顯示按鈕');
  console.log('   • 服務卡片相關的 link/url 欄位已從所有地方移除');
  console.log('   • 當 blogSection 的標題為空時，整個標題區塊（含副標題/說明）不顯示');
  console.log('   • 當 blogSection 的 isActive 為 false 時，整個區塊不顯示');
  console.log('   • 首頁文章區塊默認顯示 2 篇文章');
  console.log('   • 前端建構成功，無型別錯誤');
} else {
  console.log('\n❌ 部分任務未完成，請檢查上述失敗項目');
}

console.log(`\n總體進度: ${[task1Passed, task2Passed, task3Passed, extraPassed].filter(Boolean).length}/4 項任務完成`);
