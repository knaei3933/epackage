# Office F1/F2 Sample Label Print Checklist

Use this checklist after software verification and before final release sign-off.
Complete one row per printed label. Do not record customer phone numbers or full
addresses in this document; reference the `sample_request_id` / request number
instead.

## Preconditions

- [ ] Label agent is running on the office printer host.
- [ ] Brother QL media and roll status are OK.
- [ ] At least one new `label_prints` row has `status='pending'`.
- [ ] The sample request under test is traceable by its shared `request_number`.

## F1 — Member confirmation path

- [ ] Submit the fixed member sample from `/samples`.
- [ ] Confirm `inquiries`, `sample_requests`, `sample_items`,
      `sample_request_destinations`, and `label_prints` use the expected IDs.
- [ ] Confirm `label_prints.status` starts as `pending`.
- [ ] Observe the agent claim and print the job.
- [ ] Confirm final `label_prints.status` is `printed`.

**F1 result:** PASS / FAIL  
**Request number:**  
**Label ID:**  
**Printed at (JST):**  
**Operator initials:**

## F2 — Physical quality

- [ ] Japanese company/contact text is legible.
- [ ] Postal code and address are complete and correctly wrapped.
- [ ] No required text is clipped at label edges.
- [ ] Contrast and darkness are readable without smudging.
- [ ] Label feeds without skew and separates cleanly.

**F2 result:** PASS / FAIL  
**Notes (no personal data):**

## Release gate

- [ ] F1 passed.
- [ ] F2 passed.
- [ ] Failed prints, if any, have a label/request reference and corrective note.

**Final release decision:** PASS / FAIL  
**Date:**  
**Approver:**
