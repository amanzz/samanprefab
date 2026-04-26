"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function HeaderHeightProvider() {
  const pathname = usePathname();

  useEffect(() => {
    function updateHeaderHeight() {
      // Prevent CLS: Only calculate initial height when at top
      if (window.scrollY > 20) return;
      
      const header = document.getElementById("site-header");
      if (header && header.offsetHeight > 0) {
        document.documentElement.style.setProperty("--header-height", `${header.offsetHeight}px`);
      }
    }

    // Run once per navigation, slightly delayed to allow DOM to apply classes
    const timeoutId = setTimeout(updateHeaderHeight, 50);

    // Also update on window resize (debounced inherently by simple logic, or just let it run)
    window.addEventListener("resize", updateHeaderHeight);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, [pathname]);

  return null;
}
