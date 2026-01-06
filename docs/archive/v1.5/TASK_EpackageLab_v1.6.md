# TASK v1.6: Backend Integration & Final Polish

## 🎯 Objective
Complete the pending backend and integration tasks from the original v1.0 plan that were not covered in the v1.5 UI sprint. This includes Database setup, Contact Form persistence, and basic testing.

## 📋 Task List

### TASK-003: Database Integration (Supabase)
- [x] **Create `src/lib/supabase.ts`**: Initialize Supabase client.
- [x] **Define Database Types**: Create `src/types/database.ts` or `src/lib/database.types.ts` based on the schema.
- [x] **Environment Variables**: Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are used.

### TASK-008: Contact System Completion
- [x] **Persist Inquiries**: Update `/api/contact/route.ts` to save inquiries to Supabase `contacts` table.
- [x] **Error Handling**: Ensure graceful degradation if DB is down (email should still try to send).

### TASK-011: Basic Testing
- [ ] **Unit Tests**: Add basic tests for pricing logic (since it's complex).
- [ ] **E2E Tests**: Set up Playwright for the critical "Quote Simulation" flow.

### TASK-012: Deployment Prep
- [ ] **Environment Check**: Verify all env vars are ready for Vercel.

## 📝 Implementation Notes
- The UI is already in a good state (v1.5).
- Focus is on "making it real" - saving data and ensuring reliability.
