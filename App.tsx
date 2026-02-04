
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  HeartPulse, 
  Utensils, 
  GraduationCap, 
  Users, 
  ChevronDown, 
  MessageCircle, 
  X, 
  Send,
  Leaf,
  Info,
  Apple,
  TrendingUp,
  MapPin,
  PieChart,
  Map as MapIcon,
  PhoneCall,
  Mail,
  Instagram,
  Globe,
  LayoutDashboard,
  Target,
  ArrowLeft,
  Calendar,
  Award,
  Zap,
  BarChart3,
  Loader2,
  AlertCircle,
  UserCheck,
  Building2,
  ExternalLink,
  Search,
  ChevronRight,
  ArrowUpRight,
  Filter,
  ArrowRight,
  Maximize2,
  Navigation,
  Activity,
  Milk,
  Stethoscope,
  School,
  Baby,
  BookOpen,
  BicepsFlexed
} from 'lucide-react';
import { 
  ViewState, 
  KecamatanComparison,
  RealizationApiResponse,
  TargetApiResponse,
  SppgUnit,
  PotensiApiResponse,
  PotensiItem
} from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Data States
  const [kecamatanComparison, setKecamatanComparison] = useState<KecamatanComparison[]>([]);
  const [sppgList, setSppgList] = useState<SppgUnit[]>([]);
  const [potensiData, setPotensiData] = useState<PotensiItem[]>([]);
  const [isAnalyticalDataLoading, setIsAnalyticalDataLoading] = useState(false);
  const [isHomeDataLoading, setIsHomeDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  
  // SPPG Filters
  const [sppgSearch, setSppgSearch] = useState('');
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('SEMUA');
  const [selectedSppg, setSelectedSppg] = useState<SppgUnit | null>(null);

  // Global Stats (Home)
  const [homeStats, setHomeStats] = useState({
    totalSppg: 0,
    potensiTotal: 0,
    breakdown: {
      paud_tk: 0,
      sd_mi: 0,
      smp_mts: 0,
      sma_smk_ma: 0,
      balita: 0,
      bumil: 0,
      busui: 0,
      pesantren_lain: 0
    }
  });

  // Analytical Stats (Capaian)
  const [analyticalStats, setAnalyticalStats] = useState({
    totalLaki: 0,
    totalPerempuan: 0,
    totalTarget: 0,
    totalRealization: 0
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as ViewState;
      if (['home', 'capaian', 'sppg'].includes(hash)) {
        setView(hash);
      } else if (hash.startsWith('sppg-detail')) {
        setView('sppg-detail');
      } else {
        setView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Lazy-load analytical data only when navigating away from home
  useEffect(() => {
    if ((view === 'capaian' || view === 'sppg' || view === 'sppg-detail') && analyticalStats.totalTarget === 0) {
      fetchAnalyticalData();
    }
  }, [view]);

  const navigateTo = (newView: ViewState) => {
    window.location.hash = newView;
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const init = async () => {
      await fetchHomeData();
      // Faster entry for home page
      setTimeout(() => setIsInitialLoading(false), 800);
    };
    init();
  }, []);

  const fetchHomeData = async () => {
    setIsHomeDataLoading(true);
    try {
      const [potensiRes, sppgUnitsRes] = await Promise.all([
        fetch('https://api.bandungkab.go.id/api/data-penerima-manfaat-mbg'),
        fetch('https://api.bandungkab.go.id/api/data/mbg---sppg---v')
      ]);

      if (!potensiRes.ok || !sppgUnitsRes.ok) throw new Error('Gagal memuat data beranda.');

      const potensiJson: PotensiApiResponse = await potensiRes.json();
      const sppgUnitsJson: any = await sppgUnitsRes.json();

      let pTotal = 0;
      let br = {
        paud_tk: 0, sd_mi: 0, smp_mts: 0, sma_smk_ma: 0, balita: 0, bumil: 0, busui: 0, pesantren_lain: 0
      };

      potensiJson.data.info.forEach(p => {
        pTotal += parseInt(p.Total) || 0;
        // Education grouping
        br.paud_tk += (parseInt((p as any).PAUD) || 0) + (parseInt(p.TK) || 0) + (parseInt((p as any).RA) || 0) + (parseInt((p as any).KB) || 0) + (parseInt((p as any).TPA) || 0) + (parseInt((p as any).SPS) || 0);
        br.sd_mi += (parseInt(p.SD) || 0) + (parseInt((p as any).MI) || 0);
        br.smp_mts += (parseInt(p.SMP) || 0) + (parseInt((p as any).MTs) || 0);
        br.sma_smk_ma += (parseInt(p.SMA) || 0) + (parseInt(p.SMK) || 0) + (parseInt((p as any).MA) || 0);
        
        // Health grouping
        br.balita += parseInt(p.BALITA) || 0;
        br.bumil += parseInt(p.BUMIL) || 0;
        br.busui += parseInt(p.BUSUI) || 0;
        
        // Community/Other grouping
        br.pesantren_lain += (parseInt((p as any).PESANTREN) || 0) + (parseInt((p as any).SLB) || 0) + (parseInt((p as any).PKBM) || 0);
      });

      setHomeStats({
        totalSppg: sppgUnitsJson.total || 0,
        potensiTotal: pTotal,
        breakdown: br
      });
      setPotensiData(potensiJson.data.info);
      
      // Basic SPPG list for the directory
      const initialSppgList: SppgUnit[] = sppgUnitsJson.data.map((item: any) => ({
        nama: item.detail.nama,
        kecamatan: item.detail.kecamatan,
        desa: item.detail.desa,
        lokasi: item.detail.alamat,
        totalLaki: 0,
        totalPerempuan: 0,
        totalRealization: 0
      }));
      setSppgList(initialSppgList);

    } catch (err: any) {
      console.error(err);
      setDataError("Gagal sinkronisasi data utama.");
    } finally {
      setIsHomeDataLoading(false);
    }
  };

  const fetchAnalyticalData = async () => {
    setIsAnalyticalDataLoading(true);
    try {
      const [realizationRes, targetRes] = await Promise.all([
        fetch('https://api.bandungkab.go.id/api/data/survey-penerima-manfaat-mbg-oleh-sppg'),
        fetch('https://aplikasi.bandungkab.go.id/api/target-penerima-manfaat-mbg')
      ]);

      const realizationJson: RealizationApiResponse = await realizationRes.json();
      const targetJson: TargetApiResponse = await targetRes.json();

      const realizationMap: Record<string, number> = {};
      const sppgByKecMap: Record<string, Set<string>> = {};
      const sppgStatsMap: Record<string, { laki: number, perempuan: number }> = {};
      
      let lakiTotal = 0;
      let perempuanTotal = 0;
      let realTotal = 0;

      realizationJson.data.forEach(item => {
        const kec = item.detail.kecamatan.toUpperCase();
        const laki = parseInt(String(item.detail.jumlah_lakilaki)) || 0;
        const perempuan = parseInt(String(item.detail.jumlah_perempuan)) || 0;
        const sppgName = item.detail.nama_sppg;
        
        realizationMap[kec] = (realizationMap[kec] || 0) + laki + perempuan;
        lakiTotal += laki;
        perempuanTotal += perempuan;
        realTotal += (laki + perempuan);

        if (sppgName) {
          if (!sppgByKecMap[kec]) sppgByKecMap[kec] = new Set();
          sppgByKecMap[kec].add(sppgName);
          if (!sppgStatsMap[sppgName]) sppgStatsMap[sppgName] = { laki: 0, perempuan: 0 };
          sppgStatsMap[sppgName].laki += laki;
          sppgStatsMap[sppgName].perempuan += perempuan;
        }
      });

      setSppgList(prev => prev.map(s => ({
        ...s,
        totalLaki: sppgStatsMap[s.nama]?.laki || 0,
        totalPerempuan: sppgStatsMap[s.nama]?.perempuan || 0,
        totalRealization: (sppgStatsMap[s.nama]?.laki || 0) + (sppgStatsMap[s.nama]?.perempuan || 0)
      })));

      let targetTotalAccumulator = 0;
      const combinedData: KecamatanComparison[] = targetJson.data.info.map(target => {
        const kecName = target.nama.toUpperCase();
        const targetValue = parseInt(target.total.replace(/,/g, '')) || 0;
        const realizationValue = realizationMap[kecName] || 0;
        const sppgCount = sppgByKecMap[kecName]?.size || 0;
        targetTotalAccumulator += targetValue;

        return {
          name: target.nama,
          target: targetValue,
          realization: realizationValue,
          percentage: targetValue > 0 ? (realizationValue / targetValue) * 100 : 0,
          sppgCount: sppgCount
        };
      });

      setAnalyticalStats({
        totalLaki: lakiTotal,
        totalPerempuan: perempuanTotal,
        totalTarget: targetTotalAccumulator,
        totalRealization: realTotal
      });
      setKecamatanComparison(combinedData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyticalDataLoading(false);
    }
  };

  const uniqueKecamatans = useMemo(() => {
    const kecs = sppgList.map(s => s.kecamatan);
    return ['SEMUA', ...Array.from(new Set(kecs))].sort();
  }, [sppgList]);

  const filteredSppgList = useMemo(() => {
    return sppgList.filter(s => {
      const matchSearch = s.nama.toLowerCase().includes(sppgSearch.toLowerCase()) || 
                          s.kecamatan.toLowerCase().includes(sppgSearch.toLowerCase());
      const matchKec = selectedKecamatan === 'SEMUA' || s.kecamatan === selectedKecamatan;
      return matchSearch && matchKec;
    });
  }, [sppgList, sppgSearch, selectedKecamatan]);

  const LoadingScreen = () => (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-emerald-100 rounded-[2.5rem] scale-150 blur-3xl opacity-20 animate-pulse"></div>
        <div className="relative bg-emerald-600 p-8 rounded-[2.5rem] shadow-2xl shadow-emerald-200 animate-bounce-slow">
          <Utensils className="w-16 h-16 text-white" />
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">MBG Kabupaten Bandung</h2>
        <div className="flex items-center justify-center space-x-3 text-emerald-600 font-black text-xs tracking-[0.3em]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>SINKRONISASI SISTEM BEDAS...</span>
        </div>
      </div>
      <div className="absolute bottom-12 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
        Portal Resmi Pemerintah Kabupaten Bandung
      </div>
    </div>
  );

  const HomeView = () => (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 bg-gradient-to-b from-white to-slate-50 overflow-hidden">
        <div className="absolute inset-0 bg-pattern -z-10 opacity-10"></div>
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-100 px-6 py-2 rounded-full text-xs font-black text-emerald-700 mb-10 shadow-sm uppercase tracking-widest">
            <Award className="w-4 h-4" />
            <span>Kabupaten Bandung Sehat & Bedas</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] mb-8 tracking-tight">
            Makan Bergizi Gratis <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              Generasi Emas 2045
            </span>
          </h1>
          <p className="text-slate-500 max-w-2xl text-xl mb-12 font-medium leading-relaxed">
            Portal informasi terpadu program pemenuhan nutrisi untuk mewujudkan masa depan cerah anak sekolah, balita, dan ibu hamil di Kabupaten Bandung.
          </p>
          <div className="flex flex-wrap justify-center gap-5">
            <button onClick={() => navigateTo('capaian')} className="bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center group active:scale-95">
              Cek Realisasi Harian
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => navigateTo('sppg')} className="bg-white text-slate-900 border-2 border-slate-100 px-10 py-5 rounded-2xl font-black hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm active:scale-95">
              Lokasi Unit Pelayanan
            </button>
          </div>
        </div>
      </section>

      {/* General Info Sections */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="p-10 bg-emerald-50 rounded-[3rem] border border-emerald-100 space-y-6">
              <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Apple className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Apa itu MBG?</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                <span className="font-bold text-emerald-700">Makan Bergizi Gratis (MBG)</span> adalah inisiatif strategis pemerintah untuk menjamin kecukupan nutrisi harian bagi generasi penerus bangsa, guna mencegah stunting dan meningkatkan fokus belajar.
              </p>
            </div>
            <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 space-y-6">
              <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Apa itu SPPG?</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                <span className="font-bold text-slate-900">Satuan Pelayanan Pangan Bergizi (SPPG)</span> adalah garda terdepan berupa unit dapur dan distribusi lokal yang mengelola pengadaan bahan baku segar hingga pengantaran makanan ke lokasi sasaran.
              </p>
            </div>
            <div className="p-10 bg-white rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Target Sasaran</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                Program ini berfokus pada <span className="font-bold text-blue-700">seluruh siswa sekolah (PAUD-SMA)</span>, <span className="font-bold text-blue-700">santri</span>, <span className="font-bold text-blue-700">balita</span>, serta memberikan dukungan bagi <span className="font-bold text-blue-700">ibu hamil & menyusui</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistical Breakdown Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
             <div className="space-y-4">
               <p className="text-emerald-600 font-black tracking-[0.25em] text-xs uppercase">Potensi Sasaran Kabupaten Bandung</p>
               <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Cakupan Luas di 31 Kecamatan</h2>
             </div>
             <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-6">
                <div className="bg-emerald-50 p-4 rounded-2xl">
                   <Target className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Kapasitas Potensi</p>
                  <p className="text-3xl font-black text-emerald-600">{homeStats.potensiTotal.toLocaleString('id-ID')}</p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             <BreakdownCard label="PAUD & TK" value={homeStats.breakdown.paud_tk} icon={<BookOpen className="w-6 h-6"/>} sub="Pendidikan Dini" />
             <BreakdownCard label="Siswa SD/MI" value={homeStats.breakdown.sd_mi} icon={<School className="w-6 h-6"/>} sub="Pendidikan Dasar" />
             <BreakdownCard label="Siswa SMP/MTs" value={homeStats.breakdown.smp_mts} icon={<School className="w-6 h-6"/>} sub="Menengah Pertama" />
             <BreakdownCard label="SMA/SMK/MA" value={homeStats.breakdown.sma_smk_ma} icon={<School className="w-6 h-6"/>} sub="Menengah Atas" />
             
             <BreakdownCard label="Balita" value={homeStats.breakdown.balita} icon={<Baby className="w-6 h-6"/>} sub="Pencegahan Stunting" color="bg-orange-50" iconColor="bg-orange-600" />
             <BreakdownCard label="Ibu Hamil" value={homeStats.breakdown.bumil} icon={<Stethoscope className="w-6 h-6"/>} sub="Dukungan Kehamilan" color="bg-rose-50" iconColor="bg-rose-600" />
             <BreakdownCard label="Ibu Menyusui" value={homeStats.breakdown.busui} icon={<Milk className="w-6 h-6"/>} sub="Nutrisi Laktasi" color="bg-sky-50" iconColor="bg-sky-600" />
             <BreakdownCard label="Pesantren & Lain" value={homeStats.breakdown.pesantren_lain} icon={<GraduationCap className="w-6 h-6"/>} sub="Santri & SLB" color="bg-teal-50" iconColor="bg-teal-600" />
          </div>

          <div className="bg-white p-10 md:p-16 rounded-[4rem] border border-slate-200 shadow-sm grid lg:grid-cols-2 gap-16 items-center">
             <div className="space-y-8">
               <h3 className="text-3xl font-black text-slate-900 leading-tight uppercase tracking-tighter">Infrastruktur Bedas Untuk Masa Depan</h3>
               <p className="text-slate-500 font-medium text-lg leading-relaxed">
                 Pemerintah Kabupaten Bandung terus memperluas jaringan SPPG untuk memastikan setiap sudut wilayah terjangkau layanan nutrisi berkualitas.
               </p>
               <div className="flex space-x-6">
                  <div className="flex-1 p-8 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-emerald-600 transition-colors">
                    <p className="text-4xl font-black text-slate-900 group-hover:text-white transition-colors">{homeStats.totalSppg}</p>
                    <p className="text-[11px] font-black text-slate-400 group-hover:text-emerald-100 transition-colors uppercase tracking-[0.2em] mt-2">Unit SPPG Aktif</p>
                  </div>
                  <div className="flex-1 p-8 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-slate-900 transition-colors">
                    <p className="text-4xl font-black text-slate-900 group-hover:text-white transition-colors">31</p>
                    <p className="text-[11px] font-black text-slate-400 group-hover:text-slate-400 transition-colors uppercase tracking-[0.2em] mt-2">Kecamatan Terlayani</p>
                  </div>
               </div>
             </div>
             <div className="relative group">
                <div className="absolute inset-0 bg-emerald-400 rounded-[3.5rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative bg-white border-2 border-slate-100 p-10 rounded-[3.5rem] shadow-xl space-y-8">
                   <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-black">1</div>
                      <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Bahan Baku Lokal</h4>
                   </div>
                   <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-black">2</div>
                      <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Standar Gizi Terpantau</h4>
                   </div>
                   <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-black">3</div>
                      <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Distribusi Higienis</h4>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );

  const BreakdownCard = ({ label, value, icon, sub, color = "bg-white", iconColor = "bg-emerald-600" }: any) => (
    <div className={`${color} p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all`}>
       <div className={`${iconColor} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 transition-transform`}>{icon}</div>
       <div>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
         <h4 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{value.toLocaleString('id-ID')}</h4>
         <p className="text-[10px] font-bold text-slate-400 uppercase italic opacity-60">{sub}</p>
       </div>
    </div>
  );

  const CapaianView = () => (
    <div className="bg-white min-h-screen pb-20 animate-fade-in">
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-20 z-30 px-4 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => navigateTo('home')} className="flex items-center text-slate-600 font-black hover:text-emerald-600 transition-all group">
            <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
            KEMBALI KE BERANDA
          </button>
          <div className="hidden md:flex items-center space-x-4">
            <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
              Live Monitoring: Realisasi vs Target
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-16 space-y-16">
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Capaian Penerima Manfaat</h1>
          <p className="text-slate-500 text-lg font-medium leading-relaxed italic border-l-4 border-emerald-500 pl-6 py-2">
            "Monitoring perbandingan data target strategis pemerintah dengan realisasi aktual yang dilaporkan secara harian oleh Satuan Pelayanan Pangan Bergizi."
          </p>
        </div>

        {isAnalyticalDataLoading ? (
          <div className="py-40 flex flex-col items-center justify-center">
            <Loader2 className="w-20 h-20 text-emerald-600 animate-spin mb-8" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-center">Menghitung Data Capaian Wilayah...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatBox label="Target Sasaran" value={analyticalStats.totalTarget.toLocaleString('id-ID')} icon={<Target className="w-8 h-8"/>} color="bg-slate-900" textColor="text-white" sub="Jiwa Terverifikasi" />
              <StatBox label="Realisasi Total" value={analyticalStats.totalRealization.toLocaleString('id-ID')} icon={<Users className="w-8 h-8"/>} color="bg-emerald-600" textColor="text-white" sub="Data Terinput" />
              <StatBox label="Total Laki-Laki" value={analyticalStats.totalLaki.toLocaleString('id-ID')} icon={<UserCheck className="w-8 h-8"/>} color="bg-white" textColor="text-slate-900" sub="Siswa & Balita" />
              <StatBox label="Total Perempuan" value={analyticalStats.totalPerempuan.toLocaleString('id-ID')} icon={<UserCheck className="w-8 h-8"/>} color="bg-white" textColor="text-slate-900" sub="Siswa, Ibu Hamil, Balita" />
            </div>

            <div className="bg-slate-50 p-8 md:p-16 rounded-[4rem] border border-slate-200 shadow-inner">
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
                 <div className="space-y-4">
                   <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Visualisasi Capaian Wilayah</h3>
                   <p className="text-slate-500 font-medium">Bagan perbandingan realisasi harian di 31 Kecamatan.</p>
                 </div>
                 <div className="flex items-center space-x-6 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-slate-200 rounded-full"></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Realisasi</span>
                    </div>
                 </div>
               </div>

               <div className="space-y-12 max-h-[1000px] overflow-y-auto pr-6 custom-scrollbar">
                  {kecamatanComparison.sort((a,b) => b.target - a.target).map((k, i) => {
                    const maxTarget = Math.max(...kecamatanComparison.map(x => x.target));
                    return (
                      <div key={i} className="group space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center font-black text-slate-400 text-xs">{i+1}</span>
                            <span className="font-black text-slate-800 uppercase tracking-tight text-lg group-hover:text-emerald-600 transition-colors">{k.name}</span>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Efisiensi</p>
                             <p className={`text-xl font-black ${k.percentage > 0 ? 'text-emerald-500' : 'text-slate-300'}`}>{k.percentage.toFixed(2)}%</p>
                          </div>
                        </div>
                        <div className="relative h-6 w-full bg-white rounded-2xl overflow-hidden shadow-inner border border-slate-200 p-1">
                          <div className="absolute inset-y-1 left-1 bg-slate-100 rounded-xl transition-all duration-1000" style={{ width: `calc(${ (k.target / maxTarget) * 100 }% - 8px)` }}></div>
                          <div className="absolute inset-y-1 left-1 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-xl shadow-lg shadow-emerald-200 transition-all duration-1000 delay-300" style={{ width: `calc(${ (k.realization / maxTarget) * 100 }% - 8px)` }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">
                          <span>Target: {k.target.toLocaleString()}</span>
                          <span>Realisasi: {k.realization.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const SppgView = () => (
    <div className="bg-slate-50 min-h-screen pb-20 animate-fade-in">
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-20 z-30 px-4 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => navigateTo('home')} className="flex items-center text-slate-600 font-black hover:text-emerald-600 transition-all group">
            <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
            BERANDA
          </button>
          <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <Building2 className="w-4 h-4" />
            <span>Terdata: {homeStats.totalSppg} Unit Pelayanan</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-16 space-y-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Direktori Unit SPPG</h1>
            <p className="text-slate-500 text-lg font-medium leading-relaxed italic">
              "Satuan Pelayanan Pangan Bergizi yang bertugas mengelola dan mendistribusikan nutrisi di tingkat lokal."
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari Nama Unit..."
                value={sppgSearch}
                onChange={(e) => setSppgSearch(e.target.value)}
                className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-700 shadow-sm"
              />
            </div>
            <div className="relative w-full sm:w-64">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select 
                value={selectedKecamatan}
                onChange={(e) => setSelectedKecamatan(e.target.value)}
                className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-10 focus:outline-none focus:border-emerald-500 transition-all font-bold text-slate-700 shadow-sm appearance-none cursor-pointer"
              >
                {uniqueKecamatans.map(kec => (
                  <option key={kec} value={kec}>{kec}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSppgList.length > 0 ? filteredSppgList.map((sppg, idx) => (
            <div key={idx} className="bg-white p-10 rounded-[3.5rem] border border-slate-200 hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden flex flex-col justify-between shadow-sm">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-50 rounded-full -mr-20 -mt-20 opacity-40 group-hover:scale-125 transition-transform duration-700"></div>
              <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 bg-emerald-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg group-hover:bg-slate-900 transition-colors">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <button 
                    onClick={() => { setSelectedSppg(sppg); navigateTo('sppg-detail'); }}
                    className="p-3 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-colors"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-xl uppercase leading-tight mb-3 tracking-tight group-hover:text-emerald-600 transition-colors">{sppg.nama}</h4>
                  <div className="inline-flex items-center text-slate-400 font-black text-[10px] uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <MapPin className="w-3 h-3 mr-2" />
                    <span>{sppg.kecamatan}</span>
                  </div>
                </div>
              </div>
              <div className="relative z-10 mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
                 <div className="space-y-1">
                   <p className="text-[10px] font-black text-slate-300 uppercase">Wilayah Desa</p>
                   <p className="text-sm font-black text-slate-500 uppercase">{sppg.desa}</p>
                 </div>
                 <button 
                  onClick={() => { setSelectedSppg(sppg); navigateTo('sppg-detail'); }}
                  className="flex items-center text-emerald-600 font-black text-xs group/link"
                 >
                   DETAIL UNIT
                   <ChevronRight className="ml-1 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                 </button>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-40 text-center bg-white rounded-[4rem] border-4 border-dashed border-slate-100 shadow-inner">
              <Search className="w-24 h-24 text-slate-100 mx-auto mb-8" />
              <h3 className="text-2xl font-black text-slate-300 uppercase tracking-tighter">Unit Tidak Ditemukan</h3>
              <p className="text-slate-400 mt-2 font-medium">Coba filter kecamatan lain atau kata kunci pencarian yang berbeda.</p>
              <button onClick={() => {setSppgSearch(''); setSelectedKecamatan('SEMUA')}} className="mt-10 text-emerald-600 font-black text-sm uppercase underline">Reset Filter</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const SppgDetailView = () => {
    if (!selectedSppg) {
      navigateTo('sppg');
      return null;
    }

    const kecComparison = kecamatanComparison.find(k => k.name.toUpperCase() === selectedSppg.kecamatan.toUpperCase());
    const contributionPercentage = analyticalStats.totalRealization > 0 
      ? (selectedSppg.totalRealization / analyticalStats.totalRealization) * 100 
      : 0;

    return (
      <div className="bg-slate-50 min-h-screen pb-24 animate-fade-in">
        <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-20 z-30 px-6 py-5 shadow-sm">
          <div className="max-w-5xl mx-auto flex items-center">
            <button onClick={() => navigateTo('sppg')} className="flex items-center text-slate-600 font-black hover:text-emerald-600 transition-all group">
              <ArrowLeft className="w-6 h-6 mr-3 group-hover:-translate-x-1 transition-transform" />
              DIREKTORI UNIT
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 pt-16 space-y-12">
          {/* Header Section */}
          <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row gap-12 items-center md:items-start relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-50"></div>
            <div className="relative z-10">
               <div className="bg-emerald-600 w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-emerald-200">
                  <Building2 className="w-12 h-12 md:w-16 md:h-16" />
               </div>
            </div>
            <div className="flex-1 space-y-6 text-center md:text-left relative z-10">
              <div className="space-y-3">
                <div className="flex items-center justify-center md:justify-start space-x-3 text-emerald-600 font-black text-[10px] uppercase tracking-[0.25em]">
                   <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                   <span>SATUAN PELAYANAN AKTIF</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">{selectedSppg.nama}</h1>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-200">Kec. {selectedSppg.kecamatan}</span>
                <span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-200">Desa {selectedSppg.desa}</span>
              </div>
            </div>
          </div>

          {/* Analytical data for specific SPPG */}
          {isAnalyticalDataLoading ? (
             <div className="p-20 text-center bg-white rounded-[3rem] border border-slate-200">
                <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
                <p className="font-black text-xs uppercase tracking-widest text-slate-400">Sinkronisasi Laporan Harian Unit...</p>
             </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center space-x-3">
                 <Activity className="w-6 h-6 text-emerald-600" />
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">Performa & Statistik Unit</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <StatBox 
                  label="Realisasi Harian" 
                  value={selectedSppg.totalRealization.toLocaleString('id-ID')} 
                  icon={<Users className="w-8 h-8"/>} 
                  color="bg-emerald-600" 
                  textColor="text-white" 
                  sub="Jiwa Terlayani" 
                 />
                 <StatBox 
                  label="Laki-Laki" 
                  value={selectedSppg.totalLaki.toLocaleString('id-ID')} 
                  icon={<UserCheck className="w-8 h-8"/>} 
                  color="bg-white" 
                  textColor="text-slate-900" 
                  sub="Siswa & Balita" 
                 />
                 <StatBox 
                  label="Perempuan" 
                  value={selectedSppg.totalPerempuan.toLocaleString('id-ID')} 
                  icon={<UserCheck className="w-8 h-8"/>} 
                  color="bg-white" 
                  textColor="text-slate-900" 
                  sub="Siswa & Ibu Hamil" 
                 />
              </div>

              <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm grid md:grid-cols-2 gap-12">
                 <div className="space-y-6">
                   <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Kontribusi Wilayah</h4>
                   <div className="space-y-4">
                     <div className="space-y-2">
                       <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
                          <span>Kontribusi ke Kabupaten</span>
                          <span className="text-emerald-600">{contributionPercentage.toFixed(2)}%</span>
                       </div>
                       <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${contributionPercentage}%` }}></div>
                       </div>
                     </div>
                     {kecComparison && (
                       <div className="space-y-2">
                         <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
                            <span>Efisiensi Wilayah {selectedSppg.kecamatan}</span>
                            <span className="text-blue-600">{kecComparison.percentage.toFixed(2)}%</span>
                         </div>
                         <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${kecComparison.percentage}%` }}></div>
                         </div>
                       </div>
                     )}
                   </div>
                 </div>
                 <div className="flex flex-col justify-center p-8 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-sm font-medium text-slate-500 italic leading-relaxed">
                      "Unit {selectedSppg.nama} secara aktif mendukung program percepatan perbaikan gizi di wilayah desa {selectedSppg.desa}."
                    </p>
                 </div>
              </div>
            </div>
          )}

          {/* Location Section */}
          <div className="bg-slate-900 rounded-[4rem] p-10 md:p-16 text-white space-y-12 relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500 rounded-full blur-[120px] -mr-40 -mt-40 opacity-20"></div>
             <div className="relative z-10 space-y-8">
               <div className="space-y-4">
                 <h3 className="text-3xl font-black tracking-tight">Akses Navigasi Unit</h3>
                 <p className="text-slate-400 font-medium">Gunakan koordinat atau alamat di bawah ini untuk menuju lokasi Satuan Pelayanan Pangan Bergizi.</p>
               </div>
               {selectedSppg.lokasi ? (
                 <a 
                   href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedSppg.lokasi.replace('Lat: Lon:', ''))}`} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center justify-center space-x-4 w-full py-8 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2.5rem] font-black transition-all shadow-xl active:scale-95 group"
                 >
                   <MapIcon className="w-8 h-8" />
                   <span className="text-xl uppercase tracking-tighter">Navigasi Ke Lokasi</span>
                   <ExternalLink className="w-6 h-6 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                 </a>
               ) : (
                 <div className="bg-white/5 border-2 border-dashed border-white/10 p-12 rounded-[2.5rem] text-center">
                   <p className="text-slate-500 font-black uppercase tracking-widest italic">Lokasi Spesifik Sedang Dalam Proses Verifikasi</p>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    );
  };

  const StatBox = ({ label, value, icon, color, textColor, sub }: any) => (
    <div className={`${color} p-10 rounded-[3.5rem] ${textColor} border-2 border-slate-100/50 flex flex-col justify-between group overflow-hidden relative shadow-lg`}>
      <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-10 shadow-inner">{icon}</div>
      <div className="relative z-10">
        <p className="font-black text-[11px] uppercase tracking-[0.25em] opacity-60 mb-2">{label}</p>
        <h4 className="text-4xl font-black tracking-tighter mb-2">{value}</h4>
        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest italic">{sub}</p>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen">
      {isInitialLoading && <LoadingScreen />}
      
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4 cursor-pointer" onClick={() => navigateTo('home')}>
            <div className="bg-emerald-600 p-2.5 rounded-2xl shadow-xl shadow-emerald-100">
              <Utensils className="w-7 h-7 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-black text-xl tracking-tighter text-slate-900 leading-none">MBG BANDUNG</h1>
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.3em] mt-1.5">Portal Bedas</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
            <button onClick={() => navigateTo('home')} className={`hover:text-emerald-600 transition-colors py-2 relative group ${view === 'home' ? 'text-emerald-600' : ''}`}>
              Beranda
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 transform origin-left transition-transform duration-300 ${view === 'home' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
            </button>
            <button onClick={() => navigateTo('capaian')} className={`hover:text-emerald-600 transition-colors py-2 relative group ${view === 'capaian' ? 'text-emerald-600' : ''}`}>
              Capaian
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 transform origin-left transition-transform duration-300 ${view === 'capaian' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
            </button>
            <button onClick={() => navigateTo('sppg')} className={`hover:text-emerald-600 transition-colors py-2 relative group ${view === 'sppg' || view === 'sppg-detail' ? 'text-emerald-600' : ''}`}>
              SPPG
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 transform origin-left transition-transform duration-300 ${view === 'sppg' || view === 'sppg-detail' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
            </button>
          </div>
          <div className="bg-emerald-600 text-white px-5 py-2 rounded-2xl text-[10px] font-black shadow-lg shadow-emerald-200/50 uppercase tracking-widest hidden sm:block">
            Portal Resmi
          </div>
        </div>
      </nav>

      <main>
        {view === 'home' && <HomeView />}
        {view === 'capaian' && <CapaianView />}
        {view === 'sppg' && <SppgView />}
        {view === 'sppg-detail' && <SppgDetailView />}
      </main>

      <footer className="bg-slate-900 text-white py-24 px-6 mt-auto">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-2 space-y-8">
            <div className="flex items-center space-x-4">
              <div className="bg-emerald-600 p-2.5 rounded-2xl">
                <Utensils className="w-8 h-8 text-white" />
              </div>
              <span className="font-black text-3xl tracking-tighter uppercase">MBG KAB. BANDUNG</span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed text-sm font-medium">
              Komitmen nyata Pemerintah Kabupaten Bandung di bawah visi BEDAS untuk menciptakan generasi emas Indonesia 2045 melalui kecukupan gizi yang merata.
            </p>
            <div className="flex space-x-5">
              <a href="#" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-emerald-600 transition-all border border-white/10"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-emerald-600 transition-all border border-white/10"><PhoneCall className="w-5 h-5" /></a>
              <a href="#" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-emerald-600 transition-all border border-white/10"><Mail className="w-5 h-5" /></a>
            </div>
          </div>
          <div className="space-y-8">
            <h4 className="font-black text-xl text-white tracking-tight uppercase">Navigasi Portal</h4>
            <ul className="space-y-4 text-slate-400 text-xs font-black uppercase tracking-[0.2em]">
              <li><button onClick={() => navigateTo('home')} className="hover:text-emerald-400 transition-colors">Halaman Utama</button></li>
              <li><button onClick={() => navigateTo('capaian')} className="hover:text-emerald-400 transition-colors">Analisis Capaian</button></li>
              <li><button onClick={() => navigateTo('sppg')} className="hover:text-emerald-400 transition-colors">Direktori Unit SPPG</button></li>
            </ul>
          </div>
          <div className="space-y-8">
            <h4 className="font-black text-xl text-white tracking-tight uppercase">Kanal Informasi</h4>
            <ul className="space-y-4 text-slate-400 text-sm font-medium">
              <li><a href="https://bandungkab.go.id" target="_blank" className="hover:text-emerald-400 flex items-center"><Globe className="w-5 h-5 mr-3" /> bandungkab.go.id</a></li>
              <li><a href="#" className="hover:text-emerald-400 flex items-center"><Globe className="w-5 h-5 mr-3" /> Dinas Pendidikan</a></li>
              <li><a href="#" className="hover:text-emerald-400 flex items-center"><Globe className="w-5 h-5 mr-3" /> Dinas Kesehatan</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-16 border-t border-white/5 text-center md:text-left flex flex-col md:flex-row justify-between gap-8 text-[10px] text-slate-500 font-black tracking-[0.3em] uppercase">
          <p>© 2024 PEMERINTAH KABUPATEN BANDUNG. BEDAS - BANGKIT EDUKATIF DINAMIS AGAMIS SEJAHTERA.</p>
          <div className="flex items-center justify-center space-x-6">
            <span className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> SOREANG, JAWA BARAT</span>
          </div>
        </div>
      </footer>

      

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(0); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite ease-in-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(5, 150, 105, 0.2);
        }
      `}</style>
    </div>
  );
};

export default App;
