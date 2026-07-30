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


export interface SSLIPNRequest{
  tran_id: string
  val_id: string
  amount: number
  card_type: string
  store_amount: string
  card_no: string
  bank_tran_id: string
  status: "VALID"|"FAILED"|"CANCELLED"|"EXPIRED"|"UNATTEMPTED"
  tran_date: Date
  currency: string
  card_issuer: string
  card_brand: string
  card_issuer_country: string
  card_issuer_country_code: string
  store_id: string
  verify_sign: string
  verify_key: string
  cus_fax: string
  currency_type: string
  currency_amount: number
  currency_rate: string
  base_fair: string
  value_a: string
  value_b: string
  value_c: string
  value_d: string
  risk_level: 1 | 0
  risk_title: string
}

export interface SSLVerifyResponse{
  status: "VALID"|"FAILED"|"CANCELLED"|"EXPIRED"|"UNATTEMPTED"
  tran_date: Date
  tran_id: string
  val_id: string
  amount: string
  store_amount: string
  currency: string
  bank_tran_id: string
  card_type: string
  card_no: string
  card_issuer: string
  card_brand: string
  card_issuer_country: string
  card_issuer_country_code: string
  currency_type: string
  currency_amount: string
  currency_rate: string
  base_fair: string
  value_a: string
  value_b: string
  value_c: string
  value_d: string
  emi_instalment: string
  emi_amount: string
  emi_description: string
  emi_issuer: string
  account_details: string
  risk_title: string
  risk_level: 1 | 0
  APIConnect: string
  validated_on: Date
  gw_version: string
}