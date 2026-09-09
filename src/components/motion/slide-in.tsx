"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type SlideInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "left" | "right" | "up" | "down";
  distance?: number;
};

const DIRECTION_OFFSETS = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
} as const;

export function SlideIn({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 24,
}: SlideInProps) {
  const reduce = useReducedMotion();
  const offset = DIRECTION_OFFSETS[direction];

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        x: reduce ? 0 : offset.x * distance,
        y: reduce ? 0 : offset.y * distance,
      }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}