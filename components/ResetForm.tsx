"use client";

import { useRef } from "react";

/** A form that runs a server action and clears its fields once the action succeeds. */
export function ResetForm({
  action,
  className,
  children,
}: {
  action: (form: FormData) => Promise<void>;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={ref}
      className={className}
      action={async (form) => {
        await action(form);
        ref.current?.reset();
      }}
    >
      {children}
    </form>
  );
}
