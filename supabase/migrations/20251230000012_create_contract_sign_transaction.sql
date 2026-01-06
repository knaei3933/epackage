-- =====================================================
-- Migration: Transaction-Safe Contract Signing
-- Purpose: Replace manual rollback with proper ACID transaction
-- Created: 2024-12-30
-- =====================================================
-- This function handles contract signing with proper transaction handling
--
-- Operations wrapped in transaction:
-- 1. Update contract signature_data
-- 2. Update contract status
-- 3. Update order status (when both parties signed)
-- 4. Create order status history entry
-- 5. Log signature event (optional, for audit)
--
-- If any operation fails, the entire transaction is rolled back.

-- =====================================================
-- RPC Function: sign_contract_transaction
-- =====================================================
CREATE OR REPLACE FUNCTION sign_contract_transaction(
  p_contract_id UUID,
  p_user_id UUID,
  p_signer_type VARCHAR(20),  -- 'customer' or 'admin'
  p_signature_data JSONB,
  p_timestamp_id UUID,
  p_document_hash TEXT,
  p_ip_address INET DEFAULT NULL,
  p_ip_validation JSONB DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  contract_id UUID,
  contract_status VARCHAR(50),
  order_status VARCHAR(50),
  error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_contract RECORD;
  v_order_id UUID;
  v_new_contract_status VARCHAR(50);
  v_new_order_status VARCHAR(50) DEFAULT NULL;
  v_from_status VARCHAR(50);
  v_signature_name TEXT;
  v_signature_email TEXT;
BEGIN
  -- Initialize return values
  success := false;
  contract_id := p_contract_id;
  contract_status := NULL;
  order_status := NULL;
  error_message := NULL;

  -- =====================================================
  -- Validation Phase (outside transaction)
  -- =====================================================

  -- Get contract data
  SELECT * INTO v_contract
  FROM contracts
  WHERE id = p_contract_id;

  IF NOT FOUND THEN
    error_message := '계약서를 찾을 수 없습니다.';
    RETURN NEXT;
    RETURN;
  END IF;

  -- Get signer info
  SELECT
    COALESCE(kanji_last_name || ' ' || kanji_first_name, email) AS name,
    email
  INTO v_signature_name, v_signature_email
  FROM profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    v_signature_name := 'Unknown';
    v_signature_email := 'unknown@example.com';
  END IF;

  -- Validate signer type
  IF p_signer_type NOT IN ('customer', 'admin') THEN
    error_message := '서명자 유형이 올바르지 않습니다.';
    RETURN NEXT;
    RETURN;
  END IF;

  -- =====================================================
  -- Transaction Phase
  -- =====================================================

  BEGIN
    -- 1. Update contract signature_data
    -- Build updated signature_data JSONB
    UPDATE contracts
    SET signature_data = COALESCE(signature_data, '{}'::jsonb) || jsonb_build_object(
      p_signer_type, jsonb_build_object(
        'name', v_signature_name,
        'email', v_signature_email,
        'signed_at', NOW(),
        'ip_address', p_ip_address::TEXT,
        'ip_validation', COALESCE(p_ip_validation, '{}'::jsonb),
        'signature_data', p_signature_data,
        'timestamp', jsonb_build_object(
          'id', p_timestamp_id,
          'document_hash', p_document_hash
        )
      ),
      'document_hash', p_document_hash,
      'timestamp_id', p_timestamp_id
    ),
    updated_at = NOW()
    WHERE id = p_contract_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Contract not found for update: %', p_contract_id;
    END IF;

    -- 2. Update contract status based on signer type
    IF p_signer_type = 'customer' THEN
      -- Customer signing
      IF v_contract.status NOT IN ('SENT', 'DRAFT') THEN
        RAISE EXCEPTION 'Cannot sign contract in status: %', v_contract.status;
      END IF;

      UPDATE contracts
      SET customer_signed_at = NOW(),
          status = 'CUSTOMER_SIGNED'
      WHERE id = p_contract_id;

      v_new_contract_status := 'CUSTOMER_SIGNED';
      v_from_status := v_contract.status;

    ELSIF p_signer_type = 'admin' THEN
      -- Admin signing (contract becomes active)
      IF v_contract.status NOT IN ('CUSTOMER_SIGNED', 'DRAFT') THEN
        RAISE EXCEPTION 'Cannot sign contract in status: %', v_contract.status;
      END IF;

      UPDATE contracts
      SET admin_signed_at = NOW(),
          status = 'ACTIVE'
      WHERE id = p_contract_id;

      v_new_contract_status := 'ACTIVE';
      v_from_status := v_contract.status;

      -- 3. When admin signs, also update order status
      v_order_id := v_contract.order_id;

      IF v_order_id IS NOT NULL THEN
        -- Get current order status
        DECLARE
          v_current_order_status VARCHAR(50);
        BEGIN
          SELECT status INTO v_current_order_status
          FROM orders
          WHERE id = v_order_id;

          IF FOUND THEN
            v_new_order_status := 'CONTRACT_SIGNED';
            v_from_status := v_current_order_status;

            -- Update order status
            UPDATE orders
            SET status = 'CONTRACT_SIGNED',
                current_state = 'contract_signed',
                updated_at = NOW()
            WHERE id = v_order_id;

            -- 4. Create order status history entry
            INSERT INTO order_status_history (
              order_id,
              from_status,
              to_status,
              changed_by,
              reason,
              changed_at
            ) VALUES (
              v_order_id,
              v_current_order_status,
              'CONTRACT_SIGNED',
              p_user_id,
              '계약서 양측 서명 완료',
              NOW()
            );
          END IF;
        END;
      END IF;
    END IF;

    -- Commit implicit - PostgreSQL auto-commits on successful completion

    -- Set return values
    success := true;
    contract_status := v_new_contract_status;
    order_status := v_new_order_status;

  EXCEPTION
    WHEN OTHERS THEN
      -- ROLLBACK is automatic in PostgreSQL when exception is raised
      success := false;
      contract_id := NULL;
      contract_status := NULL;
      order_status := NULL;
      error_message := SQLERRM;

      -- Log error for debugging
      RAISE WARNING 'sign_contract_transaction failed for contract %: %',
                    p_contract_id, SQLERRM;

      RETURN NEXT;
      RETURN;
  END;

  -- Return success result
  RETURN NEXT;

END;
$$;

-- =====================================================
-- Security: Grant Execute Permission
-- =====================================================
GRANT EXECUTE ON FUNCTION sign_contract_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION sign_contract_transaction TO service_role;

-- =====================================================
-- Helper Function: Validate Contract Signature Integrity
-- =====================================================
CREATE OR REPLACE FUNCTION validate_contract_signature_integrity(p_contract_id UUID)
RETURNS TABLE (
  is_valid BOOLEAN,
  issues TEXT[]
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_contract RECORD;
  v_issues TEXT[] := '{}';
  v_order_exists BOOLEAN;
  v_order_history_exists BOOLEAN;
BEGIN
  -- Check if contract exists
  SELECT * INTO v_contract
  FROM contracts
  WHERE id = p_contract_id;

  IF NOT FOUND THEN
    v_issues := array_append(v_issues, 'Contract does not exist');
    is_valid := false;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Check signature data integrity
  IF v_contract.signature_data IS NULL OR v_contract.signature_data = '{}'::jsonb THEN
    v_issues := array_append(v_issues, 'No signature data found');
  END IF;

  -- Check timestamp ID exists
  IF (v_contract.signature_data->>'timestamp_id') IS NULL THEN
    v_issues := array_append(v_issues, 'No timestamp ID in signature data');
  END IF;

  -- Check document hash exists
  IF (v_contract.signature_data->>'document_hash') IS NULL THEN
    v_issues := array_append(v_issues, 'No document hash in signature data');
  END IF;

  -- If contract is ACTIVE, verify both parties signed
  IF v_contract.status = 'ACTIVE' THEN
    IF v_contract.signature_data->'customer' IS NULL THEN
      v_issues := array_append(v_issues, 'Contract is ACTIVE but customer signature missing');
    END IF;

    IF v_contract.signature_data->'admin' IS NULL THEN
      v_issues := array_append(v_issues, 'Contract is ACTIVE but admin signature missing');
    END IF;
  END IF;

  -- If contract is CUSTOMER_SIGNED, verify customer signed and admin didn't
  IF v_contract.status = 'CUSTOMER_SIGNED' THEN
    IF v_contract.signature_data->'customer' IS NULL THEN
      v_issues := array_append(v_issues, 'Contract is CUSTOMER_SIGNED but customer signature missing');
    END IF;

    IF v_contract.signature_data->'admin' IS NOT NULL THEN
      v_issues := array_append(v_issues, 'Contract is CUSTOMER_SIGNED but admin signature exists');
    END IF;
  END IF;

  -- Check order status consistency
  IF v_contract.order_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM orders WHERE id = v_contract.order_id
    ) INTO v_order_exists;

    IF NOT v_order_exists THEN
      v_issues := array_append(v_issues, 'Referenced order does not exist');
    END IF;

    -- If contract is ACTIVE, order should be CONTRACT_SIGNED
    IF v_contract.status = 'ACTIVE' THEN
      IF EXISTS (
        SELECT 1 FROM orders
        WHERE id = v_contract.order_id
        AND status != 'CONTRACT_SIGNED'
      ) THEN
        v_issues := array_append(v_issues, 'Contract is ACTIVE but order status is not CONTRACT_SIGNED');
      END IF;
    END IF;

    -- Check order status history exists for signed contracts
    SELECT EXISTS(
      SELECT 1 FROM order_status_history
      WHERE order_id = v_contract.order_id
      AND to_status = 'CONTRACT_SIGNED'
    ) INTO v_order_history_exists;

    IF v_contract.status = 'ACTIVE' AND NOT v_order_history_exists THEN
      v_issues := array_append(v_issues, 'No order status history entry for CONTRACT_SIGNED');
    END IF;
  END IF;

  -- Set validity
  is_valid := array_length(v_issues, 1) IS NULL;

  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION validate_contract_signature_integrity TO authenticated;
GRANT EXECUTE ON FUNCTION validate_contract_signature_integrity TO service_role;

-- =====================================================
-- Helper Function: Get Contract Signing Timeline
-- =====================================================
CREATE OR REPLACE FUNCTION get_contract_signing_timeline(p_contract_id UUID)
RETURNS TABLE (
  event_type VARCHAR(50),
  signer_type VARCHAR(20),
  signed_at TIMESTAMPTZ,
  signer_name TEXT,
  signer_email TEXT,
  ip_address INET,
  timestamp_id UUID,
  document_hash TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    'signature_created' AS event_type,
    key AS signer_type,
    (value->>'signed_at')::TIMESTAMPTZ AS signed_at,
    value->>'name' AS signer_name,
    value->>'email' AS signer_email,
    (value->>'ip_address')::INET AS ip_address,
    (value->>'timestamp_id')::UUID AS timestamp_id,
    value->>'document_hash' AS document_hash
  FROM contracts,
       jsonb_each_text(signature_data) AS key_value(key, value_text),
       jsonb_each(signature_data) AS key_value_json(key, value)
  WHERE contracts.id = p_contract_id
    AND key IN ('customer', 'admin')
  ORDER BY (value->>'signed_at')::TIMESTAMPTZ ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_contract_signing_timeline TO authenticated;
GRANT EXECUTE ON FUNCTION get_contract_signing_timeline TO service_role;

-- =====================================================
-- Migration Complete
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Transaction-safe contract signing';
  RAISE NOTICE 'Functions created:';
  RAISE NOTICE '  - sign_contract_transaction()';
  RAISE NOTICE '  - validate_contract_signature_integrity()';
  RAISE NOTICE '  - get_contract_signing_timeline()';
END $$;
