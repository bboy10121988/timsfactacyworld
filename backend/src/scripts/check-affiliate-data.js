const { medusaIntegrationTestRunner } = require("medusa-test-utils")

medusaIntegrationTestRunner({
  testSuite: ({ getContainer }) => {
    describe("Check Affiliate Data", () => {
      let container

      beforeEach(async () => {
        container = getContainer()
      })

      it("should check affiliate partners and referrals", async () => {
        const affiliateService = container.resolve("affiliate")
        
        try {
          // 檢查聯盟夥伴
          const partners = await affiliateService.listAffiliatePartners({})
          console.log(`Found ${partners?.length || 0} affiliate partners:`)
          
          if (partners && partners.length > 0) {
            partners.forEach(partner => {
              console.log(`- ID: ${partner.id}, Name: ${partner.name}, Email: ${partner.email}, Code: ${partner.affiliate_code}`)
            })
            
            // 檢查第一個夥伴的推薦記錄
            const partnerId = partners[0].id
            const referrals = await affiliateService.listAffiliateReferrals({
              affiliate_partner_id: partnerId
            })
            
            console.log(`\nFound ${referrals?.length || 0} referrals for partner ${partnerId}:`)
            if (referrals && referrals.length > 0) {
              referrals.forEach(referral => {
                console.log(`- ID: ${referral.id}, Status: ${referral.status}, Commission: ${referral.commission_amount}`)
              })
            }
            
            // 檢查支付記錄
            const payments = await affiliateService.listAffiliatePayments({
              affiliate_partner_id: partnerId
            })
            
            console.log(`\nFound ${payments?.length || 0} payments for partner ${partnerId}:`)
            if (payments && payments.length > 0) {
              payments.forEach(payment => {
                console.log(`- ID: ${payment.id}, Amount: ${payment.amount}, Status: ${payment.status}`)
              })
            }
          } else {
            console.log("No affiliate partners found in database")
          }
          
        } catch (error) {
          console.error("Error checking affiliate data:", error)
        }
      })
    })
  },
})
