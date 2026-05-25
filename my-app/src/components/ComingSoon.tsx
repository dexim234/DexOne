"use client";

import { Construction } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

interface ComingSoonProps {
  title: string;
}

export default function ComingSoon({ title }: ComingSoonProps) {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-teal-muted mb-6">
        <Construction className="h-10 w-10 text-teal" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
        {title}
      </h1>
      <p className="text-muted-foreground text-center max-w-md">
        {t("comingSoon.description")}
      </p>
      <div className="mt-8 flex gap-2">
        <div className="h-2 w-2 rounded-full bg-teal animate-bounce [animation-delay:-0.3s]" />
        <div className="h-2 w-2 rounded-full bg-teal animate-bounce [animation-delay:-0.15s]" />
        <div className="h-2 w-2 rounded-full bg-teal animate-bounce" />
      </div>
    </div>
  );
}
