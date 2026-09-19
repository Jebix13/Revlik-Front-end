"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ChatWidget from "@/components/ChatWidget";

const LINKS = [
  { href: "/pipeline", label: "Pipeline" },
  { href: "/forecast", label: "Forecast" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-black/10 bg-[#fcfcfb] dark:border-white/10 dark:bg-[#1a1a19]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <span className="text-base font-semibold text-[#0b0b0b] dark:text-white">
            Revlik
          </span>
          <nav className="flex gap-1">
            {LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[#2a78d6]/10 text-[#2a78d6] dark:bg-[#3987e5]/15 dark:text-[#3987e5]"
                      : "text-[#52514e] hover:bg-black/5 dark:text-[#c3c2b7] dark:hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/deals/new"
            className="rounded-md bg-[#2a78d6] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#1c5cab]"
          >
            New deal
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-md px-3 py-1.5 text-sm text-[#52514e] hover:bg-black/5 dark:text-[#c3c2b7] dark:hover:bg-white/5"
          >
            Sign out
          </button>
        </div>
      </div>
      <ChatWidget />
    </header>
  );
}
