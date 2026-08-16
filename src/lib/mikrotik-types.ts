export type RouterInterface = {
  name: string;
  type: string;
  running: boolean;
  disabled: boolean;
  rxBytes: number;
  txBytes: number;
  comment?: string;
};

export type RouterSystem = {
  identity: string;
  boardName: string;
  model: string;
  version: string;
  buildTime: string;
  uptime: string;
  cpu: string;
  cpuCount: string;
  cpuLoad: number;
  freeMemory: number;
  totalMemory: number;
  freeHdd: number;
  totalHdd: number;
  architecture: string;
  platform: string;
  serialNumber: string;
};

export type RouterStatusOk = {
  ok: true;
  latencyMs: number;
  checkedAt: string;
  transport: string;
  system: RouterSystem;
  interfaces: RouterInterface[];
};

export type RouterStatusError = {
  ok: false;
  latencyMs: number;
  checkedAt: string;
  transport: string;
  error: string;
};

export type RouterStatus = RouterStatusOk | RouterStatusError;

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatUptime(uptime: string): string {
  if (!uptime) return "-";
  return uptime
    .replace("w", " minggu ")
    .replace("d", " hari ")
    .replace("h", " jam ")
    .replace("m", " menit ")
    .replace("s", " detik")
    .replace(/\s+/g, " ")
    .trim();
}
