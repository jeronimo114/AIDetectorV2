"use client";

import { useEffect } from "react";

export function useScrollAnimation() {
  useEffect(() => {
    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: "0px 0px -50px 0px",
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          // Once animated, stop observing
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Find all elements with scroll animation classes
    const animatedElements = document.querySelectorAll(
      ".scroll-fade-up, .scroll-slide-left, .scroll-slide-right, .scroll-scale, .stagger-children"
    );

    animatedElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}
