import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import { AdminProviders } from "@/components/shell/AdminProviders";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProviders>
      <div className="app-shell">
        <Sidebar />
        <main>
          <Topbar />
          {children}
        </main>
      </div>
    </AdminProviders>
  );
}
