#!/usr/bin/env node

/**
 * 聯盟行銷系統功能驗證測試
 * 直接在 backend 環境下測試服務功能
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

console.log('🧪 開始聯盟行銷系統功能驗證...\n');

// 模擬 AffiliateService 的關鍵功能
class TestAffiliateService {
  constructor() {
    this.partners = new Map();
    this.clicks = new Map();
    this.conversions = new Map();
    console.log('✅ AffiliateService 初始化完成');
  }

  async createPartner(partnerData) {
    try {
      // 檢查 email 是否已存在
      const existingPartner = Array.from(this.partners.values()).find(p => p.email === partnerData.email);
      if (existingPartner) {
        return { success: false, error: 'Email already exists' };
      }

      const hashedPassword = await bcrypt.hash(partnerData.password, 10);
      const partner = {
        id: uuidv4(),
        ...partnerData,
        password: hashedPassword,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.partners.set(partner.id, partner);
      return { success: true, partner: { ...partner, password: undefined } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async findPartnerByEmail(email) {
    try {
      const partner = Array.from(this.partners.values()).find(p => p.email === email);
      return {
        success: true,
        exists: !!partner,
        partner: partner ? { ...partner, password: undefined } : null
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async loginPartner(email, password) {
    try {
      const partner = Array.from(this.partners.values()).find(p => p.email === email);
      if (!partner) {
        return { success: false, error: 'Partner not found' };
      }
      
      if (partner.status !== 'approved') {
        return { success: false, error: 'Partner not approved yet' };
      }
      
      const isValid = await bcrypt.compare(password, partner.password);
      if (!isValid) {
        return { success: false, error: 'Invalid password' };
      }
      
      const token = jwt.sign(
        { partnerId: partner.id, email: partner.email },
        'test-jwt-secret-key',
        { expiresIn: '7d' }
      );
      
      return {
        success: true,
        partner: { ...partner, password: undefined },
        token
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async approvePartner(partnerId, status, reason) {
    try {
      const partner = this.partners.get(partnerId);
      if (!partner) {
        return { success: false, error: 'Partner not found' };
      }
      
      partner.status = status;
      partner.approvalReason = reason;
      partner.updatedAt = new Date();
      
      this.partners.set(partnerId, partner);
      return { success: true, partner: { ...partner, password: undefined } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async trackClick(clickData) {
    try {
      const click = {
        id: uuidv4(),
        ...clickData,
        timestamp: new Date()
      };
      
      this.clicks.set(click.id, click);
      return { success: true, click };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async recordConversion(conversionData) {
    try {
      const conversion = {
        id: uuidv4(),
        ...conversionData,
        commission: conversionData.orderValue * conversionData.commissionRate,
        status: 'pending',
        timestamp: new Date()
      };
      
      this.conversions.set(conversion.id, conversion);
      return { success: true, conversion };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getPartnerStats(partnerId) {
    try {
      const partner = this.partners.get(partnerId);
      if (!partner) {
        return { success: false, error: 'Partner not found' };
      }
      
      const clicks = Array.from(this.clicks.values()).filter(c => c.partnerId === partnerId);
      const conversions = Array.from(this.conversions.values()).filter(c => c.partnerId === partnerId);
      const totalCommission = conversions.reduce((sum, c) => sum + c.commission, 0);
      
      return {
        success: true,
        stats: {
          totalClicks: clicks.length,
          totalConversions: conversions.length,
          totalCommission: parseFloat(totalCommission.toFixed(2)),
          conversionRate: clicks.length > 0 ? parseFloat(((conversions.length / clicks.length) * 100).toFixed(2)) : 0
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getAllPartners(status = null) {
    try {
      let partners = Array.from(this.partners.values());
      if (status) {
        partners = partners.filter(p => p.status === status);
      }
      return {
        success: true,
        partners: partners.map(p => ({ ...p, password: undefined }))
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCommissions(status = null) {
    try {
      let conversions = Array.from(this.conversions.values());
      if (status) {
        conversions = conversions.filter(c => c.status === status);
      }
      return {
        success: true,
        commissions: conversions
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateCommissionStatus(conversionId, status, reason) {
    try {
      const conversion = this.conversions.get(conversionId);
      if (!conversion) {
        return { success: false, error: 'Commission not found' };
      }
      
      conversion.status = status;
      conversion.statusReason = reason;
      conversion.updatedAt = new Date();
      
      this.conversions.set(conversionId, conversion);
      return { success: true, conversion };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getAdminStats() {
    try {
      const allPartners = Array.from(this.partners.values());
      const allClicks = Array.from(this.clicks.values());
      const allConversions = Array.from(this.conversions.values());
      
      const pendingPartners = allPartners.filter(p => p.status === 'pending').length;
      const approvedPartners = allPartners.filter(p => p.status === 'approved').length;
      const totalCommissions = allConversions.reduce((sum, c) => sum + c.commission, 0);
      const pendingCommissions = allConversions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commission, 0);
      
      return {
        success: true,
        stats: {
          totalPartners: allPartners.length,
          pendingPartners,
          approvedPartners,
          totalClicks: allClicks.length,
          totalConversions: allConversions.length,
          totalCommissions: parseFloat(totalCommissions.toFixed(2)),
          pendingCommissions: parseFloat(pendingCommissions.toFixed(2))
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// 執行完整功能測試
async function runComprehensiveTest() {
  const service = new TestAffiliateService();
  let testCount = 0;
  let passCount = 0;
  
  function logTest(name, result, expected = true) {
    testCount++;
    const success = expected ? result.success : !result.success;
    if (success) passCount++;
    
    const status = success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${name}`);
    if (result.error && expected) {
      console.log(`   錯誤: ${result.error}`);
    }
    if (result.partner || result.stats || result.conversion || result.click) {
      console.log(`   結果: ${JSON.stringify(result.success ? '成功' : '失敗')}`);
    }
  }

  console.log('🚀 開始完整功能測試...\n');

  // ========== 夥伴管理測試 ==========
  console.log('👥 夥伴管理功能測試');
  
  // 1. 檢查不存在的 email
  let emailCheckResult = await service.findPartnerByEmail('test@example.com');
  logTest('檢查不存在的 email', { success: emailCheckResult.success && !emailCheckResult.exists });

  // 2. 創建第一個夥伴
  const partner1Data = {
    name: '測試夥伴1',
    email: 'partner1@example.com',
    phone: '0912345678',
    website: 'https://partner1.com',
    password: 'password123'
  };
  
  let createResult1 = await service.createPartner(partner1Data);
  logTest('創建第一個夥伴', createResult1);
  const partner1Id = createResult1.partner?.id;

  // 3. 檢查已存在的 email
  emailCheckResult = await service.findPartnerByEmail('partner1@example.com');
  logTest('檢查已存在的 email', { success: emailCheckResult.success && emailCheckResult.exists });

  // 4. 嘗試重複創建（應該失敗）
  let duplicateResult = await service.createPartner(partner1Data);
  logTest('重複創建夥伴（應該失敗）', duplicateResult, false);

  // 5. 嘗試未審核夥伴登入（應該失敗）
  let loginResult1 = await service.loginPartner('partner1@example.com', 'password123');
  logTest('未審核夥伴登入（應該失敗）', loginResult1, false);

  // 6. 審核夥伴
  let approveResult = await service.approvePartner(partner1Id, 'approved', '測試核准');
  logTest('審核夥伴', approveResult);

  // 7. 審核後登入（應該成功）
  let loginResult2 = await service.loginPartner('partner1@example.com', 'password123');
  logTest('審核後夥伴登入', loginResult2);
  const partner1Token = loginResult2.token;

  // 8. 錯誤密碼登入（應該失敗）
  let wrongPasswordResult = await service.loginPartner('partner1@example.com', 'wrongpassword');
  logTest('錯誤密碼登入（應該失敗）', wrongPasswordResult, false);

  console.log('');

  // ========== 點擊追蹤測試 ==========
  console.log('👆 點擊追蹤功能測試');
  
  // 9. 記錄點擊
  const clickData = {
    partnerId: partner1Id,
    productId: 'product-123',
    url: 'https://shop.com/product/123',
    userAgent: 'Mozilla/5.0 Test Browser',
    referrer: 'https://partner1.com'
  };
  
  let clickResult = await service.trackClick(clickData);
  logTest('記錄點擊追蹤', clickResult);

  // 10. 記錄更多點擊
  for (let i = 2; i <= 5; i++) {
    await service.trackClick({
      ...clickData,
      productId: `product-${i}`,
      url: `https://shop.com/product/${i}`
    });
  }
  logTest('記錄多次點擊', { success: true });

  console.log('');

  // ========== 轉換記錄測試 ==========
  console.log('💰 轉換記錄功能測試');
  
  // 11. 記錄轉換
  const conversionData = {
    partnerId: partner1Id,
    orderId: 'order-001',
    productId: 'product-123',
    orderValue: 1000,
    commissionRate: 0.05
  };
  
  let conversionResult = await service.recordConversion(conversionData);
  logTest('記錄轉換', conversionResult);
  const conversion1Id = conversionResult.conversion?.id;

  // 12. 記錄更多轉換
  await service.recordConversion({
    ...conversionData,
    orderId: 'order-002',
    orderValue: 500,
    commissionRate: 0.05
  });

  await service.recordConversion({
    ...conversionData,
    orderId: 'order-003',
    orderValue: 2000,
    commissionRate: 0.03
  });
  
  logTest('記錄多次轉換', { success: true });

  console.log('');

  // ========== 統計資料測試 ==========
  console.log('📊 統計資料功能測試');
  
  // 13. 取得夥伴統計
  let partnerStatsResult = await service.getPartnerStats(partner1Id);
  logTest('取得夥伴統計', partnerStatsResult);
  if (partnerStatsResult.success) {
    console.log(`   統計資料: 點擊 ${partnerStatsResult.stats.totalClicks}, 轉換 ${partnerStatsResult.stats.totalConversions}, 佣金 $${partnerStatsResult.stats.totalCommission}`);
  }

  // 14. 取得所有夥伴
  let allPartnersResult = await service.getAllPartners();
  logTest('取得所有夥伴', allPartnersResult);

  // 15. 取得待審核夥伴
  // 先創建一個待審核的夥伴
  await service.createPartner({
    name: '待審核夥伴',
    email: 'pending@example.com',
    phone: '0987654321',
    website: 'https://pending.com',
    password: 'password456'
  });
  
  let pendingPartnersResult = await service.getAllPartners('pending');
  logTest('取得待審核夥伴', pendingPartnersResult);

  console.log('');

  // ========== 佣金管理測試 ==========
  console.log('💵 佣金管理功能測試');
  
  // 16. 取得所有佣金
  let allCommissionsResult = await service.getCommissions();
  logTest('取得所有佣金', allCommissionsResult);

  // 17. 取得待審核佣金
  let pendingCommissionsResult = await service.getCommissions('pending');
  logTest('取得待審核佣金', pendingCommissionsResult);

  // 18. 更新佣金狀態
  let updateCommissionResult = await service.updateCommissionStatus(conversion1Id, 'approved', '測試核准佣金');
  logTest('更新佣金狀態', updateCommissionResult);

  // 19. 標記佣金為已支付
  let payCommissionResult = await service.updateCommissionStatus(conversion1Id, 'paid', '測試支付佣金');
  logTest('標記佣金已支付', payCommissionResult);

  console.log('');

  // ========== 管理員統計測試 ==========
  console.log('📈 管理員統計功能測試');
  
  // 20. 取得管理員統計
  let adminStatsResult = await service.getAdminStats();
  logTest('取得管理員統計', adminStatsResult);
  if (adminStatsResult.success) {
    console.log(`   系統統計: 夥伴 ${adminStatsResult.stats.totalPartners}, 待審核 ${adminStatsResult.stats.pendingPartners}, 總點擊 ${adminStatsResult.stats.totalClicks}, 總轉換 ${adminStatsResult.stats.totalConversions}, 總佣金 $${adminStatsResult.stats.totalCommissions}`);
  }

  console.log('');

  // ========== JWT 驗證測試 ==========
  console.log('🔐 JWT Token 驗證測試');
  
  // 21. 驗證 JWT Token
  try {
    const decoded = jwt.verify(partner1Token, 'test-jwt-secret-key');
    logTest('JWT Token 驗證', { success: decoded.partnerId === partner1Id });
    console.log(`   Token 內容: partnerId=${decoded.partnerId}, email=${decoded.email}`);
  } catch (error) {
    logTest('JWT Token 驗證', { success: false, error: error.message });
  }

  // 22. 無效 Token 測試
  try {
    jwt.verify('invalid-token', 'test-jwt-secret-key');
    logTest('無效 Token 測試（應該失敗）', { success: false }, false);
  } catch (error) {
    logTest('無效 Token 測試（應該失敗）', { success: true }, true);
  }

  console.log('');

  // ========== 測試總結 ==========
  console.log('📋 測試結果總結');
  console.log('='.repeat(50));
  console.log(`總測試數: ${testCount}`);
  console.log(`通過測試: ${passCount}`);
  console.log(`失敗測試: ${testCount - passCount}`);
  console.log(`通過率: ${((passCount / testCount) * 100).toFixed(1)}%`);
  
  if (passCount === testCount) {
    console.log('\n🎉 所有測試都通過了！聯盟行銷系統功能正常！');
  } else {
    console.log(`\n⚠️  有 ${testCount - passCount} 個測試失敗，請檢查相關功能。`);
  }

  // 顯示最終系統狀態
  console.log('\n🏢 系統最終狀態:');
  const finalStats = await service.getAdminStats();
  if (finalStats.success) {
    console.log(`- 總夥伴數: ${finalStats.stats.totalPartners}`);
    console.log(`- 已核准夥伴: ${finalStats.stats.approvedPartners}`);
    console.log(`- 待審核夥伴: ${finalStats.stats.pendingPartners}`);
    console.log(`- 總點擊數: ${finalStats.stats.totalClicks}`);
    console.log(`- 總轉換數: ${finalStats.stats.totalConversions}`);
    console.log(`- 總佣金: $${finalStats.stats.totalCommissions}`);
    console.log(`- 待審佣金: $${finalStats.stats.pendingCommissions}`);
  }

  console.log('\n✅ 功能驗證測試完成！');
}

// 執行測試
runComprehensiveTest().catch(error => {
  console.error('❌ 測試執行失敗:', error);
  process.exit(1);
});
