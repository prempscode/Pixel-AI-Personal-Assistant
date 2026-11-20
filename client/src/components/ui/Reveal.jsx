import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../lib/cn";

export default function Reveal({
  children,
  className,
  delay = 0,
  y = 22,
  duration = 0.7,
  once = true,
  as = "div",
  ...props
}) {
  const reduceMotion = useReducedMotion();
  const MotionTag = motion[as] || motion.div;

  return (
    <MotionTag
      className={cn(className)}
      initial={reduceMotion ? false : { opacity: 0, y }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {children}
    </MotionTag>
  );
}
