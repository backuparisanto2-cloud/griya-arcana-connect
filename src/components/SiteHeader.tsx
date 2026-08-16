import { Link } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";

import logo from "../assets/logo.png";

const NAV = [
  { to: "/", label: "Ringkasan" },
  { to: "/hotspot", label: "User Hotspot" },
] as const;

export function SiteHeader({
  onRefresh,
  isFetching,
}: {
  onRefresh: () => void;
  isFetching: boolean;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Logo Griya Arca Putri"
            width={440}
            height={372}
            className="h-10 w-auto object-contain sm:h-12"
          />
          <div>
            <h1 className="font-display text-base leading-tight font-semibold sm:text-lg">
              Griya <span className="text-gradient-brand">Arca Putri</span>
            </h1>
            <p className="text-[11px] text-muted-foreground sm:text-xs">
              Monitor Jaringan &amp; Perangkat
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-secondary disabled:opacity-60 sm:text-sm"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Perbarui</span>
        </button>
      </div>
      <nav className="mx-auto flex max-w-6xl gap-1 px-2 pb-2 sm:px-5">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.to === "/" }}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
            activeProps={{ className: "bg-primary/10 text-primary" }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
