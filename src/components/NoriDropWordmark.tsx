type NoriDropWordmarkProps = {
  className?: string;
  priority?: boolean;
};

export function NoriDropWordmark({ className = "", priority = false }: NoriDropWordmarkProps) {
  return (
    <span className={`inline-flex h-8 w-[154px] items-center overflow-hidden sm:h-9 sm:w-[176px] ${className}`} aria-label="NoriDrop">
      <img
        src="/noridrop-wordmark.png"
        alt="NoriDrop"
        loading={priority ? "eager" : "lazy"}
        className="h-full w-full object-contain object-left"
      />
    </span>
  );
}
