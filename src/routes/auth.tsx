import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LockKeyhole } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Masuk Pengelola — Griya Arca Putri" },
      {
        name: "description",
        content: "Halaman masuk pengelola untuk membuka data perangkat jaringan Griya Arca Putri.",
      },
      { property: "og:title", content: "Masuk Pengelola — Griya Arca Putri" },
      { property: "og:description", content: "Masuk untuk mengelola daftar perangkat kost." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        await navigate({ to: "/perangkat" });
      } else {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/perangkat` },
        });
        if (err) throw err;
        setMessage("Akun dibuat. Bila diminta, cek email untuk konfirmasi lalu masuk.");
        setMode("login");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses permintaan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader isFetching={false} onRefresh={() => window.location.reload()} />
      <main className="mx-auto flex max-w-md flex-col px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <LockKeyhole className="h-5 w-5" />
          </span>
          <h2 className="mt-4 font-display text-xl font-semibold">
            {mode === "login" ? "Masuk Pengelola" : "Daftar Akun Pengelola"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Data perangkat berisi password, jadi hanya bisa dibuka setelah masuk.
          </p>

          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {message && <p className="text-sm text-primary">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? "Memproses…" : mode === "login" ? "Masuk" : "Daftar"}
            </button>
          </form>

          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
              setMessage(null);
            }}
            className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-primary"
          >
            {mode === "login" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
          </button>
        </div>
      </main>
    </div>
  );
}
