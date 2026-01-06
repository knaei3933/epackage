// Framer Motion variants for enhanced animations
export const heroVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
}

export const statVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
      mass: 1,
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 10,
    }
  }
}

export const ctaVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 10,
      delay: 0.4
    }
  }
}

export const numberVariants = {
  hidden: {
    opacity: 0,
    scale: 0.5,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 8,
    }
  },
  pulse: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut" as const
    }
  }
}
