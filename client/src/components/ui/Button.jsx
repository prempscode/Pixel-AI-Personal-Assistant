import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { buttonClasses } from "./buttonStyles";

const Button = forwardRef(function Button(
  {
    children,
    className,
    variant = "primary",
    size = "md",
    loading = false,
    disabled,
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses({ variant, size, className })}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
});

export function ButtonLink({
  children,
  className,
  variant = "primary",
  size = "md",
  to,
  href,
  external = false,
  ...props
}) {
  const classes = buttonClasses({ variant, size, className });

  if (to) {
    return (
      <Link className={classes} to={to} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a
      className={classes}
      href={href}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : undefined)}
      {...props}
    >
      {children}
    </a>
  );
}

export default Button;
