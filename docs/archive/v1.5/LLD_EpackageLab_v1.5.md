# Epackage Lab ホームページ LLD v1.5

## 1. System Architecture

(Basic Architecture remains same as v1.0, focusing on UI Layer enhancements)

```
┌─────────────────┐    ┌──────────────────┐
│   Frontend      │    │   Animation      │
│   (Next.js)     │◄──►│   Layer          │
│                 │    │ (Framer Motion)  │
└────────┬────────┘    └────────┬─────────┘
         │                      │
         ▼                      ▼
┌─────────────────────────────────────────┐
│           User Interface (UI)           │
│  - Glassmorphism Components             │
│  - Dynamic Gradients                    │
│  - Interactive Forms                    │
└─────────────────────────────────────────┘
```

## 2. Tech Stack

### Frontend (Enhanced)
- **Framework**: Next.js 16.0.3 (App Router)
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS 4.x
- **Animation**: **Framer Motion 11.x** (Core for dynamic feel)
- **Icons**: Lucide React
- **Utils**: `clsx`, `tailwind-merge`, `cva` (Class Variance Authority)

### Backend & Database
- (Same as v1.0: Next.js API Routes, Supabase, PostgreSQL)

## 3. UX/UI Architecture & Animation Strategy

To achieve the "Brixa-like" premium feel, we implement a comprehensive animation strategy.

### 3.1. Page Transitions
- **Technology**: `AnimatePresence` (mode="wait")
- **Pattern**:
  - **Exit**: Fade out + slight scale down (0.98)
  - **Enter**: Fade in + slight scale up (1.00) + Slide up (10px)
  - **Duration**: 0.3s - 0.4s (easeOut)

### 3.2. Component Transitions (Simulation Wizard)
- **Step Transition**:
  - **Directional Slide**: Next step slides in from right, Previous step slides out to left.
  - **Height Animation**: Container height animates smoothly to fit content (`<motion.div layout>`).
- **Selection State**:
  - **Layout Animation**: `layoutId` used for the "active selection border" to glide between items.

### 3.3. Micro-interactions
- **Buttons**:
  - **Hover**: Scale 1.02, Shadow increase, Gradient shift.
  - **Tap**: Scale 0.98.
- **Inputs**:
  - **Focus**: Border color transition, Label float animation.
- **Scroll**:
  - **Staggered Reveal**: List items appear one by one with a delay (`staggerChildren: 0.1`).

## 4. Component Design Patterns

### 4.1. MotionWrapper
A reusable HOC to apply standard page entry animations.

```tsx
// components/ui/MotionWrapper.tsx
'use client';
import { motion } from 'framer-motion';

export const MotionWrapper = ({ children, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);
```

### 4.2. GlassCard
Standard card component with glassmorphism style.

```tsx
// components/ui/GlassCard.tsx
export const GlassCard = ({ children }) => (
  <div className="backdrop-blur-md bg-white/70 border border-white/20 shadow-xl rounded-2xl">
    {children}
  </div>
);
```

## 5. Database Schema
(Same as v1.0 - No changes required for UI upgrade)

## 6. API Specification
(Same as v1.0 - No changes required for UI upgrade)

## 7. Performance Considerations (Animation Specific)

- **Will-Change**: Use `will-change-transform` sparingly on heavy animating elements.
- **Layout Thrashing**: Avoid animating `width`/`height` directly where possible; use `transform: scale` or `layout` prop from Framer Motion.
- **Lazy Loading**: Defer loading of heavy animations (e.g., 3D elements) until they are in viewport.

## 8. Deployment
(Same as v1.0)

---

**Document Version**: 1.5
**Created**: 2025-11-24
**Focus**: Animation & Premium UI Implementation
