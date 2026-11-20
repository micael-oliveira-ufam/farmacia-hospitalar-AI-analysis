/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { useState, useMemo, useRef, useEffect, Component, ReactNode } from 'react';
import { Plus, Trash2, Upload, Download, FileSpreadsheet, BarChart3, Info, Package, Activity, TrendingUp, Calculator, Search, Loader2, Database, Check, X, Edit2, AlertTriangle, Zap, LogOut, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import '../../design/pcpdf.js';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
  Area,
  Brush,
  Label,
  LabelList,
  ReferenceArea,
  ReferenceLine
} from 'recharts';
import { Medication, ABCResult, calculateABC, ABCCalculationMode, DEFAULT_REVIEW_DAYS } from './types';
import { cn } from './lib/utils';

// Camada de dados (local por padrão; Firebase opcional) e IA via servidor
import { localStore, localAuth, loadBackends, exportBackup, importBackup, type Store, type AuthApi, type AppUser } from './data/store';
import { loadCodajas, loadCatalog, HOME_URL, GUIDE_URL, type Catalog } from './lib/catalog';
import { WeeklyOrder } from './components/WeeklyOrder';
import { IcamLists } from './components/IcamLists';
import { Methodology } from './components/Methodology';
import { CatalogBadges } from './components/CatalogBadges';

const COLORS = {
  A: '#fde047', // yellow-300
  B: '#a3e635', // lime-400
  C: '#d8b4fe', // purple-300
};


const EXAMPLE_DATA = [
  {
    "Medicamento": "FORMOTEROL 12 MCG+ BUDESONIDA 400 MCG FRCO 60 DOSES",
    "Total Usuários Ativos": 616,
    "Prazo de Entrega": 15,
    "Estoque": 120
  },
  {
    "Medicamento": "LEFLUNOMIDA 20MG COMP",
    "Total Usuários Ativos": 488,
    "Prazo de Entrega": 7,
    "Estoque": 500
  },
  {
    "Medicamento": "ADALIMUMABE 40 MG SER",
    "Total Usuários Ativos": 234,
    "Prazo de Entrega": 30,
    "Estoque": 45
  },
  {
    "Medicamento": "METOTREXATO 2,5MG CAP",
    "Total Usuários Ativos": 214,
    "Prazo de Entrega": 10,
    "Estoque": 1000
  }
];

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error('Erro de dados', operationType, path, error);
  alert('Não foi possível concluir a operação: ' + (error instanceof Error ? error.message : String(error)));
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

/*
class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let displayMessage = "Algo deu errado.";
      try {
        const parsedError = JSON.parse(this.state.error.message);
        if (parsedError.error && parsedError.error.includes("Missing or insufficient permissions")) {
          displayMessage = "Erro de permissão no banco de dados. Por favor, verifique se você está logado corretamente.";
        }
      } catch (e) {
        displayMessage = this.state.error.message || displayMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-100 max-w-md w-full text-center">
            <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Ops! Ocorreu um erro</h2>
            <p className="text-slate-600 mb-6">{displayMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
            >
              Recarregar Aplicativo
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
*/

function FlBar() {
  const [dark, setDark] = useState(() => { try { return localStorage.getItem('fl-theme') === 'dark'; } catch { return false; } });
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; try { localStorage.setItem('fl-theme', dark ? 'dark' : 'light'); } catch {} }, [dark]);
  return (
    <div className="fl-bar"><div className="fl-bar-in">
      <a className="fl-brand" href={HOME_URL} aria-label="PharmaCentral, início">
        <svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><defs><mask id="pcm1"><rect width="64" height="64" fill="#fff"/><circle cx="32" cy="32" r="11.5" fill="#000"/></mask></defs>
<g transform="rotate(-45 32 32)"><g mask="url(#pcm1)"><path d="M31 21H18a11 11 0 0 0 0 22h13Z" fill="#0A7C86"/><path d="M33 21h13a11 11 0 0 1 0 22H33Z" fill="#3157D5"/><path d="M16 26.5h13M35 26.5h13" strokeLinecap="round" strokeWidth="2.4" stroke="#fff" strokeOpacity=".28"/></g></g>
<circle cx="32" cy="32" r="9.6" fill="none" stroke="#F2B33D" strokeWidth="2.4"/><path d="M32 27v10M27 32h10" stroke="#F2B33D" strokeWidth="3" strokeLinecap="round"/></svg>
        <span>Pharma<b>Central</b></span>
      </a>
      <nav className="fl-mods" aria-label="Módulos">
        <a href={GUIDE_URL}><i />Controle terapêutico</a>
        <a className="est" href="./" aria-current="page"><i />Estoque</a>
        <a className="ped" href={HOME_URL + 'pedidos/'}><i />Pedidos</a>
        <a className="pro" href={HOME_URL + 'prontuario/'}><i />Prontuário</a>
      </nav>
      <span className="fl-sp" />
      <span className="fl-inst" title="Universidade Federal do Amazonas"><img src={`${import.meta.env.BASE_URL}ufam.png`} alt="Brasão da Universidade Federal do Amazonas" width={38} height={38} /><span className="fl-aut"><b>UFAM</b>Micael Oliveira (ICAM) · Ennylay (ICAM) · Elias Barros (HUGV)<span>Orient.: Profa. Dra. Clarice Veloso e Prof. Dr. Evandro Silva</span><span>Preceptora: Dra. Juliana Carvalho</span></span></span>
      <div className="fl-tools"><button className="fl-ic" onClick={() => setDark(d => !d)} aria-label="Alternar tema claro e escuro" title="Tema"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/></svg></button></div>
    </div></div>
  );
}

const DEFAULT_HOSPITALS = [
  { id: 'icam', name: 'ICAM' },
  { id: 'policlinica-codajas', name: 'Policlínica Codajás' },
];

