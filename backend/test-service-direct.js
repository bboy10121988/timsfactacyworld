const { Client } = require('pg')

// 模擬 Medusa 請求和服務上下文
const mockContainer = {
  resolve: (serviceName) => {
    if (serviceName === 'affiliate') {
      return new AffiliateMinimalService();
    }
    if (serviceName === 'query') {
      return mockQuery;
    }
    throw new Error(`Service ${serviceName} not found`);
  }
};

const mockQuery = async (sql, params = []) => {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'medusa_0525',
    user: 'raychou',
    password: '1012'
  });
  
  try {
    await client.connect();
    const result = await client.query(sql, params);
    return result.rows;
  } finally {
    await client.end();
  }
};

// 簡化的 AffiliateMinimalService 模擬
class AffiliateMinimalService {
  constructor() {
    this.query = mockQuery;
  }

  async trackClick(affiliateCode, userAgent = null, ipAddress = null) {
    try {
      // 驗證夥伴代碼
      const partners = await this.query(
        'SELECT * FROM affiliate_partner WHERE affiliate_code = $1 AND status = $2',
        [affiliateCode, 'active']
      );

      if (partners.length === 0) {
        throw new Error('Invalid affiliate code or partner not active');
      }

      const partnerId = partners[0].id;
      const clickId = `click_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;

      // 記錄點擊到 affiliate_referral 表
      await this.query(`
        INSERT INTO affiliate_referral (
          id, affiliate_partner_id, referral_code, ip_address, user_agent, 
          status, clicked_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), NOW())
      `, [clickId, partnerId, affiliateCode, ipAddress, userAgent, 'pending']);

      console.log(`✅ 點擊記錄成功: ${clickId}`);
      return { clickId, success: true };
      
    } catch (error) {
      console.error('❌ 點擊記錄失敗:', error);
      throw error;
    }
  }

  async getPartnerStats(partnerId) {
    try {
      const stats = await this.query(`
        SELECT 
          COUNT(*) as total_clicks,
          COUNT(CASE WHEN order_id IS NOT NULL THEN 1 END) as conversions,
          COALESCE(SUM(CASE WHEN order_id IS NOT NULL THEN commission_amount ELSE 0 END), 0) as total_earnings,
          COALESCE(AVG(CASE WHEN order_id IS NOT NULL THEN commission_amount ELSE NULL END), 0) as avg_commission
        FROM affiliate_referral
        WHERE affiliate_partner_id = $1
      `, [partnerId]);

      if (stats.length > 0) {
        return {
          totalClicks: parseInt(stats[0].total_clicks),
          conversions: parseInt(stats[0].conversions),
          totalEarnings: parseFloat(stats[0].total_earnings) / 100, // 轉換為元
          avgCommission: parseFloat(stats[0].avg_commission) / 100
        };
      }

      return { totalClicks: 0, conversions: 0, totalEarnings: 0, avgCommission: 0 };
      
    } catch (error) {
      console.error('❌ 統計查詢失敗:', error);
      throw error;
    }
  }
}

// 測試功能
async function testServiceFunctions() {
  console.log('🧪 測試 AffiliateMinimalService 功能...\n');
  
  const service = new AffiliateMinimalService();
  
  try {
    // 測試點擊追蹤
    console.log('1. 測試點擊追蹤:');
    const trackResult = await service.trackClick('AF633804XWI7KU', 'test-browser', '127.0.0.1');
    console.log('點擊追蹤結果:', trackResult);
    
    // 測試統計查詢
    console.log('\n2. 測試統計查詢:');
    // 先查找合作夥伴 ID
    const partners = await mockQuery(
      'SELECT id, name FROM affiliate_partner WHERE affiliate_code = $1',
      ['AF633804XWI7KU']
    );
    
    if (partners.length > 0) {
      const stats = await service.getPartnerStats(partners[0].id);
      console.log(`夥伴 "${partners[0].name}" 統計:`, stats);
    } else {
      console.log('找不到夥伴數據');
    }
    
    // 驗證資料庫記錄
    console.log('\n3. 驗證資料庫記錄:');
    const recentReferrals = await mockQuery(`
      SELECT ar.*, ap.name as partner_name 
      FROM affiliate_referral ar
      JOIN affiliate_partner ap ON ar.affiliate_partner_id = ap.id
      ORDER BY ar.created_at DESC 
      LIMIT 5
    `);
    
    console.log('最近的推薦記錄:');
    recentReferrals.forEach(record => {
      console.log(`- ${record.partner_name}: ${record.referral_code} (狀態: ${record.status})`);
    });
    
    console.log('\n✅ 所有測試完成，服務功能正常！');
    
  } catch (error) {
    console.error('\n❌ 測試失敗:', error);
  }
}

// 執行測試
testServiceFunctions();
