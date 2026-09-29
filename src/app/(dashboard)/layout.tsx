import { AppNav } from "@/components/app-nav";

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="flex-1 pb-20">{children}</div>
      <AppNav />
    </div>
  );
}
