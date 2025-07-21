import { 
  defineMiddlewares,
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

console.log('🔧 Middlewares.ts loaded')

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/ecpay/*",
      middlewares: [
        (
          req: MedusaRequest,
          res: MedusaResponse,
          next: MedusaNextFunction
        ) => {
          console.log(`🔍 ECPay middleware hit for: ${req.path}`)
          
          if (req.path.includes('/ecpay/callback')) {
            console.log('🔓 Bypassing API key for ECPay callback')
            // 設定一個假的 API key 以通過驗證
            req.headers['x-publishable-api-key'] = 'pk_test_bypass_ecpay_callback'
          }
          
          next()
        }
      ]
    }
  ]
})
