"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { signOut } from "@/app/admin/(shell)/actions";
import { AdminLanguageSwitcher } from "./language-switcher";

const NAV_ITEMS = [
  { href: "/admin", key: "dashboard", icon: DashboardIcon },
  { href: "/admin/settings", key: "siteSettings", icon: SettingsIcon },
  { href: "/admin/hero", key: "heroSection", icon: HeroIcon },
  { href: "/admin/services", key: "services", icon: ServicesIcon },
  { href: "/admin/gallery", key: "gallery", icon: GalleryIcon },
  { href: "/admin/staff", key: "staff", icon: StaffIcon },
] as const;

export function AdminSidebar({
  userEmail,
  siteName,
}: {
  userEmail: string | undefined;
  siteName: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const t = useTranslations("AdminShell");

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      <header className="fixed top-0 inset-inline-0 z-40 flex h-14 items-center justify-between border-b border-admin-border bg-admin-surface px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t("openMenu")}
          className="p-1"
        >
          <MenuIcon />
        </button>
        <span className="font-admin-display text-sm font-bold tracking-widest text-admin-ink uppercase">
          {siteName}
        </span>
        <span className="w-6" />
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex h-full w-72 max-w-[80%] flex-col justify-between border-e border-admin-border bg-admin-surface">
            <SidebarContent
              isActive={isActive}
              userEmail={userEmail}
              siteName={siteName}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
      )}

      <aside className="fixed top-0 start-0 hidden h-screen w-64 flex-col justify-between border-e border-admin-border bg-admin-surface lg:flex">
        <SidebarContent isActive={isActive} userEmail={userEmail} siteName={siteName} />
      </aside>

      <div className="h-14 lg:hidden" />
    </>
  );
}

function SidebarContent({
  isActive,
  userEmail,
  siteName,
  onNavigate,
}: {
  isActive: (href: string) => boolean;
  userEmail: string | undefined;
  siteName: string;
  onNavigate?: () => void;
}) {
  const t = useTranslations("AdminShell");

  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <div className="flex h-16 items-center gap-2 border-b border-admin-border px-4">
          <div className="flex h-7 w-7 items-center justify-center bg-admin-accent font-admin-display text-sm font-bold text-admin-accent-ink">
            {siteName.charAt(0)}
          </div>
          <span className="font-admin-display text-lg font-bold tracking-widest text-admin-ink uppercase">
            {siteName}
          </span>
        </div>

        <p className="px-4 pt-5 pb-1 font-admin-display text-[11px] font-bold tracking-widest text-admin-muted uppercase">
          {t("salonManagement")}
        </p>

        <nav className="flex flex-col gap-1 px-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-2 px-3 py-2 font-admin-display text-[13px] font-bold tracking-wider uppercase transition-colors ${
                  active
                    ? "bg-admin-accent text-admin-accent-ink"
                    : "text-admin-muted hover:bg-admin-bg hover:text-admin-ink"
                }`}
              >
                <item.icon />
                {t(`nav.${item.key}`)}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-3 border-t border-admin-border p-4">
        <AdminLanguageSwitcher />

        <div className="flex flex-col gap-0.5 overflow-hidden">
          <span className="font-admin-display text-[10px] font-bold tracking-widest text-admin-muted uppercase">
            {t("ownerAdmin")}
          </span>
          <span className="truncate text-sm text-admin-ink">{userEmail}</span>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center justify-between border border-admin-border px-3 py-2 font-admin-display text-[11px] font-bold tracking-widest text-admin-ink uppercase transition-colors hover:bg-admin-accent hover:text-admin-accent-ink"
          >
            {t("signOut")}
            <LogoutIcon />
          </button>
        </form>
      </div>
    </div>
  );
}

function DashboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function ServicesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

function HeroIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="M3 15l4.5-4.5a2 2 0 0 1 2.83 0L15 15" />
      <circle cx="16.5" cy="9.5" r="1.5" />
    </svg>
  );
}

function StaffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="rtl:-scale-x-100"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
