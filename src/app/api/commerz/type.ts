export interface SSLInitResponse {
  status: string
  failedreason: string
  sessionkey: string
  gw: {
    visa: string
    master: string
    amex: string
    othercards: string
    internetbanking: string
    mobilebanking: string
  }
  redirectGatewayURL: string
  directPaymentURLBank: string
  directPaymentURLCard: string
  directPaymentURL: string
  redirectGatewayURLFailed: string
  GatewayPageURL: string
  storeBanner: string
  storeLogo: string
  desc: Array<{
    name: string
    type: string
    logo: string
    gw: string
    r_flag?: string
    redirectGatewayURL?: string
  }>
  is_direct_pay_enable: string
}
