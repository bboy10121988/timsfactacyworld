/**
 * 將包含換行符的文字內容轉換為適當的 HTML 段落結構
 * @param content 原始文字內容
 * @returns 格式化後的 HTML 字符串
 */
export function formatTextContent(content: string): string {
  if (!content) return '';
  
  // 將雙換行符（空行）分割為段落
  const paragraphs = content
    .split(/\n\s*\n/) // 按照雙換行符分割
    .map(paragraph => paragraph.trim()) // 移除首尾空白
    .filter(paragraph => paragraph.length > 0); // 移除空段落
  
  // 將每個段落包裝在 <p> 標籤中
  const formattedParagraphs = paragraphs.map(paragraph => {
    // 將單換行符轉換為 <br> 標籤（保留段落內的換行）
    const paragraphWithBreaks = paragraph.replace(/\n/g, '<br>');
    return `<p class="mb-4">${paragraphWithBreaks}</p>`;
  });
  
  return formattedParagraphs.join('');
}

/**
 * React 組件中使用的格式化函數
 * @param content 原始文字內容
 * @returns 可以直接用於 dangerouslySetInnerHTML 的對象
 */
export function formatContentForReact(content: string): { __html: string } {
  return { __html: formatTextContent(content) };
}
