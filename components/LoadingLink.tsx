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
      <span className="inline-flex items-center gap-2">
        {leadingIcon ? (
          <span className="relative flex h-3.5 w-3.5 items-center justify-center">
            <span
              className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                isLoading ? "opacity-0" : "opacity-100"
              }`}
              aria-hidden="true"
            >
              {leadingIcon}
            </span>
            <span
              className={`absolute inset-0 h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent transition-opacity ${
                isLoading ? "animate-spin opacity-100" : "opacity-0"
              }`}
              aria-hidden="true"
            />
          </span>
        ) : (
          <span
            className={`h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent transition-opacity ${
              isLoading ? "animate-spin opacity-100" : "opacity-0"
            }`}
            aria-hidden="true"
          />
        )}
        <span>{children}</span>
      </span>
    </Link>
  );
}