export default function App() {
  const [backend, setBackend] = useState<{ store: Store; auth: AuthApi }>({ store: localStore, auth: localAuth });
  const store = backend.store;
  const authApi = backend.auth;
  const [user, setUser] = useState<AppUser | null>(null);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [reviewDays, setReviewDaysState] = useState<number>(() => Number(localStorage.getItem('abc:reviewDays')) || DEFAULT_REVIEW_DAYS);
  const setReviewDays = (n: number) => { setReviewDaysState(n); try { localStorage.setItem('abc:reviewDays', String(n)); } catch { /* ignore */ } };
  const [authLoading, setAuthLoading] = useState(true);
  const [hospitalName, setHospitalName] = useState<string>(() => localStorage.getItem('hospitalName') || '');
  const [hospitalId, setHospitalId] = useState<string>(() => localStorage.getItem('hospitalId') || '');
  const [savedHospitals, setSavedHospitals] = useState<{id: string, name: string}[]>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('savedHospitals') || '[]');
      const extra = (Array.isArray(parsed) ? parsed : []).filter((h: {id: string}) => !DEFAULT_HOSPITALS.some(d => d.id === h.id));
      return [...DEFAULT_HOSPITALS, ...extra];
    } catch {
      return [...DEFAULT_HOSPITALS];
    }
  });
  const [tempHospitalName, setTempHospitalName] = useState('');
  
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [calculationMode, setCalculationMode] = useState<ABCCalculationMode>('VALUE');
  const [editingCell, setEditingCell] = useState<{id: string, field: string} | null>(null);
  const [editCellValue, setEditCellValue] = useState<string | number>('');
  const isEditMode = false; // edição de quantidades feita na janela Gerenciar quantidade em estoque
  const setIsEditMode = (_v: boolean) => {};
  // alterações digitadas e ainda não salvas: id -> campo -> texto digitado
  const [sector, setSector] = useState<'caf' | 'clinica'>(() => (localStorage.getItem('sector') === 'clinica' ? 'clinica' : 'caf'));
  const scope = sector === 'clinica' ? `${hospitalId}~clinica` : hospitalId;
  const sectorName = sector === 'clinica' ? 'Farmácia Clínica' : 'CAF';
  const [closedForms, setClosedForms] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('closed-forms') || '[]'); } catch { return []; } });
  const toggleForm = (k: string) => setClosedForms(prev => { const next = prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]; try { localStorage.setItem('closed-forms', JSON.stringify(next)); } catch { /* ignore */ } return next; });
  const [showQty, setShowQty] = useState(false);
  const [qtyAdd, setQtyAdd] = useState(false);
  const [qtyDel, setQtyDel] = useState<string | null>(null);
  const [qtyDraft, setQtyDraft] = useState<Record<string, string>>({});
  const [qtyFilter, setQtyFilter] = useState('');
  const [qtyMsg, setQtyMsg] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Record<string, string>>>({});
  const draftCount = Object.keys(drafts).length;
  const [showAnvisaModal, setShowAnvisaModal] = useState(false);
  const [priceFilter, setPriceFilter] = useState('');
  
  const RefArea = ReferenceArea as any;
  
  const [manualEntry, setManualEntry] = useState<Omit<Medication, 'id'>>({
    name: '',
    pharmaceuticalForm: '',
    concentration: '',
    annualConsumption: 0,
    unitCost: 0,
    leadTimeDays: 7,
    maxMonthlyConsumption: 0,
    activeUsers: 0,
    currentInventory: undefined,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Backend (local ou Firebase) e usuário
  useEffect(() => { loadBackends().then(setBackend).catch(e => console.error('Backend:', e)); }, []);
  useEffect(() => { loadCatalog().then(setCatalog); }, []);
  useEffect(() => {
    const unsubscribe = authApi.onUser((u) => { setUser(u); setAuthLoading(false); });
    return () => unsubscribe();
  }, [authApi]);

  const handleLogin = async () => {
    try {
      await authApi.login();
    } catch (err) {
      console.error("Erro no login:", err);
      alert("Falha na autenticação com Google.");
    }
  };

  const handleLogout = async () => {
    try {
      if (authApi.mode === 'local') { handleChangeHospital(); return; }
      await authApi.logout();
    } catch (err) {
      console.error("Erro no logout:", err);
    }
  };

  const scrollTableRight = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const downloadExampleFile = () => {
    const ws = XLSX.utils.json_to_sheet(EXAMPLE_DATA);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Exemplo");
    XLSX.writeFile(wb, "exemplo_importacao_abc.xlsx");
  };

  const slugify = (text: string) => {
    return text
      .toString()
      .normalize('NFD')               // Split accents from letters
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-');         // Replace multiple - with single -
  };

  const handleSetHospital = (e?: React.FormEvent, existing?: {id: string, name: string}) => {
    if (e) e.preventDefault();
    
    let name = '';
    let id = '';
    
    if (existing) {
      name = existing.name;
      id = existing.id;
    } else {
      if (!tempHospitalName.trim()) return;
      name = tempHospitalName.trim();
      id = slugify(name);
    }
    
    setHospitalName(name);
    setHospitalId(id);
    localStorage.setItem('hospitalName', name);
    localStorage.setItem('hospitalId', id);

    // Update saved hospitals list
    setSavedHospitals(prev => {
      const exists = prev.some(h => h.id === id);
      if (exists) return prev;
      const updated = [...prev, { id, name }];
      localStorage.setItem('savedHospitals', JSON.stringify(updated.filter(h => !DEFAULT_HOSPITALS.some(d => d.id === h.id))));
      return updated;
    });
  };

  const handleRemoveSavedHospital = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Remover este hospital da sua lista? Os dados no banco de dados NÃO serão excluídos.")) {
      const updated = savedHospitals.filter(h => h.id !== id);
      setSavedHospitals(updated);
      localStorage.setItem('savedHospitals', JSON.stringify(updated.filter(h => !DEFAULT_HOSPITALS.some(d => d.id === h.id))));
    }
  };

  const handleChangeHospital = () => {
    setHospitalName('');
    setHospitalId('');
    localStorage.removeItem('hospitalName');
    localStorage.removeItem('hospitalId');
    setTempHospitalName('');
  };

  // Firestore Listener
  useEffect(() => {
    if (!hospitalId) {
      setMedications([]);
      return;
    }

    let seeded = false;
    const unsubscribe = store.subscribe(scope, (list) => {
      setMedications(list);
      if (seeded) return;
      seeded = true;
      const flag = `seeded:${hospitalId}`;
      let done = false;
      try { done = localStorage.getItem(flag) === '1'; } catch { /* ignore */ }
      if (done) return;
      try { localStorage.setItem(flag, '1'); } catch { /* ignore */ }
      if (list.length === 0 && sector === 'caf') {
        if (hospitalId === 'icam') void importIcam(hospitalId, list);
        else if (hospitalId === 'policlinica-codajas') void importCodajas(hospitalId, list);
      }
    });
    return () => unsubscribe();
  }, [hospitalId, store, scope, sector]);

  const abcResults = useMemo(() => calculateABC(medications, calculationMode, reviewDays), [medications, calculationMode, reviewDays]);
  const stockByCode = useMemo(() => {
    const m: Record<string, { inv: number | null; cmm: number }> = {};
    abcResults.forEach(r => { if (r.cafCode) m[r.cafCode] = { inv: r.currentInventory ?? null, cmm: r.monthlyConsumption }; });
    return m;
  }, [abcResults]);

  const stats = useMemo(() => {
    const totalValue = abcResults.reduce((sum, item) => sum + item.totalValue, 0);
    const totalAnalysisValue = abcResults.reduce((sum, item) => sum + item.analysisValue, 0);
    const countA = abcResults.filter(r => r.classification === 'A').length;
    const countB = abcResults.filter(r => r.classification === 'B').length;
    const countC = abcResults.filter(r => r.classification === 'C').length;
    
    return { totalValue, totalAnalysisValue, countA, countB, countC };
  }, [abcResults]);

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalId || !user) return;
    // Allow unitCost to be 0 if they want to fetch it from Anvisa
    if (!manualEntry.name || manualEntry.annualConsumption <= 0) return;
    
    setIsSaving(true);
    try {
      await store.add(scope, {
        ...manualEntry,
        // Convert monthly input to annual for internal logic
        annualConsumption: manualEntry.annualConsumption * 12,
      });
      
      setManualEntry({ 
        name: '', 
        pharmaceuticalForm: '',
        concentration: '',
        annualConsumption: 0, 
        unitCost: 0, 
        leadTimeDays: 7, 
        maxMonthlyConsumption: 0,
        activeUsers: 0
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'medications');
    } finally {
      setIsSaving(false);
    }
  };

  const removeMedication = async (id: string) => {
    if (!hospitalId || !user) return;
    try {
      await store.remove(scope, id);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `medications/${id}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hospitalId) {
      alert("Por favor, informe o Hospital para importar dados.");
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = evt.target?.result;
      if (!data) return;
      
      const wb = XLSX.read(data, { type: 'array' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const jsonData = XLSX.utils.sheet_to_json<any>(ws);

      setIsSaving(true);
      try {
        const docs: Omit<Medication, 'id'>[] = [];
        for (const row of jsonData) {
          const name = row.Medicamento || row.Nome || row.name || row.Item;
          if (!name) continue;
          const cafRaw = row.CAF ?? row['Código CAF'] ?? row['Codigo CAF'] ?? row.codigo;
          const activeUsers = Number(row['Total Usuários Ativos'] || row.usuarios || row.activeUsers || 0);
          const monthlyConsumptionInput = Number(row.ConsumoMensal || row.Consumo || row.consumo || row.consumption || activeUsers || 0);
          const maxMonthlyConsumption = Number(row.ConsumoMaximo || row.max_consumption || row['Consumo Máximo'] || 0);
          const currentInventory = row.Inventario ?? row.Estoque ?? row.inventory ?? row.stock;
          docs.push({
            name,
            cafCode: cafRaw != null && String(cafRaw).trim() !== '' ? String(cafRaw).trim() : undefined,
            pharmaceuticalForm: row['Forma Farmacêutica'] || row.forma || row.form || '',
            concentration: row['Concentração'] || row.concentracao || row.concentration || '',
            annualConsumption: monthlyConsumptionInput * 12,
            // Preço não é importado: use "Preços Anvisa" (confira na tabela CMED oficial)
            unitCost: 0,
            leadTimeDays: Number(row.LeadTime || row.prazo || row['Lead Time'] || 7),
            maxMonthlyConsumption: maxMonthlyConsumption || 0,
            activeUsers,
            currentInventory: currentInventory !== undefined && currentInventory !== '' ? Number(currentInventory) : null,
          });
        }
        const count = docs.length;
        if (count > 0) await store.addMany(scope, docs);
        
        alert(`Sucesso! ${count} itens foram importados para o banco de dados.`);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'medications');
      } finally {
        setIsSaving(false);
      }
    };
    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const applyAnvisaPrice = async (medId: string, price: number) => {
    try {
      await store.update(scope, medId, { unitCost: price });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `medications/${medId}`);
    }
  };

  const setDraft = (id: string, field: string, v: string) =>
    setDrafts(d => ({ ...d, [id]: { ...(d[id] || {}), [field]: v } }));
  const dv = (id: string, field: string, orig: number | null | undefined) => {
    const d = drafts[id]?.[field];
    return d !== undefined ? d : (orig === -1 || orig === null || orig === undefined ? '' : String(orig));
  };
  const saveDrafts = async () => {
    if (!draftCount || !user) return;
    setIsSaving(true);
    try {
      for (const [id, fields] of Object.entries(drafts)) {
        const upd: Record<string, number> = {};
        Object.entries(fields).forEach(([f, v]) => {
          const n = v.trim() === '' ? (f === 'currentInventory' ? -1 : 0) : Number(v.replace(',', '.'));
          if (Number.isFinite(n)) upd[f] = n;
        });
        if (Object.keys(upd).length) await store.update(scope, id, upd as Partial<Medication>);
      }
      setDrafts({});
      setIsEditMode(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'medications');
    } finally {
      setIsSaving(false);
    }
  };
  const openQty = () => { setQtyDraft({}); setQtyFilter(''); setQtyMsg(null); setShowQty(true); };
  const qtyChanged = Object.keys(qtyDraft).length;
  const saveQty = async () => {
    if (!qtyChanged || !user) return;
    setIsSaving(true);
    try {
      let n = 0;
      for (const [id, v] of Object.entries(qtyDraft) as [string, string][]) {
        const num = v.trim() === '' ? -1 : Number(v.replace(',', '.'));
        if (!Number.isFinite(num)) continue;
        await store.update(scope, id, { currentInventory: num } as Partial<Medication>);
        n++;
      }
      setQtyDraft({});
      setQtyMsg(`Quantidades salvas: ${n} ${n === 1 ? 'item atualizado' : 'itens atualizados'}.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'medications');
    } finally {
      setIsSaving(false);
    }
  };
  const discardDrafts = () => { setDrafts({}); setIsEditMode(false); };

  const startEditing = (id: string, field: string, value: any) => {
    setEditingCell({ id, field });
    setEditCellValue(value === -1 || value === null || value === undefined ? 0 : value);
  };

  const saveCellEdit = async () => {
    if (!editingCell || !user) return;
    const { id, field } = editingCell;
    
    try {
      let valueToSave = editCellValue;
      if (typeof editCellValue === 'string' && !isNaN(Number(editCellValue)) && field !== 'name') {
        valueToSave = Number(editCellValue);
      }

      await store.update(scope, id, { [field]: valueToSave } as Partial<Medication>);
      setEditingCell(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `medications/${id}`);
    }
  };

  const updateManualClassification = async (id: string, newClass: 'A' | 'B' | 'C') => {
    if (!user) return;
    if (window.confirm(`Deseja realmente alterar a classificação deste item para Classe ${newClass}?`)) {
      try {
        await store.update(scope, id, { manualClassification: newClass });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `medications/${id}`);
      }
    }
  };

  const resetManualClassification = async (id: string) => {
    if (!user) return;
    try {
      await store.update(scope, id, { manualClassification: null });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `medications/${id}`);
    }
  };

  // Carga automática da lista oficial ao abrir a unidade pela primeira vez (sem botões nem confirmações).
  const importIcam = async (hid: string, current: Medication[]) => {
    const cat = catalog ?? await loadCatalog();
    if (!cat) return;
    const have = new Set(current.map(m => m.cafCode).filter(Boolean));
    const novos = cat.items.filter(i => !have.has(i.code));
    if (!novos.length) return;
    setIsSaving(true);
    try {
      await store.addMany(hid, novos.map(i => ({
        name: i.desc, cafCode: i.code, pharmaceuticalForm: i.forma || cat.sec[i.sec] || '', concentration: i.mgml ? `${i.mgml} mg/mL` : '',
        annualConsumption: 0, unitCost: 0, leadTimeDays: 7, maxMonthlyConsumption: 0, activeUsers: 0, currentInventory: null,
      })));
    } catch (error) { handleFirestoreError(error, OperationType.CREATE, 'medications'); }
    finally { setIsSaving(false); }
  };

  const importCodajas = async (hid: string, current: Medication[]) => {
    const lista = await loadCodajas();
    if (!lista) return;
    const have = new Set(current.map(m => m.name.trim().toLowerCase()));
    const novos = lista.itens.filter(i => !have.has(i.name.trim().toLowerCase()));
    if (!novos.length) return;
    setIsSaving(true);
    try {
      await store.addMany(hid, novos.map(i => ({
        name: i.name, pharmaceuticalForm: '', concentration: '', activeUsers: i.activeUsers || 0, annualConsumption: (i.activeUsers || 0) * 12,
        unitCost: i.unitCost || 0, leadTimeDays: 7, maxMonthlyConsumption: 0, currentInventory: null,
      })));
    } catch (error) { handleFirestoreError(error, OperationType.CREATE, 'medications'); }
    finally { setIsSaving(false); }
  };

  const doBackup = () => {
    const blob = new Blob([exportBackup(scope)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `backup_abc_${scope}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const restoreInputRef = useRef<HTMLInputElement>(null);
  const doRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!window.confirm('Restaurar substitui TODOS os dados desta unidade neste navegador. Continuar?')) { e.target.value = ''; return; }
    f.text().then(t => alert(`${importBackup(scope, t)} itens restaurados.`)).catch(err => alert('Falha ao restaurar: ' + err.message)).finally(() => { e.target.value = ''; });
  };

  const exportToPdf = () => {
    const P = (window as any).PCPDF;
    if (!P || !abcResults.length) return;
    const nf = (n: number) => (Number.isFinite(n) ? n.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : '-');
    const rows: any[] = [];
    (['A', 'B', 'C'] as const).forEach(c => {
      const l = abcResults.filter(r => r.classification === c);
      if (!l.length) return;
      rows.push({ sec: 'Classe ' + c + ' (' + l.length + ' itens)' });
      l.forEach(r => rows.push([r.name + (r.concentration ? ' ' + r.concentration : ''), c, nf(r.annualConsumption), 'R$ ' + nf(r.totalValue), nf(r.cumulativePercentage) + '%', nf(r.safetyStock), nf(r.reorderPoint), nf(r.targetStock), r.suggestedOrder != null ? nf(r.suggestedOrder) : '-']));
    });
    const u = P.build({
      titulo: 'Controle de estoque e curva ABC',
      sub: (hospitalName ? 'Unidade: ' + hospitalName + '. ' : '') + abcResults.length + ' itens classificados.',
      cols: [{ h: 'Medicamento', w: 4 }, { h: 'Classe', w: 0.8 }, { h: 'Consumo anual', w: 1.3 }, { h: 'Valor total', w: 1.4 }, { h: '% acum.', w: 1 }, { h: 'Estoque emerg.', w: 1.2 }, { h: 'Ponto de pedido', w: 1.2 }, { h: 'Padrão', w: 1 }, { h: 'Pedido', w: 1 }],
      rows,
      nota: 'Curva ABC: classe A até 80% do valor ou consumo, B até 95% e C o restante. Parâmetros de estoque calculados a partir do consumo informado.',
      rodape: 'Estoque',
    });
    P.save('PharmaCentral-estoque-curva-abc.pdf', u);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(abcResults.map(r => ({
      'Medicamento': r.name,
      'Forma Farmacêutica': r.pharmaceuticalForm || '',
      'Concentração': r.concentration || '',
      'Usuários Ativos': r.activeUsers || 0,
      'Consumo Anual': r.annualConsumption,
      'Custo Unitário': r.unitCost,
      'Valor Total': r.totalValue.toFixed(2),
      'Consumo Mensal Médio': r.monthlyConsumption.toFixed(2),
      'Consumo Diário Médio': r.avgDailyConsumption.toFixed(2),
      'Estoque de Emergência': r.safetyStock,
      'Ponto de Pedido': r.reorderPoint,
      'PADRÃO': r.targetStock,
      'PEDIDO': r.suggestedOrder ?? '',
      'CAF': r.cafCode || '',
      'Classificação': r.classification,
      '% Acumulado': r.cumulativePercentage.toFixed(2) + '%'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Resultados ABC");
    XLSX.writeFile(wb, "curva_abc_hospitalar.xlsx");
  };

  const chartData = abcResults.slice(0, 20).map(r => ({
    name: r.name.length > 15 ? r.name.substring(0, 12) + '...' : r.name,
    valor: r.analysisValue,
    class: r.classification
  }));

  const paretoData = useMemo(() => {
    if (medications.length === 0) return [];
    
    // Results are already sorted by classification / analysis value in calculateABC
    const data = [{
      name: 'Start',
      itemCountPerc: 0,
      cumulativeValuePerc: 0,
      classification: 'A'
    }];
    
    abcResults.forEach((r, index) => {
      data.push({
        name: r.name,
        itemCountPerc: ((index + 1) / abcResults.length) * 100,
        cumulativeValuePerc: r.cumulativePercentage,
        classification: r.classification
      });
    });
    
    return data;
  }, [abcResults]);

  const classSplits = useMemo(() => {
    const total = abcResults.length;
    if (total === 0) return { a: 0, b: 0 };
    
    const countA = abcResults.filter(r => r.classification === 'A').length;
    const countB = abcResults.filter(r => r.classification === 'B').length;
    
    return {
      a: (countA / total) * 100,
      b: ((countA + countB) / total) * 100
    };
  }, [abcResults]);

  const pieData = [
    { name: 'Classe A', value: stats.countA, fill: COLORS.A },
    { name: 'Classe B', value: stats.countB, fill: COLORS.B },
    { name: 'Classe C', value: stats.countC, fill: COLORS.C },
  ];

  if (!hospitalId) {
    return (
      <div className="min-h-screen bg-slate-50">
        <FlBar />
        <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 grid lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-start">
          <section className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 leading-[1.05]" style={{fontFamily:'var(--f-display)'}}>Estoque e Curva ABC</h1>
            <p className="text-lg text-slate-600 max-w-xl">Importe a planilha de consumo e veja quais itens concentram o gasto, quanto dura o estoque de cada um e o que repor primeiro.</p>
            <ul className="grid sm:grid-cols-3 gap-3 text-sm">
              {[['A · B · C','Classificação por valor consumido, com o corte ajustável'],['Cobertura','Dias de estoque por item e alerta de ruptura'],['Offline','Dados só neste aparelho, sem conta e sem nuvem']].map(([t,d])=>(
                <li key={t} className="border border-slate-200 rounded-xl bg-white p-4"><b className="block text-slate-900 mb-1">{t}</b><span className="text-slate-500">{d}</span></li>
              ))}
            </ul>
            <button onClick={downloadExampleFile} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline">
              <FileSpreadsheet size={16} />
              Baixar planilha de exemplo (.xlsx)
            </button>
            <div className="pt-6 border-t border-slate-200 text-sm text-slate-500 space-y-1">
              <p><b className="text-slate-700">Autores</b> · Micael Davi Lima de Oliveira (ICAM), Ennylay (ICAM) e Elias Barros (HUGV)</p>
              <p><b className="text-slate-700">Orientação</b> · Profa. Dra. Clarice Veloso e Prof. Dr. Evandro Silva</p>
              <p><b className="text-slate-700">Preceptora</b> · Dra. Juliana Carvalho</p>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-7 space-y-6 lg:sticky lg:top-24">
            <div>
              <h2 className="text-xl font-semibold text-slate-900" style={{fontFamily:'var(--f-display)'}}>Escolha a unidade</h2>
              <p className="text-sm text-slate-500 mt-1">ICAM e Policlínica Codajás já vêm com a lista de itens carregada. Você também pode adicionar outro hospital, com estoque próprio.</p>
            </div>
            {savedHospitals.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">Unidades</p>
                {savedHospitals.map(h => (
                  <div key={h.id} onClick={() => handleSetHospital(undefined, h)}
                    className="group flex items-center justify-between gap-3 px-4 py-3 border border-slate-200 rounded-xl hover:border-blue-600 hover:bg-blue-50 cursor-pointer">
                    <span className="font-semibold text-slate-800">{h.name}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-blue-700">Abrir</span>
                      {!DEFAULT_HOSPITALS.some(d => d.id === h.id) && <button onClick={(e) => handleRemoveSavedHospital(h.id, e)} aria-label="Remover da lista" className="p-1.5 text-slate-400 hover:text-red-500 rounded-md"><Trash2 size={14} /></button>}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={handleSetHospital} className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700" htmlFor="hosp">Adicionar outro hospital</label>
              <input id="hosp" type="text" value={tempHospitalName} onChange={e => setTempHospitalName(e.target.value)}
                placeholder="Ex.: Hospital Universitário Getúlio Vargas"
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-base" autoFocus required />
              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold">Abrir estoque</button>
            </form>
            <p className="text-xs text-slate-500">Seus dados ficam só neste navegador. Use Backup para guardar uma cópia ou levar para outro aparelho.</p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <FlBar />
        <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-8">
          
          {/* Cabeçalho */}
          <header className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 md:p-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900" style={{fontFamily:'var(--f-display)'}}>Estoque e Curva ABC</h1>
                <p className="text-slate-500 text-sm mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="inline-flex items-center gap-2"><Activity size={15} className="text-blue-600" /><b className="text-slate-800">{hospitalName}</b>
                    <button onClick={handleChangeHospital} className="text-blue-700 font-semibold hover:underline">Trocar</button></span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Salvo neste navegador</span>
                </p>
              </div>
              {user && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Usuário</p>
                    <p className="text-sm font-semibold text-slate-700 truncate max-w-[180px]">{user.displayName || user.email}</p>
                  </div>
                  <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-red-500 rounded-xl border border-slate-200" title="Sair"><LogOut size={18} /></button>
                </div>
              )}
            </div>

            {/* Global Actions Bar */}
            <div className="bg-slate-100 p-3 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl transition-all font-bold text-xs border border-slate-200 shadow-sm"
                >
                  <Upload size={14} />
                  Importar Planilha
                </button>
                
                {store.mode === 'local' && (<>
                  <button onClick={doBackup} className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs border border-slate-200 shadow-sm">Backup</button>
                  <button onClick={() => restoreInputRef.current?.click()} className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs border border-slate-200 shadow-sm">Restaurar</button>
                  <input type="file" ref={restoreInputRef} onChange={doRestore} accept=".json" className="hidden" />
                </>)}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <button
                    onClick={openQty}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl transition-all font-bold text-xs hover:bg-blue-700 shadow-sm"
                  >
                    <Package size={14} />
                    Gerenciar quantidade em estoque
                  </button>

                  <button 
                    onClick={() => setShowAnvisaModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl transition-all font-bold text-xs hover:bg-emerald-700 shadow-sm shadow-emerald-100"
                  >
                    <Search size={14} />
                    Preços (CMED)
                  </button>
                </div>

                <div className="w-px h-6 bg-slate-300" />

                <div className="flex items-center gap-1">
                  <button onClick={downloadExampleFile} className="p-2 text-slate-400 hover:text-slate-600 transition-colors" title="Planilha Exemplo">
                    <FileSpreadsheet size={18} />
                  </button>
                  <button onClick={exportToExcel} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors" title="Exportar Excel">
                    <Download size={18} />
                  </button>
                  <button onClick={exportToPdf} className="p-2 text-slate-400 hover:text-red-600 transition-colors text-xs font-bold" title="Relatório em PDF">PDF</button>
                </div>

                <button 
                  onClick={async () => {
                    if (draftCount > 0) { await saveDrafts(); return; }
                    if (medications.length === 0 || !user) return;
                    setIsSaving(true);
                    try {
                      const processedCount = await store.syncAll(scope, medications);
                      alert(store.mode === 'local' ? `Os ${processedCount} itens já estão salvos neste navegador (salvamento automático). Use "Backup" para guardar uma cópia.` : `Sucesso! ${processedCount} itens sincronizados.`);
                    } catch (err) {
                      handleFirestoreError(err, OperationType.WRITE, 'medications');
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving || medications.length === 0 || !user}
                  className={cn("px-6 py-2 text-white rounded-xl font-black text-xs transition-all active:scale-95 disabled:opacity-50 shadow-md", draftCount > 0 ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-900 hover:bg-black")}
                >
                  {isSaving ? <Loader2 className="animate-spin" size={14} /> : (draftCount > 0 ? `Salvar alterações (${draftCount})` : (store.mode === 'local' ? "Salvar" : "Salvar no banco"))}
                </button>
              </div>
            </div>
            
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv,.xlsx,.xls" className="hidden" />
          </header>

          {showQty && (
            <div role="dialog" aria-modal="true" aria-label="Gerenciar quantidade em estoque" className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-3" onClick={e => { if (e.target === e.currentTarget && !isSaving) setShowQty(false); }}>
              <div className="bg-white text-slate-900 rounded-2xl shadow-2xl w-[min(96vw,720px)] max-h-[88vh] flex flex-col">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200">
                  <h2 className="flex-1 text-base font-black">Gerenciar quantidade em estoque · {sectorName}</h2>
                  <button onClick={() => setShowQty(false)} disabled={isSaving} aria-label="Fechar" className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
                </div>
                <div className="px-5 pt-3">
                  <button onClick={() => { setQtyAdd(v => !v); setQtyMsg(null); }} className="flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-800">
                    <Plus size={16} className={qtyAdd ? 'rotate-45 transition-transform' : 'transition-transform'} />
                    {qtyAdd ? 'Fechar o cadastro' : 'Adicionar medicamento'}
                  </button>
                  {qtyAdd && (
                    <form onSubmit={async e => {
                      e.preventDefault();
                      if (!manualEntry.name.trim() || !(manualEntry.annualConsumption > 0)) { setQtyMsg('Informe o nome e o consumo mensal (maior que zero).'); return; }
                      await handleManualAdd(e);
                      setQtyMsg(`Medicamento adicionado ao inventário ${sectorName}.`);
                    }} className="mt-3 grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      {([['name', 'Nome', 'text', 'col-span-2'], ['pharmaceuticalForm', 'Forma farmacêutica', 'text', ''], ['concentration', 'Concentração', 'text', ''], ['annualConsumption', 'Consumo mensal', 'number', ''], ['unitCost', 'Custo unitário (R$)', 'number', ''], ['currentInventory', 'Estoque atual', 'number', ''], ['leadTimeDays', 'Lead time (dias)', 'number', '']] as const).map(([f, label, type, span]) => (
                        <label key={f} className={cn('text-xs font-bold text-slate-600', span)}>{label}
                          <input type={type} step={f === 'unitCost' ? '0.01' : undefined} inputMode={type === 'number' ? 'decimal' : undefined}
                            value={(manualEntry as any)[f] === undefined || (manualEntry as any)[f] === 0 && type === 'number' ? '' : (manualEntry as any)[f]}
                            onChange={e => setManualEntry(prev => ({ ...prev, [f]: type === 'number' ? (e.target.value === '' ? (f === 'currentInventory' ? undefined : 0) : Number(e.target.value)) : e.target.value }))}
                            className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-normal outline-none focus:ring-2 focus:ring-blue-500" />
                        </label>
                      ))}
                      <button type="submit" disabled={isSaving} className="col-span-2 py-2 rounded-lg bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 disabled:opacity-50">Adicionar ao inventário</button>
                    </form>
                  )}
                </div>
                <div className="px-5 pt-3">
                  <input value={qtyFilter} onChange={e => setQtyFilter(e.target.value)} placeholder="Buscar medicamento ou código" className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-3">
                  {medications.filter(m => { const q = qtyFilter.trim().toLowerCase(); return !q || (m.name + ' ' + (m.cafCode || '')).toLowerCase().includes(q); }).map(m => (
                    <label key={m.id} className="flex items-center gap-3 py-1.5 border-b border-slate-100">
                      <span className="flex-1 text-sm leading-snug">{m.name}{m.concentration ? ' ' + m.concentration : ''}{m.cafCode ? <span className="text-slate-400 text-xs"> · {m.cafCode}</span> : null}</span>
                      <input inputMode="decimal"
                        value={qtyDraft[m.id] ?? (m.currentInventory === -1 || m.currentInventory == null ? '' : String(m.currentInventory))}
                        onChange={e => { setQtyMsg(null); setQtyDraft(d => ({ ...d, [m.id]: e.target.value })); }}
                        placeholder="—"
                        className={cn('w-28 px-2 py-1.5 border rounded-lg text-right text-base outline-none focus:ring-2 focus:ring-blue-500', qtyDraft[m.id] !== undefined ? 'border-amber-400 bg-amber-50' : 'border-slate-300')} />
                      {qtyDel === m.id ? (
                        <span className="flex items-center gap-1">
                          <button type="button" onClick={async e => { e.preventDefault(); await removeMedication(m.id); setQtyDel(null); setQtyMsg(`Medicamento excluído do inventário ${sectorName}.`); }} className="px-2 py-1 rounded-lg bg-red-600 text-white text-xs font-bold">Confirmar exclusão</button>
                          <button type="button" onClick={e => { e.preventDefault(); setQtyDel(null); }} className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancelar</button>
                        </span>
                      ) : (
                        <button type="button" aria-label={`Excluir ${m.name}`} onClick={e => { e.preventDefault(); setQtyDel(m.id); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                      )}
                    </label>
                  ))}
                </div>
                <div className="px-5 py-3 border-t border-slate-200 flex items-center gap-3">
                  <p role="status" aria-live="polite" className={cn('flex-1 text-sm', qtyMsg ? 'text-emerald-700 font-bold' : 'text-slate-500')}>
                    {qtyMsg ?? (qtyChanged ? `${qtyChanged} ${qtyChanged === 1 ? 'item alterado' : 'itens alterados'}. Clique em Salvar.` : 'Digite as quantidades e clique em Salvar.')}
                  </p>
                  <button onClick={() => setShowQty(false)} disabled={isSaving} className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100">Fechar</button>
                  <button onClick={saveQty} disabled={isSaving || !qtyChanged} className="px-5 py-2 rounded-xl text-sm font-black bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed">{isSaving ? 'Salvando…' : 'Salvar quantidades'}</button>
                </div>
              </div>
            </div>
          )}

          {(isEditMode || draftCount > 0) && (
            <div role="region" aria-label="Salvar alterações" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[min(94vw,640px)] flex items-center gap-3 bg-slate-900 text-white rounded-2xl shadow-2xl px-4 py-3">
              <p className="flex-1 text-sm leading-snug">
                {draftCount > 0
                  ? <><b>{draftCount}</b> {draftCount === 1 ? 'item alterado' : 'itens alterados'}. Salve para guardar.</>
                  : 'Digite as quantidades direto na tabela. Os campos alterados ficam em amarelo.'}
              </p>
              <button onClick={discardDrafts} disabled={isSaving} className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-50">
                {draftCount > 0 ? 'Descartar' : 'Fechar'}
              </button>
              <button onClick={saveDrafts} disabled={isSaving || draftCount === 0} className="px-5 py-2 rounded-xl text-sm font-black bg-emerald-500 hover:bg-emerald-400 text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed">
                {isSaving ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          )}

            <div role="tablist" aria-label="Inventário" className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500 mr-1">Inventário</span>
              {([['clinica', 'Medicamentos na Farmácia Clínica'], ['caf', 'Medicamentos no CAF']] as const).map(([k, label]) => (
                <button key={k} role="tab" aria-selected={sector === k}
                  onClick={() => { setSector(k); try { localStorage.setItem('sector', k); } catch { /* ignore */ } setEditingCell(null); }}
                  className={cn('px-4 py-2 rounded-xl text-sm font-bold border transition-all', sector === k ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300')}>
                  {label}
                </button>
              ))}
              <span className="text-xs text-slate-500">São dois inventários separados: o que você muda em um não altera o outro.</span>
            </div>

            {hospitalId === 'icam' && sector === 'caf' && <IcamLists unit={hospitalName} catalog={catalog} stock={stockByCode} />}

            <WeeklyOrder results={abcResults} reviewDays={reviewDays} setReviewDays={setReviewDays} catalog={catalog} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
          {/* Right Column: Analysis and Charts */}
          <div className="lg:col-span-3 space-y-6">
            
            {medications.length === 0 ? (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                  <BarChart3 size={64} className="text-slate-200 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-400">Aguardando dados para análise</h3>
                  <p className="text-slate-400 max-w-sm mt-2">
                    Importe uma planilha ou adicione medicamentos em Gerenciar quantidade em estoque para visualizar a Curva ABC e parâmetros de estoque.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Alerts Panel */}
                {abcResults.some(item => item.currentInventory !== -1 && item.currentInventory < item.safetyStock) && (
                  <section className="bg-red-50 border border-red-200 rounded-2xl p-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-2 mb-4 text-red-700">
                      <AlertTriangle size={24} />
                      <h2 className="text-lg font-bold">Alertas de Estoque Crítico</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {abcResults
                        .filter(item => item.currentInventory !== -1 && item.currentInventory < item.safetyStock)
                        .map(item => (
                          <div key={item.id} className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex flex-col justify-between">
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{item.name}</h4>
                              <p className="text-[10px] text-slate-500 uppercase">{item.pharmaceuticalForm} {item.concentration}</p>
                              <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs text-slate-600">Inventário: <span className="font-bold text-red-600">{item.currentInventory}</span></span>
                                <span className="text-xs text-slate-600">Emergência: <span className="font-bold">{item.safetyStock}</span></span>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded uppercase">Crítico</span>
                              <span className="text-[10px] text-slate-400">Faltam {item.safetyStock - item.currentInventory} un.</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </section>
                )}

                {/* Stats Summary & Mode Toggle */}
                <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-700">Critério de Classificação ABC</p>
                    <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                      <button 
                        onClick={() => setCalculationMode('VALUE')}
                        className={cn(
                          "px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2",
                          calculationMode === 'VALUE' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        <Calculator size={16} />
                        Valor Total (R$)
                      </button>
                      <button 
                        onClick={() => setCalculationMode('CONSUMPTION')}
                        className={cn(
                          "px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2",
                          calculationMode === 'CONSUMPTION' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        <Package size={16} />
                        Consumo (Qtd)
                      </button>
                    </div>
                  </div>
                  <div className="text-right bg-slate-50 px-6 py-3 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Analisado ({calculationMode === 'VALUE' ? 'Financeiro' : 'Volume'})</p>
                    <p className="text-2xl font-black text-slate-900">
                      {calculationMode === 'VALUE' 
                        ? `R$ ${stats.totalAnalysisValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        : `${stats.totalAnalysisValue.toLocaleString('pt-BR')} un.`
                      }
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Valor Total</p>
                    <p className="text-2xl font-bold text-slate-900">R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                    <p className="text-xs font-bold text-red-500 uppercase tracking-wider">Classe A (80%)</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.countA} itens</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                    <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Classe B (15%)</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.countB} itens</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Classe C (5%)</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.countC} itens</p>
                  </div>
                </div>

                {/* Charts Section */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <TrendingUp size={20} className="text-blue-600" />
                      Gráfico de Pareto (Curva ABC de Pareto)
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-[#fde047]"></div> Classe A</div>
                      <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-[#a3e635]"></div> Classe B</div>
                      <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-[#d8b4fe]"></div> Classe C</div>
                    </div>
                  </div>
                  
                  <div className="h-[500px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={paretoData} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
                        <defs>
                          <linearGradient id="areaColor" x1="0" y1="0" x2="1" y2="0">
                            <stop offset={`${classSplits.a}%`} stopColor={COLORS.A} stopOpacity={0.8}/>
                            <stop offset={`${classSplits.a}%`} stopColor={COLORS.B} stopOpacity={0.8}/>
                            <stop offset={`${classSplits.b}%`} stopColor={COLORS.B} stopOpacity={0.8}/>
                            <stop offset={`${classSplits.b}%`} stopColor={COLORS.C} stopOpacity={0.8}/>
                            <stop offset="100%" stopColor={COLORS.C} stopOpacity={0.8}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          type="number"
                          dataKey="itemCountPerc" 
                          domain={[0, 100]}
                          tickCount={6}
                          fontSize={12}
                          stroke="#94a3b8"
                          label={{ value: '% Quantidade de Itens', position: 'insideBottom', offset: -25, fill: '#64748b', fontSize: 13, fontWeight: 'bold' }}
                        />
                        <YAxis 
                          fontSize={12}
                          stroke="#94a3b8"
                          domain={[0, 100]}
                          tickCount={6}
                          label={{ value: '% Valor Acumulado', angle: -90, position: 'insideLeft', offset: 0, fill: '#64748b', fontSize: 13, fontWeight: 'bold' }}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                          formatter={(value: number, name: string) => [
                            `${value.toFixed(2)}%`, 
                            name === 'cumulativeValuePerc' ? 'Valor Acumulado' : 'Qtd. Itens'
                          ]}
                          labelFormatter={(label) => `Progresso: ${label.toFixed(1)}% dos itens`}
                        />
                        
                        <Area 
                          type="monotone" 
                          dataKey="cumulativeValuePerc" 
                          stroke="#475569" 
                          strokeWidth={3}
                          fill="url(#areaColor)" 
                          animationDuration={1500}
                        />

                        {/* Labels for Classes in areas */}
                        <ReferenceArea x1={0} x2={classSplits.a} y1={0} y2={100}>
                          <Label value="A" position="center" fill="#854d0e" fontSize={60} fontWeight="900" opacity={0.1} />
                        </ReferenceArea>
                        <ReferenceArea x1={classSplits.a} x2={classSplits.b} y1={0} y2={100}>
                          <Label value="B" position="center" fill="#3f6212" fontSize={60} fontWeight="900" opacity={0.1} />
                        </ReferenceArea>
                        <ReferenceArea x1={classSplits.b} x2={100} y1={0} y2={100}>
                          <Label value="C" position="center" fill="#6b21a8" fontSize={60} fontWeight="900" opacity={0.1} />
                        </ReferenceArea>

                        {/* Reference Lines to Highlight ABC Thresholds */}
                        <ReferenceLine x={classSplits.a} stroke="#475569" strokeDasharray="3 3" />
                        <ReferenceLine x={classSplits.b} stroke="#475569" strokeDasharray="3 3" />
                        <ReferenceLine y={80} stroke="#475569" strokeDasharray="3 3" label={{ position: 'right', value: '80%', fill: '#475569', fontSize: 10 }} />
                        <ReferenceLine y={95} stroke="#475569" strokeDasharray="3 3" label={{ position: 'right', value: '95%', fill: '#475569', fontSize: 10 }} />

                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-8 flex flex-wrap justify-center gap-6">
                    <div className="flex flex-col items-center bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-[120px]">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Classe A</span>
                      <span className="text-xl font-black text-slate-900">{classSplits.a.toFixed(1)}% dos itens</span>
                      <span className="text-xs text-slate-500">~80% do valor</span>
                    </div>
                    <div className="flex flex-col items-center bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-[120px]">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Classe B</span>
                      <span className="text-xl font-black text-slate-900">{(classSplits.b - classSplits.a).toFixed(1)}% dos itens</span>
                      <span className="text-xs text-slate-500">~15% do valor</span>
                    </div>
                    <div className="flex flex-col items-center bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-[120px]">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Classe C</span>
                      <span className="text-xl font-black text-slate-900">{(100 - classSplits.b).toFixed(1)}% dos itens</span>
                      <span className="text-xs text-slate-500">~5% do valor</span>
                    </div>
                  </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                      <BarChart3 size={20} className="text-blue-600" />
                      Top 20 Itens por {calculationMode === 'VALUE' ? 'Valor' : 'Consumo'}
                    </h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={100} fontSize={10} />
                          <Tooltip 
                            formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[entry.class as keyof typeof COLORS]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </section>

                  <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                      <TrendingUp size={20} className="text-blue-600" />
                      Distribuição de Itens
                    </h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </section>
                </div>
              </>
            )}
          </div>
        </div>
          
          {/* Detailed Table Moved out of the right column to allow for more horizontal space */}
          {medications.length > 0 && (
                  <div className="pt-8">
                    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden w-full">
                      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Calculator size={20} className="text-blue-600" />
                          Análise Detalhada · {sectorName}
                        </h3>
                        <div className="flex items-center gap-4 text-xs font-bold">
                          <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-red-500"></div> Classe A</div>
                          <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-amber-500"></div> Classe B</div>
                          <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-emerald-500"></div> Classe C</div>
                        </div>
                      </div>
                      <div className="relative group/table">
                        <div 
                          ref={tableContainerRef}
                          className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
                        >
                          <table className="w-full text-left border-collapse table-fixed min-w-[1610px]">
                            <thead>
                              <tr className="bg-slate-50 border-y border-slate-100">
                                <th className="w-[460px] px-6 py-5 text-sm font-black text-slate-800 uppercase tracking-widest">Medicamento</th>
                                <th className="w-[100px] px-6 py-5 text-sm font-black text-slate-800 uppercase tracking-widest text-right">Usuários</th>
                                <th className="w-[150px] px-6 py-5 text-sm font-black text-slate-800 uppercase tracking-widest text-right">Consumo Anual</th>
                                <th className="w-[150px] px-6 py-5 text-sm font-black text-slate-800 uppercase tracking-widest text-right">Custo Unitário</th>
                                <th className="w-[180px] px-6 py-5 text-sm font-black text-slate-800 uppercase tracking-widest text-right">Valor Total</th>
                                <th className="w-[120px] px-6 py-5 text-sm font-black text-slate-800 uppercase tracking-widest text-right">Estoque</th>
                                <th className="w-[180px] px-6 py-5 text-sm font-black text-slate-800 uppercase tracking-widest text-right">Consumo Mensal</th>
                                <th className="w-[180px] px-6 py-5 text-sm font-black text-slate-800 uppercase tracking-widest text-right">Consumo Diário</th>
                                <th className="w-[180px] px-6 py-5 text-sm font-black text-slate-800 uppercase tracking-widest text-right">C-Máx (Cmax)</th>
                                <th className="w-[180px] px-6 py-5 text-sm font-black text-slate-800 uppercase tracking-widest text-right">Estoque Especial</th>
                                <th className="w-[120px] px-6 py-5 text-sm font-black text-slate-800 uppercase tracking-widest text-center">Compra</th>
                                <th className="w-[120px] px-6 py-5 text-sm font-black text-slate-800 uppercase tracking-widest text-center">Classe</th>
                                <th className="w-[120px] px-6 py-5 text-sm font-black text-slate-800 uppercase tracking-widest text-right">% Ac</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {(() => {
                                const formOf = (m: { pharmaceuticalForm?: string; cafCode?: string }) => {
                                  const cat2 = catalog?.items.find(ci => ci.code === m.cafCode);
                                  return cat2?.forma || (m.pharmaceuticalForm || '').trim() || 'Sem forma informada';
                                };
                                const groups = new Map<string, typeof abcResults>();
                                abcResults.forEach(r => { const k = formOf(r); if (!groups.has(k)) groups.set(k, []); groups.get(k)!.push(r); });
                                const order = [...groups.keys()].sort((a, b) => (a === 'Sem forma informada' ? 1 : b === 'Sem forma informada' ? -1 : a.localeCompare(b, 'pt-BR')));
                                return order.map(k => {
                                  const rows = groups.get(k)!;
                                  const total = rows.reduce((t, r) => t + r.totalValue, 0);
                                  return (
                                    <React.Fragment key={'g-' + k}>
                                      <tr className="bg-slate-100/70">
                                        <td colSpan={13} className="px-6 py-3">
                                          <button
                                            type="button"
                                            onClick={() => toggleForm(k)}
                                            aria-expanded={!closedForms.includes(k)}
                                            aria-controls={'forma-' + k.replace(/\W+/g, '-')}
                                            className="w-full flex flex-wrap items-center gap-3 text-left"
                                          >
                                            <ChevronDown size={16} className={cn('text-slate-600 transition-transform', closedForms.includes(k) && '-rotate-90')} />
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-800">{k}</span>
                                            <span className="text-[11px] font-bold text-slate-500">{rows.length} {rows.length === 1 ? 'item' : 'itens'}</span>
                                            <span className="text-[11px] font-bold text-slate-500">Valor: R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            <span className="ml-auto text-[11px] font-bold text-blue-700">{closedForms.includes(k) ? 'Mostrar' : 'Recolher'}</span>
                                          </button>
                                        </td>
                                      </tr>
                                      {!closedForms.includes(k) && rows.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-5 truncate">
                                    {editingCell?.id === item.id && editingCell?.field === 'name' ? (
                                      <input 
                                        type="text" 
                                        value={editCellValue}
                                        onChange={e => setEditCellValue(e.target.value)}
                                        onBlur={saveCellEdit}
                                        onKeyDown={e => e.key === 'Enter' && saveCellEdit()}
                                        className="w-full px-2 py-1 border border-blue-300 rounded outline-none text-base"
                                        autoFocus
                                      />
                                    ) : (
                                      <div 
                                        className={cn(
                                          "group transition-colors",
                                          isEditMode ? "cursor-pointer hover:text-blue-600" : "cursor-default"
                                        )}
                                        onClick={() => isEditMode && startEditing(item.id, 'name', item.name)}
                                      >
                                        <div className="font-bold text-slate-900 text-base break-words">
                                          {item.name}
                                          {isEditMode && <Edit2 size={12} className="inline ml-2 text-slate-300 opacity-0 group-hover:opacity-100" />}
                                        </div>
                                        {item.cafCode && <div className="mt-1"><CatalogBadges cafCode={item.cafCode} catalog={catalog} /></div>}
                                        {item.concentration && (
                                          <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">
                                            {item.concentration}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </td>

                                  <td className="px-6 py-5 text-right">
                                    {isEditMode ? (
<input type="number" inputMode="decimal" min="0" aria-label="activeUsers"
 value={dv(item.id, 'activeUsers', item.activeUsers)}
 placeholder="0"
 onChange={e => setDraft(item.id, 'activeUsers', e.target.value)}
 className={cn('w-20 px-2 py-1.5 border rounded-lg outline-none text-right text-base focus:ring-2 focus:ring-blue-500', drafts[item.id]?.['activeUsers'] !== undefined ? 'border-amber-400 bg-amber-50' : 'border-slate-300 bg-white')} />
) : (
                                      <div 
                                        className={cn(
                                          "text-slate-600 text-base font-medium",
                                          isEditMode ? "cursor-pointer hover:text-blue-600 group" : "cursor-default"
                                        )}
                                      >
                                        {item.activeUsers?.toLocaleString() || 0}
                                      </div>
                                    )}
                                  </td>

                                  <td className="px-6 py-5 text-right font-semibold text-slate-700 text-base">
                                    {isEditMode ? (
<input type="number" inputMode="decimal" min="0" aria-label="annualConsumption"
 value={dv(item.id, 'annualConsumption', item.annualConsumption)}
 placeholder="0"
 onChange={e => setDraft(item.id, 'annualConsumption', e.target.value)}
 className={cn('w-24 px-2 py-1.5 border rounded-lg outline-none text-right text-base focus:ring-2 focus:ring-blue-500', drafts[item.id]?.['annualConsumption'] !== undefined ? 'border-amber-400 bg-amber-50' : 'border-slate-300 bg-white')} />
) : (
                                      <div 
                                        className={cn(
                                          "text-slate-600 font-bold text-base",
                                          isEditMode ? "cursor-pointer hover:text-blue-600 group" : "cursor-default"
                                        )}
                                      >
                                        {item.annualConsumption.toLocaleString()}
                                      </div>
                                    )}
                                  </td>

                                  <td className="px-6 py-5 text-right font-semibold text-slate-700 text-base">
                                    {isEditMode ? (
<input type="number" inputMode="decimal" step="0.01" min="0" aria-label="unitCost"
 value={dv(item.id, 'unitCost', item.unitCost)}
 placeholder="0"
 onChange={e => setDraft(item.id, 'unitCost', e.target.value)}
 className={cn('w-24 px-2 py-1.5 border rounded-lg outline-none text-right text-base focus:ring-2 focus:ring-blue-500', drafts[item.id]?.['unitCost'] !== undefined ? 'border-amber-400 bg-amber-50' : 'border-slate-300 bg-white')} />
) : (
                                      <div 
                                        className={cn(
                                          "text-slate-600 font-bold text-base",
                                          isEditMode ? "cursor-pointer hover:text-blue-600 group" : "cursor-default"
                                        )}
                                      >
                                        R$ {item.unitCost.toFixed(2)}
                                      </div>
                                    )}
                                  </td>

                                  <td className="px-6 py-5 text-right font-black text-slate-900 bg-slate-50/50 text-base">
                                    R$ {item.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </td>

                                  <td className="px-6 py-5 text-right">
                                    {isEditMode ? (
<input type="number" inputMode="decimal" min="0" aria-label="currentInventory"
 value={dv(item.id, 'currentInventory', item.currentInventory)}
 placeholder="não informado"
 onChange={e => setDraft(item.id, 'currentInventory', e.target.value)}
 className={cn('w-32 px-2 py-1.5 border rounded-lg outline-none text-right text-base focus:ring-2 focus:ring-blue-500', drafts[item.id]?.['currentInventory'] !== undefined ? 'border-amber-400 bg-amber-50' : 'border-slate-300 bg-white')} />
) : (
                                      <div 
                                        className={cn(
                                          "font-black transition-colors text-base",
                                          item.currentInventory === -1 ? "text-slate-300" : 
                                          item.currentInventory < item.safetyStock ? "text-red-600 underline decoration-red-300 underline-offset-4" : "text-slate-600",
                                          isEditMode ? "cursor-pointer hover:text-blue-600 group" : "cursor-default"
                                        )}
                                      >
                                        {item.currentInventory === -1 ? '-' : item.currentInventory}
                                      </div>
                                    )}
                                  </td>

                                  <td className="px-6 py-5 text-right text-slate-500 text-sm font-bold">{item.monthlyConsumption.toFixed(1)}</td>
                                  <td className="px-6 py-5 text-right text-slate-500 text-sm font-bold">{item.avgDailyConsumption.toFixed(2)}</td>
                                  
                                  <td className="px-6 py-5 text-right">
                                    {isEditMode ? (
<input type="number" inputMode="decimal" min="0" aria-label="maxMonthlyConsumption"
 value={dv(item.id, 'maxMonthlyConsumption', item.maxMonthlyConsumption)}
 placeholder="0"
 onChange={e => setDraft(item.id, 'maxMonthlyConsumption', e.target.value)}
 className={cn('w-24 px-2 py-1.5 border rounded-lg outline-none text-right text-base focus:ring-2 focus:ring-blue-500', drafts[item.id]?.['maxMonthlyConsumption'] !== undefined ? 'border-amber-400 bg-amber-50' : 'border-slate-300 bg-white')} />
) : (
                                      <div 
                                        className={cn(
                                          "text-slate-500 text-sm font-bold",
                                          isEditMode ? "cursor-pointer hover:text-blue-600 group" : "cursor-default"
                                        )}
                                      >
                                        {item.maxMonthlyConsumption.toFixed(1)}
                                      </div>
                                    )}
                                  </td>

                                  <td className="px-6 py-5 text-right">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-800 rounded-md text-sm font-black border border-blue-100 shadow-sm">
                                      {item.safetyStock}
                                    </span>
                                  </td>

                                  <td className="px-6 py-5 text-center">
                                    {item.currentInventory === -1 ? (
                                      <span className="text-slate-300 font-bold">-</span>
                                    ) : item.currentInventory < item.safetyStock ? (
                                      <span className="text-xs font-black text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full uppercase tracking-wider animate-pulse shadow-sm flex items-center justify-center gap-1">
                                        <AlertTriangle size={12} />
                                        + {item.safetyStock - item.currentInventory}
                                      </span>
                                    ) : (
                                      <div className="flex justify-center bg-emerald-50 text-emerald-600 p-1.5 rounded-full w-fit mx-auto border border-emerald-100">
                                        <Check size={16} />
                                      </div>
                                    )}
                                  </td>

                                  <td className="px-3 py-5 text-center">
                                    <div className="relative group/class flex justify-center">
                                      <span className={cn(
                                        "px-4 py-1.5 rounded-full text-xs font-black text-white shadow-md transition-all flex items-center gap-2",
                                        item.classification === 'A' ? "bg-red-500 hover:bg-red-600" :
                                        item.classification === 'B' ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-500 hover:bg-emerald-600",
                                        isEditMode ? "cursor-pointer hover:scale-110 active:scale-95" : "cursor-default"
                                      )}>
                                        CLASSE {item.classification}
                                        {item.manualClassification && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                      </span>
                                      
                                      {/* Class Selection Dropdown - only in edit mode */}
                                      {isEditMode && (
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover/class:flex bg-white shadow-xl border border-slate-200 rounded-xl p-2 z-50 flex-col gap-1 min-w-[100px]">
                                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center py-1">Alterar para:</p>
                                          <button onClick={() => updateManualClassification(item.id, 'A')} className="w-full py-1.5 px-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg text-[10px] font-black transition-colors uppercase">Classe A</button>
                                          <button onClick={() => updateManualClassification(item.id, 'B')} className="w-full py-1.5 px-2 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white rounded-lg text-[10px] font-black transition-colors uppercase">Classe B</button>
                                          <button onClick={() => updateManualClassification(item.id, 'C')} className="w-full py-1.5 px-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg text-[10px] font-black transition-colors uppercase">Classe C</button>
                                          {item.manualClassification && (
                                            <button onClick={() => resetManualClassification(item.id)} className="w-full py-1.5 px-2 bg-slate-50 text-slate-500 hover:bg-slate-200 rounded-lg text-[8px] font-black transition-colors uppercase mt-1 border-t border-slate-100">Resetar Automático</button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </td>

                                  <td className="px-6 py-5 text-right text-slate-400 text-xs font-mono font-bold tracking-tight">
                                    {item.cumulativePercentage.toFixed(1)}%
                                  </td>
                                </tr>
                                      ))}
                                    </React.Fragment>
                                  );
                                });
                              })()}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </section>
                  </div>
                )}

          {/* Equations Section */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-6">
              <Calculator className="text-blue-600" />
              <h2 className="text-xl font-bold">Equações e Metodologia</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="font-semibold text-slate-900 mb-2">1. Curva ABC (Pareto)</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Ordenação decrescente por <code className="bg-slate-200 px-1 rounded">Valor Total</code> ou <code className="bg-slate-200 px-1 rounded">Consumo</code>.
                  </p>
                  <ul className="text-xs text-slate-500 mt-2 list-disc list-inside">
                    <li><strong>Classe A:</strong> Até 80% do valor/volume acumulado.</li>
                    <li><strong>Classe B:</strong> De 80% a 95% do acumulado.</li>
                    <li><strong>Classe C:</strong> De 95% a 100% do acumulado.</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="font-semibold text-slate-900 mb-2">2. Consumo Médio Diário (CMD)</h3>
                  <div className="bg-white p-3 rounded border border-slate-200 font-mono text-sm text-center">
                    CMD = Consumo Mensal / 30
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="font-semibold text-slate-900 mb-2">3. Estoque de Emergência (EE)</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    Calculado com base na variação entre o consumo médio e o consumo máximo durante o Lead Time.
                  </p>
                  <div className="bg-white p-3 rounded border border-slate-200 font-mono text-sm text-center">
                    EE = (Consumo Máx Diário - CMD) × Lead Time
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 italic">
                    * Se o Consumo Máximo não for informado, estima-se como 1.5x o Consumo Médio.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="font-semibold text-slate-900 mb-2">4. Valor Total Anual</h3>
                  <div className="bg-white p-3 rounded border border-slate-200 font-mono text-sm text-center">
                    Valor = Consumo Anual × Custo Unitário
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Methodology />

          {/* Info Section */}
          <section className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4">
            <Info className="text-blue-500 shrink-0" size={24} />
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-900">Sobre os Cálculos</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside opacity-80">
                <li><strong>Curva ABC:</strong> Classe A (80% do valor/consumo), B (15%) e C (5%).</li>
                <li><strong>Modos de Geração:</strong> Permite alternar entre análise por valor monetário total ou por volume de consumo.</li>
                <li><strong>Consumo Mensal:</strong> O sistema agora interpreta os dados de entrada (planilha e manual) como consumo MENSAL.</li>
                <li><strong>Estoque de Emergência:</strong> Calculado com base na variação de consumo (estimada em 50%) e o Lead Time informado.</li>
                <li><strong>Importação:</strong> Aceita colunas como "Medicamento", "Consumo", "ConsumoMensal", "CustoUnitario".</li>
                <li><strong>Preços Anvisa:</strong> Digite o preço de cada item (use a tabela oficial da CMED, com link no painel). Nenhum preço é buscado automaticamente.</li>
              </ul>
            </div>
          </section>
        </div>

        {/* Footer Credits */}
        <footer className="max-w-7xl mx-auto mt-12 pt-12 border-t border-slate-200 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="space-y-4">
              <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs">Estoque · módulo de estoque e curva ABC da PharmaCentral.</p>
              <a className="ufam" href="https://ufam.edu.br" target="_blank" rel="noopener noreferrer"><img src={`${import.meta.env.BASE_URL}ufam.png`} alt="Brasão da Universidade Federal do Amazonas" width={56} height={56} /><span>Universidade Federal do Amazonas</span></a>
            </div>
            
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Equipe do Projeto</h5>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-blue-600 font-black uppercase tracking-tighter mb-0.5">Autores</p>
                  <p className="text-sm font-bold text-slate-700">Micael Davi Lima de Oliveira (ICAM)<br />Ennylay (ICAM)<br />Elias Barros (HUGV)</p>
                </div>
                <div>
                  <p className="text-[10px] text-blue-600 font-black uppercase tracking-tighter mb-0.5">Orientação</p>
                  <p className="text-sm font-bold text-slate-700">Profa. Dra. Clarice Veloso e Prof. Dr. Evandro Silva<br />Preceptora: Dra. Juliana Carvalho</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 md:text-right">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tecnologia</h5>
              <p className="text-xs text-slate-500 leading-relaxed">
                Desenvolvido com React e Recharts.<br />
                © 2026 Estoque · PharmaCentral
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Anvisa Search Modal */}
      {showAnvisaModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Search size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Consulta de Preços CMED/ANVISA</h2>
                  <p className="text-sm text-slate-500">Informe os preços unitários para calcular a Curva ABC por valor</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowAnvisaModal(false);
                  setPriceFilter('');
                }}
                className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal: link oficial + digitação manual */}
            <div className="p-6 bg-white border-b border-slate-100 space-y-3">
              <p className="text-sm text-slate-600">
                Consulte o preço na{' '}
                <a className="underline font-bold text-emerald-700" href="https://www.gov.br/anvisa/pt-br/assuntos/medicamentos/cmed/precos" target="_blank" rel="noopener noreferrer">tabela oficial da CMED (Anvisa)</a>{' '}
                e digite abaixo o valor unitário de cada item. Nada é buscado automaticamente.
              </p>
              <input
                type="text"
                value={priceFilter}
                onChange={e => setPriceFilter(e.target.value)}
                placeholder="Filtrar itens pelo nome..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-2 bg-slate-50/30">
              {medications
                .filter(m => m.name.toLowerCase().includes(priceFilter.toLowerCase()))
                .sort((a, b) => Number(a.unitCost !== 0) - Number(b.unitCost !== 0) || a.name.localeCompare(b.name))
                .slice(0, 200)
                .map(m => (
                  <div key={m.id} className="bg-white px-4 py-3 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                    <span className="text-sm font-bold text-slate-800 truncate">{m.name}</span>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 shrink-0">
                      R$
                      <input
                        type="number" min={0} step="0.01"
                        defaultValue={m.unitCost || ''}
                        placeholder="0,00"
                        onBlur={e => { const v = Number(e.target.value.replace(',', '.')); if (!isNaN(v) && v !== m.unitCost) applyAnvisaPrice(m.id, v); }}
                        className="w-28 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-right outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </label>
                  </div>
                ))}
              {medications.length === 0 && <p className="text-center text-slate-400 text-sm py-10">Nenhum item cadastrado.</p>}
            </div>

            <div className="p-4 bg-white border-t border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fonte dos preços: CMED/Anvisa (digitação manual)</p>
            </div>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
}
