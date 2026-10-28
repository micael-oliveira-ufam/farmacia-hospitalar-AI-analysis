/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { useState, useMemo, useRef, useEffect, Component, ReactNode } from 'react';
import { 
  Plus, 
  Trash2, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  BarChart3, 
  Info, 
  Package,
  Activity,
  TrendingUp,
  Calculator,
  Search,
  Loader2,
  Database,
  Check,
  X,
  Edit2,
  AlertTriangle,
  Zap,
  LogOut
} from 'lucide-react';
import * as XLSX from 'xlsx';
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
import { localStore, localAuth, loadBackends, exportBackup, importBackup, USE_FIREBASE, type Store, type AuthApi, type AppUser } from './data/store';
import { loadCodajas, loadCatalog, HOME_URL, GUIDE_URL, type Catalog } from './lib/catalog';
import { WeeklyOrder } from './components/WeeklyOrder';
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
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
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
  const [isEditMode, setIsEditMode] = useState(false);
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
      localStorage.setItem('savedHospitals', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveSavedHospital = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Remover este hospital da sua lista? Os dados no banco de dados NÃO serão excluídos.")) {
      const updated = savedHospitals.filter(h => h.id !== id);
      setSavedHospitals(updated);
      localStorage.setItem('savedHospitals', JSON.stringify(updated));
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

    const unsubscribe = store.subscribe(hospitalId, setMedications);
    return () => unsubscribe();
  }, [hospitalId, store]);

  const abcResults = useMemo(() => calculateABC(medications, calculationMode, reviewDays), [medications, calculationMode, reviewDays]);

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
      await store.add(hospitalId, {
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
      await store.remove(hospitalId, id);
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
        if (count > 0) await store.addMany(hospitalId, docs);
        
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
      await store.update(hospitalId, medId, { unitCost: price });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `medications/${medId}`);
    }
  };

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

      await store.update(hospitalId, id, { [field]: valueToSave } as Partial<Medication>);
      setEditingCell(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `medications/${id}`);
    }
  };

  const updateManualClassification = async (id: string, newClass: 'A' | 'B' | 'C') => {
    if (!user) return;
    if (window.confirm(`Deseja realmente alterar a classificação deste item para Classe ${newClass}?`)) {
      try {
        await store.update(hospitalId, id, { manualClassification: newClass });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `medications/${id}`);
      }
    }
  };

  const resetManualClassification = async (id: string) => {
    if (!user) return;
    try {
      await store.update(hospitalId, id, { manualClassification: null });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `medications/${id}`);
    }
  };

  const importIcam = async () => {
    if (!hospitalId) return;
    const cat = catalog ?? await loadCatalog();
    if (!cat) { alert('Lista do ICAM não encontrada (data/catalog.json).'); return; }
    const have = new Set(medications.map(m => m.cafCode).filter(Boolean));
    const novos = cat.items.filter(i => !have.has(i.code));
    if (!novos.length) { alert('Todos os itens da lista do ICAM já estão importados.'); return; }
    if (!window.confirm(`Importar ${novos.length} itens da lista do ICAM para "${hospitalName}"? Depois informe consumo, custo e estoque.`)) return;
    setIsSaving(true);
    try {
      await store.addMany(hospitalId, novos.map(i => ({
        name: i.desc, cafCode: i.code, pharmaceuticalForm: cat.sec[i.sec] || '', concentration: i.mgml ? `${i.mgml} mg/mL` : '',
        annualConsumption: 0, unitCost: 0, leadTimeDays: 7, maxMonthlyConsumption: 0, activeUsers: 0, currentInventory: null,
      })));
      alert(`${novos.length} itens da lista do ICAM importados.`);
    } catch (error) { handleFirestoreError(error, OperationType.CREATE, 'medications'); }
    finally { setIsSaving(false); }
  };

  const importCodajas = async () => {
    if (!hospitalId) return;
    const lista = await loadCodajas();
    if (!lista) { alert('Lista da Policlínica Codajás não encontrada (data/codajas.json).'); return; }
    const have = new Set(medications.map(m => m.name.trim().toLowerCase()));
    const novos = lista.itens.filter(i => !have.has(i.name.trim().toLowerCase()));
    if (!novos.length) { alert('Todos os itens da lista da Policlínica Codajás já estão importados.'); return; }
    if (!window.confirm(`Importar ${novos.length} itens da lista da Policlínica Codajás para "${hospitalName}"? Usuários ativos por mês e custo unitário vêm da lista; confira o custo dos itens com valor zero.`)) return;
    setIsSaving(true);
    try {
      await store.addMany(hospitalId, novos.map(i => ({
        name: i.name, pharmaceuticalForm: '', concentration: '', activeUsers: i.activeUsers || 0, annualConsumption: (i.activeUsers || 0) * 12,
        unitCost: i.unitCost || 0, leadTimeDays: 7, maxMonthlyConsumption: 0, currentInventory: null,
      })));
      alert(`${novos.length} itens da Policlínica Codajás importados.`);
    } catch (error) { handleFirestoreError(error, OperationType.CREATE, 'medications'); }
    finally { setIsSaving(false); }
  };

  const doBackup = () => {
    const blob = new Blob([exportBackup(hospitalId)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `backup_abc_${hospitalId}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const restoreInputRef = useRef<HTMLInputElement>(null);
  const doRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!window.confirm('Restaurar substitui TODOS os dados desta unidade neste navegador. Continuar?')) { e.target.value = ''; return; }
    f.text().then(t => alert(`${importBackup(hospitalId, t)} itens restaurados.`)).catch(err => alert('Falha ao restaurar: ' + err.message)).finally(() => { e.target.value = ''; });
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full flex flex-col gap-6">
          
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
            <div className="text-center mb-8 space-y-4">
              <img src={`${import.meta.env.BASE_URL}icon-gestao.svg`} alt="" width={64} height={64} className="mx-auto" />
              <div>
                <h1 className="text-3xl font-bold text-slate-900">FarmaGestão</h1>
                <p className="text-slate-500 mt-2">Estoque e Curva ABC para farmácia hospitalar · parte da Farmácia Hospitalar Integrada</p>
              </div>
            </div>

            {savedHospitals.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Database size={14} />
                  Hospitais Salvos neste Dispositivo
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedHospitals.map(h => (
                    <div 
                      key={h.id}
                      onClick={() => handleSetHospital(undefined, h)}
                      className="group flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Plus size={16} />
                        </div>
                        <span className="font-bold text-slate-700">{h.name}</span>
                      </div>
                      <button 
                        onClick={(e) => handleRemoveSavedHospital(h.id, e)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <form onSubmit={handleSetHospital} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {savedHospitals.length > 0 ? 'Ou adicione um novo Hospital' : 'Informe o nome do Hospital para começar'}
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={tempHospitalName}
                    onChange={e => setTempHospitalName(e.target.value)}
                    placeholder="Ex: Hospital Universitário Getúlio Vargas"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg shadow-inner"
                    autoFocus
                    required
                  />
                  <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
              >
                Acessar Painel de Controle
              </button>
            </form>
            
            <div className="mt-12 pt-8 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                  <Database size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Desenvolvedor</p>
                  <p className="text-sm font-bold text-slate-700">Micael Davi Lima de Oliveira</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Orientador</p>
                  <p className="text-sm font-bold text-slate-700">Profº Dr. Evandro de Araújo Silva</p>
                </div>
              </div>
            </div>

            {!user && (
              <div className="mt-8">
                <button 
                  onClick={handleLogin}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95"
                >
                  <span className="font-black">G</span>
                  Entrar com Google para Salvar Dados
                </button>
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-400 text-center px-8">
            {USE_FIREBASE
              ? 'Seus dados são salvos na nuvem e vinculados ao nome do hospital. Use um nome único para que outras pessoas não acessem seus dados acidentalmente.'
              : 'Seus dados ficam salvos somente neste navegador (sem conta e sem nuvem). Use Backup para guardar uma cópia ou levar para outro aparelho.'}
          </p>

          <button 
            onClick={downloadExampleFile}
            className="flex items-center justify-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors py-2"
          >
            <FileSpreadsheet size={14} />
            Baixar planilha de exemplo (.xlsx)
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <header className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex flex-col md:flex-row items-stretch">
              {/* Logo & Main Title Section */}
              <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center gap-6 border-b md:border-b-0 md:border-r border-slate-100">
                <div className="flex items-center gap-5">
                  <img src={`${import.meta.env.BASE_URL}icon-gestao.svg`} alt="" width={56} height={56} className="rounded-2xl" />
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">
                      FarmaGestão
                    </h1>
                    <p className="text-slate-500 text-sm font-medium mt-0.5">Estoque e Curva ABC para farmácia hospitalar · parte da Farmácia Hospitalar Integrada</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <a href={HOME_URL} className="px-3 py-1 text-[11px] font-black text-slate-600 border border-slate-200 rounded-full hover:bg-slate-50">← Início</a>
                  <a href={GUIDE_URL} className="px-3 py-1 text-[11px] font-black text-blue-700 border border-blue-200 rounded-full hover:bg-blue-50">PosologiaPED</a>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full w-fit">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{USE_FIREBASE ? 'Live Sync' : 'Salvo neste navegador'}</span>
                </div>
              </div>

              {/* Hospital & Auth Info Section */}
              <div className="bg-slate-50/50 p-6 flex flex-col sm:flex-row items-center gap-6">
                {/* Hospital Badge */}
                <div className="flex items-center gap-4 py-2 px-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Activity size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Unidade Hospitalar</p>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm whitespace-nowrap">{hospitalName}</span>
                      <button 
                        onClick={handleChangeHospital}
                        className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-tighter"
                      >
                        Trocar
                      </button>
                    </div>
                  </div>
                </div>

                {/* User Info / Auth */}
                {user ? (
                  <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Usuário</p>
                      <p className="text-sm font-bold text-slate-700 truncate max-w-[150px]">{user.displayName || user.email}</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                      title="Sair"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleLogin}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                  >
                    <Package size={14} />
                    Entrar com Google
                  </button>
                )}
              </div>
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
                
                <button onClick={importIcam} disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-all font-bold text-xs border border-blue-200 disabled:opacity-50">
                  <Database size={14} />
                  Importar lista do ICAM (224 itens)
                </button>
                <button onClick={importCodajas} disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-all font-bold text-xs border border-blue-200 disabled:opacity-50">
                  <Database size={14} />
                  Importar lista da Policlínica Codajás (188 itens)
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
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-xs border",
                      isEditMode 
                        ? "bg-amber-500 text-white border-amber-600 shadow-sm" 
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm"
                    )}
                  >
                    <Edit2 size={14} />
                    {isEditMode ? "Modo Edição Ativado" : "Habilitar Edição"}
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
                </div>

                <button 
                  onClick={async () => {
                    if (medications.length === 0 || !user) return;
                    setIsSaving(true);
                    try {
                      const processedCount = await store.syncAll(hospitalId, medications);
                      alert(store.mode === 'local' ? `Os ${processedCount} itens já estão salvos neste navegador (salvamento automático). Use "Backup" para guardar uma cópia.` : `Sucesso! ${processedCount} itens sincronizados.`);
                    } catch (err) {
                      handleFirestoreError(err, OperationType.WRITE, 'medications');
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving || medications.length === 0 || !user}
                  className="px-6 py-2 bg-slate-900 text-white rounded-xl font-black text-xs hover:bg-black transition-all active:scale-95 disabled:opacity-50 shadow-md"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={14} /> : (store.mode === 'local' ? "SALVAMENTO AUTOMÁTICO" : "SALVAR NO BANCO")}
                </button>
              </div>
            </div>
            
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv,.xlsx,.xls" className="hidden" />
          </header>

            <WeeklyOrder results={abcResults} reviewDays={reviewDays} setReviewDays={setReviewDays} catalog={catalog} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Input and List */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Manual Entry Toggle */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                  <button 
                    onClick={() => setShowManualEntry(!showManualEntry)}
                    className="w-full flex items-center justify-between text-slate-700 hover:text-blue-600 transition-colors"
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      <Plus size={20} className={showManualEntry ? "text-blue-600 rotate-45 transition-transform" : "text-blue-600 transition-transform"} />
                      Inserção Manual de Medicamento
                    </div>
                    <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded-lg">
                      {showManualEntry ? 'Ocultar' : 'Mostrar'}
                    </span>
                  </button>
                </div>

            {/* Manual Entry Form */}
            {showManualEntry && (
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-300">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Plus size={20} className="text-blue-600" />
                  Novo Medicamento
                </h2>
                <form onSubmit={handleManualAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Medicamento</label>
                  <input 
                    type="text" 
                    value={manualEntry.name}
                    onChange={e => setManualEntry(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Dipirona"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Forma Farmacêutica</label>
                    <input 
                      type="text" 
                      value={manualEntry.pharmaceuticalForm}
                      onChange={e => setManualEntry(prev => ({ ...prev, pharmaceuticalForm: e.target.value }))}
                      placeholder="Ex: Comprimido"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Concentração</label>
                    <input 
                      type="text" 
                      value={manualEntry.concentration}
                      onChange={e => setManualEntry(prev => ({ ...prev, concentration: e.target.value }))}
                      placeholder="Ex: 500mg"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Consumo Mensal</label>
                    <input 
                      type="number" 
                      value={manualEntry.annualConsumption || ''}
                      onChange={e => setManualEntry(prev => ({ ...prev, annualConsumption: Number(e.target.value) }))}
                      placeholder="Qtd/mês"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Custo Unitário (R$)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={manualEntry.unitCost || ''}
                      onChange={e => setManualEntry(prev => ({ ...prev, unitCost: Number(e.target.value) }))}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Total Usuários Ativos</label>
                  <input 
                    type="number" 
                    value={manualEntry.activeUsers || ''}
                    onChange={e => setManualEntry(prev => ({ ...prev, activeUsers: Number(e.target.value) }))}
                    placeholder="Qtd"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Lead Time (Dias)</label>
                    <input 
                      type="number" 
                      value={manualEntry.leadTimeDays || ''}
                      onChange={e => setManualEntry(prev => ({ ...prev, leadTimeDays: Number(e.target.value) }))}
                      placeholder="Ex: 7"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Inventário Atual</label>
                    <input 
                      type="number" 
                      value={manualEntry.currentInventory === undefined ? '' : manualEntry.currentInventory}
                      onChange={e => setManualEntry(prev => ({ ...prev, currentInventory: e.target.value === '' ? undefined : Number(e.target.value) }))}
                      placeholder="Opcional"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Consumo Mensal Máx.</label>
                  <input 
                    type="number" 
                    value={manualEntry.maxMonthlyConsumption || ''}
                    onChange={e => setManualEntry(prev => ({ ...prev, maxMonthlyConsumption: Number(e.target.value) }))}
                    placeholder="Opcional"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Adicionar à Lista
                </button>
                {isSaving && (
                  <div className="flex items-center justify-center gap-2 text-xs text-blue-600 animate-pulse">
                    <Loader2 size={12} className="animate-spin" />
                    Salvando no banco...
                  </div>
                )}
              </form>
            </section>
            )}

            {/* List of Added Items */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 max-h-[500px] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Package size={20} className="text-blue-600" />
                  Itens Cadastrados
                </h2>
                <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded-full text-slate-600">
                  {medications.length} itens
                </span>
              </div>
              
              {medications.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <FileSpreadsheet size={48} className="mx-auto mb-3 opacity-20" />
                  <p>Nenhum item adicionado ainda.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {medications.map(med => (
                    <div key={med.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">{med.name}</p>
                        <p className="text-xs text-slate-500">
                          Consumo: {med.annualConsumption} | Custo: R$ {med.unitCost.toFixed(2)}
                        </p>
                      </div>
                      <button 
                        onClick={() => removeMedication(med.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => setMedications([])}
                    className="w-full py-2 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium mt-4"
                  >
                    Limpar Tudo
                  </button>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Analysis and Charts */}
          <div className="lg:col-span-2 space-y-6">
            
            {medications.length === 0 ? (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                  <BarChart3 size={64} className="text-slate-200 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-400">Aguardando dados para análise</h3>
                  <p className="text-slate-400 max-w-sm mt-2">
                    Importe uma planilha ou adicione medicamentos manualmente para visualizar a Curva ABC e parâmetros de estoque.
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
                          Análise Detalhada (Tabela Completa)
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
                          <table className="w-full text-left border-collapse table-fixed min-w-[1500px]">
                            <thead>
                              <tr className="bg-slate-50 border-y border-slate-100">
                                <th className="w-[350px] px-6 py-5 text-sm font-black text-slate-800 uppercase tracking-widest">Medicamento</th>
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
                              {abcResults.map((item) => (
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
                                        <div className="font-bold text-slate-900 flex items-center gap-2 text-base overflow-hidden text-ellipsis">
                                          {item.name}
                                          {isEditMode && <Edit2 size={12} className="text-slate-300 opacity-0 group-hover:opacity-100" />}
                                          <CatalogBadges cafCode={item.cafCode} catalog={catalog} />
                                        </div>
                                        {(item.pharmaceuticalForm || item.concentration) && (
                                          <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">
                                            {item.pharmaceuticalForm} | {item.concentration}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </td>

                                  <td className="px-6 py-5 text-right">
                                    {editingCell?.id === item.id && editingCell?.field === 'activeUsers' ? (
                                      <input 
                                        type="number" 
                                        value={editCellValue}
                                        onChange={e => setEditCellValue(e.target.value)}
                                        onBlur={saveCellEdit}
                                        onKeyDown={e => e.key === 'Enter' && saveCellEdit()}
                                        className="w-16 px-1 py-0.5 border border-blue-300 rounded outline-none text-right text-base"
                                        autoFocus
                                      />
                                    ) : (
                                      <div 
                                        className={cn(
                                          "text-slate-600 text-base font-medium",
                                          isEditMode ? "cursor-pointer hover:text-blue-600 group" : "cursor-default"
                                        )}
                                        onClick={() => isEditMode && startEditing(item.id, 'activeUsers', item.activeUsers)}
                                      >
                                        {item.activeUsers?.toLocaleString() || 0}
                                        {isEditMode && <Edit2 size={12} className="inline ml-1 text-slate-300 opacity-0 group-hover:opacity-100" />}
                                      </div>
                                    )}
                                  </td>

                                  <td className="px-6 py-5 text-right font-semibold text-slate-700 text-base">
                                    {editingCell?.id === item.id && editingCell?.field === 'annualConsumption' ? (
                                      <input 
                                        type="number" 
                                        value={editCellValue}
                                        onChange={e => setEditCellValue(e.target.value)}
                                        onBlur={saveCellEdit}
                                        onKeyDown={e => e.key === 'Enter' && saveCellEdit()}
                                        className="w-20 px-1 py-0.5 border border-blue-300 rounded outline-none text-right text-base"
                                        autoFocus
                                      />
                                    ) : (
                                      <div 
                                        className={cn(
                                          "text-slate-600 font-bold text-base",
                                          isEditMode ? "cursor-pointer hover:text-blue-600 group" : "cursor-default"
                                        )}
                                        onClick={() => isEditMode && startEditing(item.id, 'annualConsumption', item.annualConsumption)}
                                      >
                                        {item.annualConsumption.toLocaleString()}
                                        {isEditMode && <Edit2 size={12} className="inline ml-1 text-slate-300 opacity-0 group-hover:opacity-100" />}
                                      </div>
                                    )}
                                  </td>

                                  <td className="px-6 py-5 text-right font-semibold text-slate-700 text-base">
                                    {editingCell?.id === item.id && editingCell?.field === 'unitCost' ? (
                                      <input 
                                        type="number" 
                                        step="0.01"
                                        value={editCellValue}
                                        onChange={e => setEditCellValue(e.target.value)}
                                        onBlur={saveCellEdit}
                                        onKeyDown={e => e.key === 'Enter' && saveCellEdit()}
                                        className="w-20 px-1 py-0.5 border border-blue-300 rounded outline-none text-right text-base"
                                        autoFocus
                                      />
                                    ) : (
                                      <div 
                                        className={cn(
                                          "text-slate-600 font-bold text-base",
                                          isEditMode ? "cursor-pointer hover:text-blue-600 group" : "cursor-default"
                                        )}
                                        onClick={() => isEditMode && startEditing(item.id, 'unitCost', item.unitCost)}
                                      >
                                        R$ {item.unitCost.toFixed(2)}
                                        {isEditMode && <Edit2 size={12} className="inline ml-1 text-slate-300 opacity-0 group-hover:opacity-100" />}
                                      </div>
                                    )}
                                  </td>

                                  <td className="px-6 py-5 text-right font-black text-slate-900 bg-slate-50/50 text-base">
                                    R$ {item.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </td>

                                  <td className="px-6 py-5 text-right">
                                    {editingCell?.id === item.id && editingCell?.field === 'currentInventory' ? (
                                      <input 
                                        type="number" 
                                        value={editCellValue}
                                        onChange={e => setEditCellValue(e.target.value)}
                                        onBlur={saveCellEdit}
                                        onKeyDown={e => e.key === 'Enter' && saveCellEdit()}
                                        className="w-16 px-1 py-0.5 border border-blue-300 rounded outline-none text-right text-base"
                                        autoFocus
                                      />
                                    ) : (
                                      <div 
                                        className={cn(
                                          "font-black transition-colors text-base",
                                          item.currentInventory === -1 ? "text-slate-300" : 
                                          item.currentInventory < item.safetyStock ? "text-red-600 underline decoration-red-300 underline-offset-4" : "text-slate-600",
                                          isEditMode ? "cursor-pointer hover:text-blue-600 group" : "cursor-default"
                                        )}
                                        onClick={() => isEditMode && startEditing(item.id, 'currentInventory', item.currentInventory)}
                                      >
                                        {item.currentInventory === -1 ? '-' : item.currentInventory}
                                        {isEditMode && <Edit2 size={12} className="inline ml-1 text-slate-300 opacity-0 group-hover:opacity-100" />}
                                      </div>
                                    )}
                                  </td>

                                  <td className="px-6 py-5 text-right text-slate-500 text-sm font-bold">{item.monthlyConsumption.toFixed(1)}</td>
                                  <td className="px-6 py-5 text-right text-slate-500 text-sm font-bold">{item.avgDailyConsumption.toFixed(2)}</td>
                                  
                                  <td className="px-6 py-5 text-right">
                                    {editingCell?.id === item.id && editingCell?.field === 'maxMonthlyConsumption' ? (
                                      <input 
                                        type="number" 
                                        value={editCellValue}
                                        onChange={e => setEditCellValue(e.target.value)}
                                        onBlur={saveCellEdit}
                                        onKeyDown={e => e.key === 'Enter' && saveCellEdit()}
                                        className="w-16 px-1 py-0.5 border border-blue-300 rounded outline-none text-right text-base"
                                        autoFocus
                                      />
                                    ) : (
                                      <div 
                                        className={cn(
                                          "text-slate-500 text-sm font-bold",
                                          isEditMode ? "cursor-pointer hover:text-blue-600 group" : "cursor-default"
                                        )}
                                        onClick={() => isEditMode && startEditing(item.id, 'maxMonthlyConsumption', item.maxMonthlyConsumption || 0)}
                                      >
                                        {item.maxMonthlyConsumption.toFixed(1)}
                                        {isEditMode && <Edit2 size={12} className="inline ml-1 text-slate-300 opacity-0 group-hover:opacity-100" />}
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
              <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs">FarmaGestão · módulo de estoque e curva ABC da Farmácia Hospitalar Integrada.</p>
            </div>
            
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Equipe do Projeto</h5>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-blue-600 font-black uppercase tracking-tighter mb-0.5">Desenvolvedor</p>
                  <p className="text-sm font-bold text-slate-700">Micael Davi Lima de Oliveira</p>
                </div>
                <div>
                  <p className="text-[10px] text-blue-600 font-black uppercase tracking-tighter mb-0.5">Orientador</p>
                  <p className="text-sm font-bold text-slate-700">Profº Dr. Evandro de Araújo Silva</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 md:text-right">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tecnologia</h5>
              <p className="text-xs text-slate-500 leading-relaxed">
                Desenvolvido com React e Recharts.<br />
                © 2026 FarmaGestão · Farmácia Hospitalar Integrada
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
