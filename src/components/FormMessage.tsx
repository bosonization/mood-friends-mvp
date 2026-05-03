type FormMessageProps = { message?: string | string[] | null };

export function FormMessage({ message }: FormMessageProps) {
  if (!message) return null;
  const text = Array.isArray(message) ? message.join("、") : message;
  return (
    <p className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
      {text}
    </p>
  );
}
