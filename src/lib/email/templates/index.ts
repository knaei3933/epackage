/**
 * Email Templates Index
 *
 * メールテンプレート一覧
 * すべてのメールテンプレートをエクスポート
 */

export { subject, plainText, html } from './quote_created_admin'
export { subject as subjectQuoteApproved, plainText as plainTextQuoteApproved, html as htmlQuoteApproved } from './quote_approved_customer'
export { subject as subjectContractSent, plainText as plainTextContractSent, html as htmlContractSent } from './contract_sent'
export { subject as subjectContractSigned, plainText as plainTextContractSigned, html as htmlContractSigned } from './contract_signed_admin'
export { subject as subjectProductionUpdate, plainText as plainTextProductionUpdate, html as htmlProductionUpdate } from './production_update'
export { subject as subjectShipped, plainText as plainTextShipped, html as htmlShipped } from './shipped'
export { subject as subjectUserApproved, plainText as plainTextUserApproved, html as htmlUserApproved } from './user_approved'
export { subject as subjectPremiumContentDownload, plainText as plainTextPremiumContentDownload, html as htmlPremiumContentDownload } from './premium_content_download'
export { subject as subjectContractSignatureRequest, plainText as plainTextContractSignatureRequest, html as htmlContractSignatureRequest } from './contract_signature_request'
export { subject as subjectOrderStatusUpdated, plainText as plainTextOrderStatusUpdated, html as htmlOrderStatusUpdated } from './order_status_updated'

/**
 * テンプレートIDとテンプレート関数のマッピング
 */
import * as quoteCreatedAdmin from './quote_created_admin'
import * as quoteApprovedCustomer from './quote_approved_customer'
import * as contractSent from './contract_sent'
import * as contractSignedAdmin from './contract_signed_admin'
import * as productionUpdate from './production_update'
import * as shipped from './shipped'
import * as userApproved from './user_approved'
import * as premiumContentDownload from './premium_content_download'
import * as contractSignatureRequest from './contract_signature_request'
import * as orderStatusUpdated from './order_status_updated'

export const emailTemplates = {
  quote_created_admin: quoteCreatedAdmin,
  quote_approved_customer: quoteApprovedCustomer,
  contract_sent: contractSent,
  contract_signed_admin: contractSignedAdmin,
  production_update: productionUpdate,
  shipped: shipped,
  user_approved: userApproved,
  premium_content_download: premiumContentDownload,
  contract_signature_request: contractSignatureRequest,
  order_status_updated: orderStatusUpdated,
} as const
