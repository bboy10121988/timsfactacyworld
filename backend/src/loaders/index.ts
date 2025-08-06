import EcpayService from "../services/ecpay"

export default {
  ecpayService: {
    resolve: () => EcpayService,
    scope: "singleton",
  },
}
