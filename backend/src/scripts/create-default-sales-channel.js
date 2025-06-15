/**
 * 創建默認銷售渠道
 * 使用方式: npx medusa exec create-default-sales-channel.js
 */

module.exports = async ({ container }) => {
  // 獲取必要的服務
  const salesChannelService = container.resolve('salesChannelService');
  
  try {
    // 檢查是否已存在預設銷售渠道
    const existingChannels = await salesChannelService.list({});
    
    if (existingChannels.length === 0) {
      // 創建預設銷售渠道
      const defaultChannel = await salesChannelService.create({
        name: "Default Sales Channel",
        description: "Default sales channel for storefront",
        is_disabled: false
      });
      
      console.log("成功創建預設銷售渠道:", defaultChannel.id);
      return { success: true, channel: defaultChannel };
    } else {
      console.log("已存在銷售渠道，總數:", existingChannels.length);
      console.log("第一個銷售渠道:", existingChannels[0].id, existingChannels[0].name);
      return { success: true, channels: existingChannels };
    }
  } catch (error) {
    console.error("創建銷售渠道時出錯:", error);
    return { success: false, error: error.message };
  }
};
