import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 bg-muted/10 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
