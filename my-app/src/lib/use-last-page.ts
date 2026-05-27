"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const LAST_PAGE_KEY = "lastVisitedPage";

export function useLastPage() {
  const router = useRouter();
  const pathname = usePathname();

  // Save current page to localStorage
  useEffect(() => {
    if (pathname && pathname !== "/") {
      localStorage.setItem(LAST_PAGE_KEY, pathname);
    }
  }, [pathname]);

  // Redirect to last page on mount (only on home page)
  useEffect(() => {
    if (pathname === "/") {
      const lastPage = localStorage.getItem(LAST_PAGE_KEY);
      if (lastPage) {
        // Small delay for better UX
        setTimeout(() => {
          router.replace(lastPage);
        }, 500);
      }
    }
  }, [pathname, router]);
}
