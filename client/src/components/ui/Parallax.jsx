import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { cn } from "../../lib/cn";

export default function Parallax({
  children,
  className,
  speed = 24,
  ...props
}) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      style={reduceMotion ? undefined : { y }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
