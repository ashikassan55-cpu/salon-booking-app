import { Archivo_Narrow, Inter } from "next/font/google";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/settings";

const archivoNarrow = Archivo_Narrow({
  variable: "--font-archivo-narrow",
  weight: ["600", "700"],
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export default async function AdminShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const settings = await getSiteSettings();

  return (
    <div
      className={`${archivoNarrow.variable} ${inter.variable} min-h-screen bg-admin-bg font-admin-body text-admin-ink`}
    >
      <AdminSidebar userEmail={user.email} siteName={settings.name} />
      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
