import { Router } from "express"
import ecpayCallback from "./ecpay/callback"
import storeEcpay from "./store/ecpay"

export default () => {
  const router = Router()
  
  // 註冊綠界回調路由
  ecpayCallback(router)
  
  // 註冊商店 API 中的綠界支付表單生成路由
  storeEcpay(router)
  
  return router
}
