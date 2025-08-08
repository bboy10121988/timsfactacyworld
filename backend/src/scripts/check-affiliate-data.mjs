import pkg from "@medusajs/framework"
const { loadEnv } = pkg

loadEnv(process.env.NODE_ENV || "development", process.cwd())

const checkAffiliateData = async () => {
  const { medusaContainer } = await import("@medusajs/framework")
  
  // 初始化 Medusa 容器
  const container = await medusaContainer(process.cwd())
  
  try {
    const affiliateService = container.resolve("affiliate")
    
    // 檢查聯盟夥伴
    const partners = await affiliateService.listAffiliatePartners({})
    console.log(`Found ${partners?.length || 0} affiliate partners:`)
    
    if (partners && partners.length > 0) {
      for (const partner of partners) {
        console.log(`\n📊 Partner: ${partner.name} (${partner.email})`)
        console.log(`   Code: ${partner.affiliate_code}`)
        console.log(`   Status: ${partner.status}`)
        console.log(`   Commission: ${partner.commission_rate} (${partner.commission_type})`)
        
        // 檢查這個夥伴的推薦記錄
        const referrals = await affiliateService.listAffiliateReferrals({
          affiliate_partner_id: partner.id
        })
        
        console.log(`   📈 Referrals: ${referrals?.length || 0}`)
        if (referrals && referrals.length > 0) {
          referrals.forEach(referral => {
            console.log(`      - ${referral.id}: ${referral.status}, Commission: ${referral.commission_amount}`)
          })
        }
        
        // 檢查支付記錄
        const payments = await affiliateService.listAffiliatePayments({
          affiliate_partner_id: partner.id
        })
        
        console.log(`   💰 Payments: ${payments?.length || 0}`)
        if (payments && payments.length > 0) {
          payments.forEach(payment => {
            console.log(`      - ${payment.id}: ${payment.amount}, Status: ${payment.status}`)
          })
        }
      }
    } else {
      console.log("❌ No affiliate partners found in database")
    }
    
  } catch (error) {
    console.error("❌ Error checking affiliate data:", error)
  }
  
  process.exit(0)
}

checkAffiliateData()
