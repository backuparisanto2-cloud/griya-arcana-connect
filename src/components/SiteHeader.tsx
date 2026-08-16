import { Link, useNavigate } from "@tanstack/react-router";
import { LogIn, LogOut, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import logo from "../assets/logo.png";

const NAV = [
  { to: "/", label: "Ringkasan" },
  { to: "/hotspot", label: "User Hotspot" },
  { to: "/graph", label: "Graph" },
  { to: "/perangkat", label: "Perangkat" },
] as const;

export function SiteHeader({
  onRefresh,
  isFetching,
}: {
  onRefresh: () => void;
  isFetching: boolean;
}) {
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setSignedIn(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

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
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-secondary disabled:opacity-60 sm:text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Perbarui</span>
          </button>
          {signedIn ? (
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                await navigate({ to: "/" });
              }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-secondary sm:text-sm"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-secondary sm:text-sm"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Masuk</span>
            </Link>
          )}
        </div>
      </div>
      <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 pb-2 sm:px-5">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.to === "/" }}
            className="rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-secondary"
            activeProps={{ className: "bg-primary/10 text-primary" }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
