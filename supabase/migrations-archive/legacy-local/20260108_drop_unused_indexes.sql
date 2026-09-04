-- Drop unused indexes to reduce storage
-- Migration: 20260108_drop_unused_indexes

-- Drop unused index on contracts.quotation_id
DROP INDEX IF EXISTS public.idx_contracts_quotation_id;

-- Note: This index has never been used according to performance advisor
-- quotation_id already has index idx_quotations_contract_id on quotations table
-- which covers this relationship from the other direction
