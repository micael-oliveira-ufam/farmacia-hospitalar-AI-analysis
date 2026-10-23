import type { Medication } from '../types';

/** Usuário da sessão. No modo local é um perfil fixo, sem login. */
export interface AppUser { displayName: string | null; email?: string | null }

export type MedDoc = Omit<Medication, 'id'> & { hospitalId: string; createdAt: string; updatedAt?: string };

export interface Store {
  mode: 'local' | 'firebase';
  subscribe(hospitalId: string, cb: (meds: Medication[]) => void): () => void;
  add(hospitalId: string, med: Omit<Medication, 'id'>): Promise<void>;
  addMany(hospitalId: string, meds: Omit<Medication, 'id'>[]): Promise<void>;
  update(hospitalId: string, id: string, patch: Partial<Medication>): Promise<void>;
  updateMany(hospitalId: string, patches: { id: string; patch: Partial<Medication> }[]): Promise<void>;
  remove(hospitalId: string, id: string): Promise<void>;
  /** Sincroniza tudo (no modo local os dados já estão salvos). */
  syncAll(hospitalId: string, meds: Medication[]): Promise<number>;
}

export interface AuthApi {
  mode: 'local' | 'firebase';
  onUser(cb: (u: AppUser | null) => void): () => void;
  login(): Promise<void>;
  logout(): Promise<void>;
}

/* ---------------- backend local (padrão): localStorage, sem conta e sem domínio fixo ---------------- */
const KEY = (h: string) => `abc:meds:${h}`;
const listeners = new Map<string, Set<(m: Medication[]) => void>>();
const uid = () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`);

function read(h: string): Medication[] {
  try { return JSON.parse(localStorage.getItem(KEY(h)) || '[]'); } catch { return []; }
}
function write(h: string, meds: Medication[]) {
  try {
    localStorage.setItem(KEY(h), JSON.stringify(meds));
  } catch (e) {
    throw new Error('Não foi possível salvar no navegador (armazenamento cheio ou bloqueado). Exporte um backup.');
  }
  listeners.get(h)?.forEach(cb => cb(meds));
}

export const localStore: Store = {
  mode: 'local',
  subscribe(h, cb) {
    if (!listeners.has(h)) listeners.set(h, new Set());
    listeners.get(h)!.add(cb);
    cb(read(h));
    const onStorage = (e: StorageEvent) => { if (e.key === KEY(h)) cb(read(h)); };
    window.addEventListener('storage', onStorage);
    return () => { listeners.get(h)?.delete(cb); window.removeEventListener('storage', onStorage); };
  },
  async add(h, med) { write(h, [...read(h), { ...med, id: uid() } as Medication]); },
  async addMany(h, meds) { write(h, [...read(h), ...meds.map(m => ({ ...m, id: uid() } as Medication))]); },
  async update(h, id, patch) {
    write(h, read(h).map(m => (m.id === id ? ({ ...m, ...patch } as Medication) : m)));
  },
  async updateMany(h, patches) {
    const map = new Map(patches.map(p => [p.id, p.patch]));
    write(h, read(h).map(m => (map.has(m.id) ? ({ ...m, ...map.get(m.id) } as Medication) : m)));
  },
  async remove(h, id) { write(h, read(h).filter(m => m.id !== id)); },
  async syncAll(_h, meds) { return meds.length; },
};

export const localAuth: AuthApi = {
  mode: 'local',
  onUser(cb) { cb({ displayName: 'Modo local (este navegador)' }); return () => {}; },
  async login() {},
  async logout() {},
};

/* ---------------- backend opcional: Firebase (carregado sob demanda) ---------------- */
export const USE_FIREBASE = import.meta.env.VITE_USE_FIREBASE === 'true';
export async function loadBackends(): Promise<{ store: Store; auth: AuthApi }> {
  if (!USE_FIREBASE) return { store: localStore, auth: localAuth };
  const m = await import('./firebaseStore');
  return { store: m.firebaseStore, auth: m.firebaseAuth };
}

/* ---------------- backup (modo local) ---------------- */
export function exportBackup(h: string): string {
  return JSON.stringify({ versao: 1, hospitalId: h, exportadoEm: new Date().toISOString(), medicamentos: read(h) }, null, 1);
}
export function importBackup(h: string, json: string): number {
  const o = JSON.parse(json);
  if (!Array.isArray(o.medicamentos)) throw new Error('Arquivo de backup inválido.');
  write(h, o.medicamentos);
  return o.medicamentos.length;
}
