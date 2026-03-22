import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";

/**
 * Main application shell layout.
 * All authenticated app pages live under this layout.
 *
 * TODO: Add getServerSession() here to protect all child routes.
 * Example:
 *   const session = await getServerSession(authOptions);
 *   if (!session) redirect("/auth/login");
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <AppSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
