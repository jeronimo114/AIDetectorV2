"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedBarProps {
  percentage: number;
  duration?: number;
  delay?: number;
  className?: string;
  barClassName?: string;
  startOnView?: boolean;
}

export default function AnimatedBar({
  percentage,
  duration = 1500,
  delay = 0,
  className = "",
  barClassName = "",
  startOnView = true
}: AnimatedBarProps) {
  const [width, setWidth] = useState(0);
  const [hasStarted, setHasStarted] = useState(!startOnView);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) {
      setHasStarted(true);
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true);
            observer.unobserve(element);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [startOnView, hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    const timer = setTimeout(() => {
      const startTime = performance.now();
      const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuart(progress);
        const currentWidth = percentage * easedProgress;

        setWidth(currentWidth);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timer);
  }, [hasStarted, percentage, duration, delay]);

  return (
    <div ref={elementRef} className={`h-3 w-full overflow-hidden rounded-full bg-gray-100 ${className}`}>
      <div
        className={`h-full rounded-full transition-none ${barClassName}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
