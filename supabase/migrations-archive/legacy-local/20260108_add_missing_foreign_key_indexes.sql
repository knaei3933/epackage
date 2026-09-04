-- Add missing indexes for foreign keys to improve query performance
-- Migration: 20260108_add_missing_foreign_key_indexes

-- contract_reminders
CREATE INDEX IF NOT EXISTS idx_contract_reminders_sent_by
  ON public.contract_reminders(sent_by);

-- design_revisions
CREATE INDEX IF NOT EXISTS idx_design_revisions_reviewed_by
  ON public.design_revisions(reviewed_by);

-- inventory_transactions
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_inventory_id
  ON public.inventory_transactions(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_performed_by
  ON public.inventory_transactions(performed_by);

-- orders
CREATE INDEX IF NOT EXISTS idx_orders_billing_address_id
  ON public.orders(billing_address_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_address_id
  ON public.orders(delivery_address_id);

-- password_reset_tokens
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id
  ON public.password_reset_tokens(user_id);

-- payment_confirmations
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_quotation_id
  ON public.payment_confirmations(quotation_id);

-- quotation_items
CREATE INDEX IF NOT EXISTS idx_quotation_items_order_id
  ON public.quotation_items(order_id);

-- quotations
CREATE INDEX IF NOT EXISTS idx_quotations_company_id
  ON public.quotations(company_id);

-- sample_requests
CREATE INDEX IF NOT EXISTS idx_sample_requests_delivery_address_id
  ON public.sample_requests(delivery_address_id);

-- shipments
CREATE INDEX IF NOT EXISTS idx_shipments_order_id
  ON public.shipments(order_id);

-- stage_action_history
CREATE INDEX IF NOT EXISTS idx_stage_action_history_performed_by
  ON public.stage_action_history(performed_by);
CREATE INDEX IF NOT EXISTS idx_stage_action_history_production_order_id
  ON public.stage_action_history(production_order_id);
