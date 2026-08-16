import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Copy, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import {
  createDevice,
  deleteDevice,
  listDevices,
  updateDevice,
} from "@/lib/devices.functions";
import {
  DEVICE_TYPES,
  EMPTY_DEVICE,
  type Device,
  type DeviceInput,
} from "@/lib/devices-types";

export const Route = createFileRoute("/_authenticated/perangkat")({
  head: () => ({
    meta: [
      { title: "Daftar Perangkat Jaringan — Griya Arca Putri" },
      {
        name: "description",
        content:
          "Sheet perangkat jaringan kost: IP address, MAC address, user, password, dan SSID access point.",
      },
      { property: "og:title", content: "Daftar Perangkat Jaringan — Griya Arca Putri" },
      {
        property: "og:description",
        content: "Catatan perangkat jaringan kost Griya Arca Putri.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DevicesPage,
});

function SecretCell({ value }: { value: string | null }) {
  const [shown, setShown] = useState(false);
  if (!value) return <span className="text-muted-foreground">-</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="font-mono text-xs">{shown ? value : "••••••••"}</span>
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        className="text-muted-foreground hover:text-primary"
        aria-label={shown ? "Sembunyikan" : "Lihat"}
      >
        {shown ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
      <button
        type="button"
        onClick={() => void navigator.clipboard?.writeText(value)}
        className="text-muted-foreground hover:text-primary"
        aria-label="Salin"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function DevicesPage() {
  const queryClient = useQueryClient();
  const fetchDevices = useServerFn(listDevices);
  const addFn = useServerFn(createDevice);
  const editFn = useServerFn(updateDevice);
  const removeFn = useServerFn(deleteDevice);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("Semua");
  const [editing, setEditing] = useState<null | { id?: string; values: DeviceInput }>(null);

  const query = useQuery({
    queryKey: ["devices"],
    queryFn: () => fetchDevices(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["devices"] });

  const saveMutation = useMutation({
    mutationFn: async (payload: { id?: string; values: DeviceInput }) =>
      payload.id
        ? editFn({ data: { ...payload.values, id: payload.id } })
        : addFn({ data: payload.values }),
    onSuccess: () => {
      setEditing(null);
      void invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => removeFn({ data: { id } }),
    onSuccess: () => void invalidate(),
  });

  const devices = (query.data ?? []) as Device[];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return devices.filter((d) => {
      if (typeFilter !== "Semua" && d.device_type !== typeFilter) return false;
      if (!q) return true;
      return [d.name, d.location, d.ip_address, d.mac_address, d.ssid, d.username]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [devices, search, typeFilter]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader isFetching={query.isFetching} onRefresh={() => void invalidate()} />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold sm:text-2xl">Daftar Perangkat</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {devices.length} perangkat tercatat.
            </p>
          </div>
          <button
            onClick={() => setEditing({ values: { ...EMPTY_DEVICE } })}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Tambah perangkat
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, IP, MAC, SSID…"
            className="min-w-[200px] flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {["Semua", ...DEVICE_TYPES].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {query.isError && (
          <p className="mt-4 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            Gagal memuat data perangkat.
          </p>
        )}

        {/* Kartu untuk layar kecil */}
        <div className="mt-5 grid gap-3 md:hidden">
          {filtered.map((d) => (
            <article key={d.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-base font-semibold">{d.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {d.device_type}
                    {d.location ? ` · ${d.location}` : ""}
                  </p>
                </div>
                <RowActions
                  onEdit={() => setEditing({ id: d.id, values: toInput(d) })}
                  onDelete={() => deleteMutation.mutate(d.id)}
                />
              </div>
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
                <dt className="text-muted-foreground">IP</dt>
                <dd className="font-mono">{d.ip_address ?? "-"}</dd>
                <dt className="text-muted-foreground">MAC</dt>
                <dd className="font-mono">{d.mac_address ?? "-"}</dd>
                <dt className="text-muted-foreground">User</dt>
                <dd>{d.username ?? "-"}</dd>
                <dt className="text-muted-foreground">Password</dt>
                <dd>
                  <SecretCell value={d.password} />
                </dd>
                <dt className="text-muted-foreground">SSID</dt>
                <dd>{d.ssid ?? "-"}</dd>
                <dt className="text-muted-foreground">Pass WiFi</dt>
                <dd>
                  <SecretCell value={d.wifi_password} />
                </dd>
              </dl>
              {d.notes && <p className="mt-2 text-xs text-muted-foreground">{d.notes}</p>}
            </article>
          ))}
        </div>

        {/* Tabel untuk desktop */}
        <div className="mt-5 hidden overflow-x-auto rounded-2xl border border-border bg-card shadow-sm md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/60 text-xs text-muted-foreground">
              <tr>
                {["Nama", "Tipe", "Lokasi", "IP", "MAC", "User", "Password", "SSID", "Pass WiFi", ""].map(
                  (h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-2.5 font-medium">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-t border-border/70">
                  <td className="px-3 py-2.5 font-medium">{d.name}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{d.device_type}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{d.location ?? "-"}</td>
                  <td className="px-3 py-2.5 font-mono text-xs">{d.ip_address ?? "-"}</td>
                  <td className="px-3 py-2.5 font-mono text-xs">{d.mac_address ?? "-"}</td>
                  <td className="px-3 py-2.5">{d.username ?? "-"}</td>
                  <td className="px-3 py-2.5">
                    <SecretCell value={d.password} />
                  </td>
                  <td className="px-3 py-2.5">{d.ssid ?? "-"}</td>
                  <td className="px-3 py-2.5">
                    <SecretCell value={d.wifi_password} />
                  </td>
                  <td className="px-3 py-2.5">
                    <RowActions
                      onEdit={() => setEditing({ id: d.id, values: toInput(d) })}
                      onDelete={() => deleteMutation.mutate(d.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && !query.isLoading && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Belum ada perangkat yang cocok.
            </p>
          )}
        </div>
      </main>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-card p-5 shadow-lg sm:rounded-2xl">
            <h3 className="font-display text-lg font-semibold">
              {editing.id ? "Ubah Perangkat" : "Tambah Perangkat"}
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field
                label="Nama perangkat"
                value={editing.values.name}
                onChange={(v) => setEditing({ ...editing, values: { ...editing.values, name: v } })}
              />
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Tipe</span>
                <select
                  value={editing.values.device_type}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      values: { ...editing.values, device_type: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  {DEVICE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <Field
                label="Lokasi"
                value={editing.values.location ?? ""}
                onChange={(v) =>
                  setEditing({ ...editing, values: { ...editing.values, location: v } })
                }
              />
              <Field
                label="IP address"
                value={editing.values.ip_address ?? ""}
                onChange={(v) =>
                  setEditing({ ...editing, values: { ...editing.values, ip_address: v } })
                }
              />
              <Field
                label="MAC address"
                value={editing.values.mac_address ?? ""}
                onChange={(v) =>
                  setEditing({ ...editing, values: { ...editing.values, mac_address: v } })
                }
              />
              <Field
                label="User login"
                value={editing.values.username ?? ""}
                onChange={(v) =>
                  setEditing({ ...editing, values: { ...editing.values, username: v } })
                }
              />
              <Field
                label="Password login"
                value={editing.values.password ?? ""}
                onChange={(v) =>
                  setEditing({ ...editing, values: { ...editing.values, password: v } })
                }
              />
              <Field
                label="SSID (Access Point)"
                value={editing.values.ssid ?? ""}
                onChange={(v) => setEditing({ ...editing, values: { ...editing.values, ssid: v } })}
              />
              <Field
                label="Password WiFi"
                value={editing.values.wifi_password ?? ""}
                onChange={(v) =>
                  setEditing({ ...editing, values: { ...editing.values, wifi_password: v } })
                }
              />
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-muted-foreground">Catatan</span>
                <textarea
                  rows={2}
                  value={editing.values.notes ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, values: { ...editing.values, notes: e.target.value } })
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </label>
            </div>

            {saveMutation.isError && (
              <p className="mt-3 text-sm text-destructive">
                {saveMutation.error instanceof Error
                  ? saveMutation.error.message
                  : "Gagal menyimpan."}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary"
              >
                Batal
              </button>
              <button
                onClick={() => saveMutation.mutate(editing)}
                disabled={saveMutation.isPending}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {saveMutation.isPending ? "Menyimpan…" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <span className="inline-flex gap-1">
      <button
        onClick={onEdit}
        className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-primary"
        aria-label="Ubah"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={() => {
          if (confirm("Hapus perangkat ini?")) onDelete();
        }}
        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        aria-label="Hapus"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </span>
  );
}

function toInput(d: Device): DeviceInput {
  return {
    name: d.name,
    device_type: d.device_type,
    location: d.location ?? "",
    ip_address: d.ip_address ?? "",
    mac_address: d.mac_address ?? "",
    username: d.username ?? "",
    password: d.password ?? "",
    ssid: d.ssid ?? "",
    wifi_password: d.wifi_password ?? "",
    notes: d.notes ?? "",
  };
}
