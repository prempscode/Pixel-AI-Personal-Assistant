import { motion, useReducedMotion } from "motion/react";

/** Scroll-triggered fade/rise. Plays once, honours reduced motion. */
export default function Reveal({ children, delay = 0, y = 24, className, as = "div", ...rest }) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
