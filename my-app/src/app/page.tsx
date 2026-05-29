"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLastPage } from "@/lib/use-last-page";

export default function Home() {
  const router = useRouter();
  useLastPage();

  useEffect(() => {
    // Redirect to market-hub or last page after 1 second
    setTimeout(() => {
      const lastPage = localStorage.getItem("lastVisitedPage");
      if (lastPage && lastPage !== "/") {
        router.push(lastPage);
      } else {
        router.push("/market-hub");
      }
    }, 1000);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
