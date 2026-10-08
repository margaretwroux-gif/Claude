"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  className = "btn",
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending} title={title} aria-label={title}>
      {children}
    </button>
  );
}
