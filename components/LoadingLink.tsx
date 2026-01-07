"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { usePathname } from "next/navigation";

type LoadingLinkProps = ComponentProps<typeof Link> & {
  className?: string;
  leadingIcon?: ReactNode;
};

export default function LoadingLink({
  className,
  leadingIcon,
  onClick,
  children,
  ...props
}: LoadingLinkProps) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (isLoading) {
      event.preventDefault();
      return;
    }
    const targetPath =
      typeof props.href === "string"
        ? props.href
        : props.href && typeof props.href === "object" && "pathname" in props.href
          ? props.href.pathname ?? ""
          : "";
    if (targetPath && targetPath === pathname) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }
    setIsLoading(true);
  };

  return (
    <Link
      {...props}
      onClick={handleClick}
      className={`${className ?? ""} ${isLoading ? "cursor-wait opacity-80" : ""}`.trim()}
      aria-busy={isLoading}
      aria-disabled={isLoading}
    >
      {isLoading && (
        <span
          className="h-4 w-4 flex-shrink-0 rounded-full border-2 border-current border-t-transparent animate-spin"
          aria-hidden="true"
        />
      )}
      {leadingIcon && !isLoading && (
        <span className="flex-shrink-0" aria-hidden="true">
          {leadingIcon}
        </span>
      )}
      {children}
    </Link>
  );
}
