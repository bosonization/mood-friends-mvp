type AvatarProps = {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "h-10 w-10 text-base",
  md: "h-14 w-14 text-xl",
  lg: "h-20 w-20 text-2xl"
};

export function Avatar({ src, name, size = "md" }: AvatarProps) {
  const initial = name.trim().slice(0, 1) || "？";

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={`${name}のアイコン`}
        className={`${sizeClass[size]} rounded-full border border-white object-cover shadow-sm`}
      />
    );
  }

  return (
    <div className={`${sizeClass[size]} grid place-items-center rounded-full border border-white bg-gradient-to-br from-orange-100 to-pink-100 font-bold text-orange-700 shadow-sm`} aria-hidden="true">
      {initial}
    </div>
  );
}
