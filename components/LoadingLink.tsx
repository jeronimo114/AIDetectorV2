"use client";

import Link from "next/link";
import { useState } from "react";
import type { ComponentProps, MouseEvent } from "react";

type LoadingLinkProps = ComponentProps<typeof Link> & {
  className?: string;
};

export default function LoadingLink({
  className,
  onClick,
  children,
  ...props
}: LoadingLinkProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (isLoading) {
      event.preventDefault();
      return;
    }
    setIsLoading(true);
    onClick?.(event);
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
        <span
          className={`h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent transition-opacity ${
            isLoading ? "animate-spin opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        />
        <span>{children}</span>
      </span>
    </Link>
  );
}
