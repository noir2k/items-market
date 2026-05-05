import type { ReactNode } from "react";
import { AdminHeader } from "../../components/AdminHeader";

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <div className="staff-shell">
      <AdminHeader />
      {children}
    </div>
  );
}
