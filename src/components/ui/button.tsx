import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, Ref } from "react";
import type { Icon } from "@phosphor-icons/react";

export type ButtonVariant = "primary" | "secondary" | "chrome";
export type ButtonSize = "lg" | "md";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full text-center font-semibold transition-colors duration-[var(--dur-ui)] ease-[var(--ease-out)] focus-visible:outline-3 focus-visible:outline-[var(--focus)] focus-visible:outline-offset-3 disabled:pointer-events-none disabled:bg-surface-2 disabled:text-muted disabled:shadow-none aria-disabled:pointer-events-none aria-disabled:bg-surface-2 aria-disabled:text-muted aria-disabled:shadow-none";

const variants: Record<ButtonVariant, string> = {
  // Only one primary (amber) button per screen, reviewed rather than enforced here.
  primary: "bg-amber text-on-amber shadow-glow hover:brightness-95 active:brightness-90",
  secondary: "border border-line bg-surface-2 text-ink hover:bg-line/60 active:bg-line/80",
  chrome: "bg-chrome text-on-chrome hover:bg-on-chrome/10 active:bg-on-chrome/15",
};

const sizes: Record<ButtonSize, string> = {
  lg: "h-[52px] min-w-[52px] px-7 text-base",
  md: "h-11 min-w-11 px-5 text-sm",
};

export function buttonClass(variant: ButtonVariant, size: ButtonSize, className = ""): string {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`.trim();
}

type ButtonOwnProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: Icon;
  /** Put the icon after the label (forward arrows, as on the comps). */
  iconEnd?: boolean;
  children: ReactNode;
};

export type ButtonProps = ButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & { ref?: Ref<HTMLButtonElement> };

export function Button({ variant = "primary", size = "lg", icon: IconCmp, iconEnd = false, children, className = "", ...props }: ButtonProps) {
  const icon = IconCmp ? <IconCmp size={size === "lg" ? 22 : 18} weight="regular" aria-hidden /> : null;
  return (
    <button type="button" className={buttonClass(variant, size, className)} {...props}>
      {iconEnd ? null : icon}
      {children}
      {iconEnd ? icon : null}
    </button>
  );
}

type ButtonLinkOwnProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: Icon;
  /** Put the icon after the label (forward arrows, as on the comps). */
  iconEnd?: boolean;
  children: ReactNode;
} & LinkProps;

export type ButtonLinkProps = ButtonLinkOwnProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children">;

export function ButtonLink({ variant = "primary", size = "lg", icon: IconCmp, iconEnd = false, children, className = "", ...props }: ButtonLinkProps) {
  const icon = IconCmp ? <IconCmp size={size === "lg" ? 22 : 18} weight="regular" aria-hidden /> : null;
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      {iconEnd ? null : icon}
      {children}
      {iconEnd ? icon : null}
    </Link>
  );
}
