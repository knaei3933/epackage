# TASK-001: Brixa Replica Alignment & Error Resolution

## 🚀 TASK Overview

### Purpose
To realign the current "Epackage Lab" application with the original goal of **reverse-engineering the Brixa simulation system**, resolving existing functionality errors, and ensuring the UI/UX matches the reference implementation.

### Position in Workflow
```
PRD (Brixa Replica) → LLD (Next.js Implementation) → TASK (Alignment & Fixes)
```

---

## 🎯 Objective
1.  **Resolve Critical Functionality Errors**: Ensure all simulation steps (Dimensions, Material Selection, Quantity, Delivery) work flawlessly without "stuck" states.
2.  **UI/UX Alignment**: Refine the interface to be a "pixel-perfect" or "logic-perfect" replica of Brixa's advanced simulation, specifically focusing on the compact, keyboard-friendly input style.
3.  **System Verification**: Verify the pricing logic against the Brixa reference to ensure accuracy.

## 🤖 Assigned Agents
- **primary**: frontend-developer (Antigravity)
- **debugging**: error-detective (Antigravity)
- **validation**: code-reviewer (Antigravity)

## 🔧 MCP Tools
- **Browser Subagent**: For visual verification and interaction testing.
- **File Operations**: For code refactoring and bug fixes.

---

## ✅ Checklist


### 1. Critical Bug Fixes (Immediate)
- [x] **Fix Material Selection Dropdowns**: Remove `disabled` props that prevent interaction. (Completed)
- [x] **Fix Dropdown Visibility**: Remove `overflow-hidden` from wizard container to prevent clipping. (Completed)
- [x] **Verify Full Flow**: Confirm the entire user journey from Step 1 to Step 3 works without refreshing.

### 2. Logic Consolidation (Brixa Reverse Engineering)
- [x] **Port Pricing Logic**: Transfer the advanced formula-based logic from `brixa-replica/lib/pricing.ts` to `epackage-lab-web/src/lib/pricing.ts`. **DONE: Implemented in `src/lib/pricing_new` due to file access issues.**
- [x] **Integrate High Volume Tiers**: Ensure the 50,000+ unit logic (gravure printing switch) is correctly implemented.
- [x] **Verify Against Data**: Run the `verification_results.json` dataset against the new implementation to ensure < 5% error margin. **DONE: Verified via `scripts/verify-brixa-logic.js` and `/pricing-debug` page.**
- [x] **Smart Quote Page**: Implement `/smart-quote` with multi-step form and UV printing option. **DONE**
- [x] **Homepage Integration**: Update homepage links to point to `/smart-quote`. **DONE**

### 3. UI/UX Refinement (Brixa Alignment)
- [x] **Input Modernization**: Replace sliders/cards with standard HTML inputs for Width/Height/Quantity. (Completed)
- [x] **Visual Polish**:
    - [x] Ensure font sizes and colors match Brixa's "utilitarian" aesthetic (less whitespace, more data density).
    - [x] Verify mobile responsiveness (though primary target is desktop).

### 4. Logic Verification
- [x] **Price Calculation**: Compare calculated prices with Brixa's actual output for sample inputs. (Verified via test-engine.ts)
- [x] **Validation Rules**: Ensure constraints (min/max sizes) match Brixa's exact rules. (Verified in code)

---

## 🔗 Dependency Management
- **Prerequisite**: Existing codebase in `src/components/simulation`.
- **Reference**: https://brixa.jp/simulation/advanced

## 🐛 Debugging Strategy

### Debugging Levels
- **Level 3**: Functionality & Logic (Focus on state management and user interaction)

### Pre-Execution Debugging Checklist
- [x] Dependencies verified (Next.js running)
- [x] Environment variables set
- [x] Browser test environment ready

### Real-Time Debugging Protocol
1.  **Auto-Detect**: Monitor browser console for React errors during interaction.
2.  **Pattern Analysis**: If a button fails, check `disabled` states and z-index/overflow issues.
3.  **Verification**: Use `browser_subagent` to simulate user clicks and inputs.

---

## 📝 Progress Log

### 2025-11-23
- **Issue**: User reported "buttons not working" for material selection.
- **Diagnosis**:
    1.  `Select` components had `disabled` props dependent on previous state, causing lock-up if state didn't update instantly.
    2.  `SimulationWizard` container had `overflow-hidden`, clipping the dropdown menus.
- **Fix**:
    1.  Removed `disabled` props from `StepOne.tsx`.
    2.  Removed `overflow-hidden` from `SimulationWizard.tsx`.
- **Status**: **Resolved**. Browser verification confirmed dropdowns are clickable and visible.

---

## 🚀 Next Steps
1.  **Server Stabilization**: Resolve the `baseline-browser-mapping` dependency issue to stabilize the dev server.
2.  **Deployment Preparation**: Prepare for deployment to Vercel or similar platform.
3.  **User Acceptance Testing**: Final review of the Smart Quote flow with the user.
