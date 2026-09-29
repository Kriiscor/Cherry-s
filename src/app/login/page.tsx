import { AuthTabs } from "@/features/auth/components/auth-tabs";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12">
      <AuthTabs />
    </div>
  );
}
