"use client";

import ArchitectSidebar from "@/components/layout/ArchitectSidebar";
import { LogoutButton } from "./LogoutButton";
import { usePathname } from "next/navigation";

export default function ArchitectLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/architect/login" || pathname === "/architect/register";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <ArchitectSidebar>
      <div className="flex items-center justify-end px-4 py-2 bg-white border-b border-gray-100">
        <LogoutButton />
      </div>
      {children}
    </ArchitectSidebar>
  );
}
