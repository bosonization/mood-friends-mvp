"use client";

import { useEffect } from "react";
import { useFormStatus } from "react-dom";
import { startGlobalLoading } from "@/components/LoadingOverlay";

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  disabled?: boolean;
};

export function SubmitButton({ children, pendingText = "更新中...", className = "", disabled = false }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  useEffect(() => {
    if (pending) startGlobalLoading();
  }, [pending]);

  return (
    <button type="submit" disabled={disabled || pending} className={className}>
      <span className="inline-flex items-center justify-center gap-2">
        {pending ? <span className="h-4 w-4 rounded-full border-2 border-white/50 border-t-white emoodition-spinner" aria-hidden="true" /> : null}
        {pending ? pendingText : children}
      </span>
    </button>
  );
}
