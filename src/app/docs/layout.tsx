"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/docs", label: "Overview" },
  { href: "/docs/getting-started", label: "Getting Started" },
  { href: "/docs/features", label: "Features" },
  { href: "/docs/script-formats", label: "Script Formats" },
  { href: "/docs/architecture", label: "Architecture" },
  { href: "/docs/api", label: "API & Extensibility" },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted hover:text-foreground">
              &larr; App
            </Link>
            <h1 className="font-bold text-lg">Play Reader Docs</h1>
          </div>
          <span className="text-xs text-muted">v0.1.0</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto flex">
        {/* Sidebar nav */}
        <nav className="hidden md:block w-56 flex-shrink-0 border-r border-border p-4 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                    pathname === item.href
                      ? "bg-accent/10 text-accent font-medium"
                      : "text-muted hover:text-foreground hover:bg-surface-hover"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile nav */}
        <div className="md:hidden w-full border-b border-border overflow-x-auto">
          <div className="flex px-4 py-2 gap-1 min-w-max">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors ${
                  pathname === item.href
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 min-w-0 p-6 md:p-8 max-w-3xl">
          <article className="prose-custom">
            {children}
          </article>
        </main>
      </div>
    </div>
  );
}
