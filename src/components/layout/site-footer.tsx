import type { SiteSettings, WorkingHourEntry } from "@/lib/settings";

const SHORT_DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// Monday-first reading order, rather than JS's Sunday-first Date.getDay().
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

function formatTime(hour: number, minute: number) {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const displayMinute = minute.toString().padStart(2, "0");
  return `${displayHour}:${displayMinute} ${period}`;
}

function formatDayHours(entry: WorkingHourEntry) {
  if (!entry.open) return "Closed";
  return `${formatTime(entry.startHour, entry.startMinute)} - ${formatTime(
    entry.endHour,
    entry.endMinute,
  )}`;
}

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const orderedHours = DISPLAY_ORDER.map((weekday) =>
    settings.workingHours.find((h) => h.weekday === weekday),
  ).filter((h): h is WorkingHourEntry => !!h);

  return (
    <footer
      id="contact"
      className="border-t border-border-dark bg-surface-dark text-foreground-dark"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-bold tracking-tight uppercase">
            {settings.name}
          </p>
          <p className="mt-2 text-sm text-muted-dark">{settings.tagline}</p>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-dark uppercase">
            Working Hours
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {orderedHours.map((entry) => (
              <li key={entry.weekday} className="flex justify-between gap-4">
                <span className="text-muted-dark">
                  {SHORT_DAY_LABELS[entry.weekday]}
                </span>
                <span>{formatDayHours(entry)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-dark uppercase">
            Location
          </p>
          <p className="mt-3 text-sm whitespace-pre-line">
            {settings.address}
          </p>
          <p className="mt-3 text-sm text-muted-dark">{settings.email}</p>
          <p className="text-sm text-muted-dark">{settings.phone}</p>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-dark uppercase">
            Follow
          </p>
          <div className="mt-3 flex gap-4 text-sm">
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                className="text-muted-dark hover:text-foreground-dark"
              >
                Instagram
              </a>
            )}
            {settings.facebookUrl && (
              <a
                href={settings.facebookUrl}
                className="text-muted-dark hover:text-foreground-dark"
              >
                Facebook
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-border-dark px-6 py-6 text-center text-xs text-muted-dark">
        &copy; {new Date().getFullYear()} {settings.name}. All rights
        reserved.
      </div>
    </footer>
  );
}
