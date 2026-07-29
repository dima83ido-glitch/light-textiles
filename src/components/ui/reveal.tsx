"use client";

import { motion } from "framer-motion";

type Direction = "up" | "left" | "right";

const OFFSET: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 20 },
  left: { x: -24 },
  right: { x: 24 },
};

/**
 * Thin client-only wrapper for a scroll-triggered fade/slide-in. Keeping this as the only
 * client boundary lets the section around it stay a Server Component instead of the whole
 * section opting into "use client" just for a decorative reveal animation.
 */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.5,
  className,
}: {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const offset = OFFSET[direction];
  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
