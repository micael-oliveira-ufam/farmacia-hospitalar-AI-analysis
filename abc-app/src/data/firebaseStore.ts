/* Backend opcional (VITE_USE_FIREBASE=true). Requer: domínio autorizado no Firebase Auth, login Google e as regras firestore.rules.
   Em links temporários do Cloudflare (trycloudflare.com) o domínio muda a cada execução, então o login Google falha: use o modo local ali. */
import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, addDoc, query, where, deleteDoc, doc, updateDoc, onSnapshot, writeBatch } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import type { Medication } from '../types';
import type { AppUser, AuthApi, Store } from './store';

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true }, (firebaseConfig as any).firestoreDatabaseId);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const now = () => new Date().toISOString();
const clean = <T extends object>(o: T) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

async function chunked<T>(items: T[], fn: (b: ReturnType<typeof writeBatch>, i: T) => void) {
  for (let i = 0; i < items.length; i += 450) {
    const b = writeBatch(db);
    items.slice(i, i + 450).forEach(x => fn(b, x));
    await b.commit();
  }
}

export const firebaseStore: Store = {
  mode: 'firebase',
  subscribe(h, cb) {
    const q = query(collection(db, 'medications'), where('hospitalId', '==', h));
    return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Medication))),
      err => console.error('Firestore:', err.message));
  },
  async add(h, med) { await addDoc(collection(db, 'medications'), clean({ ...med, hospitalId: h, createdAt: now() })); },
  async addMany(h, meds) { await chunked(meds, (b, m) => b.set(doc(collection(db, 'medications')), clean({ ...m, hospitalId: h, createdAt: now() }))); },
  async update(_h, id, patch) { await updateDoc(doc(db, 'medications', id), clean({ ...patch, updatedAt: now() })); },
  async updateMany(_h, ps) { await chunked(ps, (b, p) => b.update(doc(db, 'medications', p.id), clean({ ...p.patch, updatedAt: now() }))); },
  async remove(_h, id) { await deleteDoc(doc(db, 'medications', id)); },
  async syncAll(h, meds) {
    await chunked(meds, (b, m) => { const { id, ...rest } = m; b.set(doc(db, 'medications', id), clean({ ...rest, hospitalId: h, updatedAt: now() }), { merge: true }); });
    return meds.length;
  },
};
export const firebaseAuth: AuthApi = {
  mode: 'firebase',
  onUser(cb) { return onAuthStateChanged(auth, u => cb(u ? ({ displayName: u.displayName, email: u.email } as AppUser) : null)); },
  async login() { await signInWithPopup(auth, provider); },
  async logout() { await signOut(auth); },
};
