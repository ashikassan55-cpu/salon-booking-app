/**
 * Diagonal-stripe placeholder block, used wherever a real photo (gallery,
 * hero, etc.) hasn't been uploaded yet. Swap for an <img> once image_url
 * is populated.
 */
export function PlaceholderImage({
  label,
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative flex items-end overflow-hidden bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.06)_0px,rgba(255,255,255,0.06)_2px,transparent_2px,transparent_12px)] bg-surface-dark ${className}`}
    >
      {label && (
        <span className="relative z-10 p-4 text-xs font-medium tracking-wide text-muted-dark uppercase">
          {label}
        </span>
      )}
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Circular initials placeholder, used for team member photos. */
export function AvatarPlaceholder({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-full border border-border-dark bg-surface-dark text-lg font-semibold text-foreground-dark ${className}`}
    >
      {initials(name)}
    </div>
  );
}
