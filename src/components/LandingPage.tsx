import React from 'react';
import { motion } from 'motion/react';
import { Archive, ShieldCheck, Zap, Key, Flame, HelpCircle, HardDrive, Download, Cpu, Sparkles, Globe } from 'lucide-react';

interface LandingPageProps {
  lang: 'pl' | 'en';
  onNavigateToGenerator: () => void;
  onNavigateToServer: () => void;
}

export default function LandingPage({ lang, onNavigateToGenerator, onNavigateToServer }: LandingPageProps) {
  const isPl = lang === 'pl';

  const features = [
    {
      icon: Zap,
      titlePl: 'Błyskawiczne Rozpakowywanie',
      titleEn: 'Lightning-Fast Extraction',
      descPl: 'Ekstrakcja archiwów ZIP bezpośrednio na serwerze w ułamku sekundy – bez powolnego przesyłania tysięcy małych plików przez tradycyjne FTP.',
      descEn: 'Extract ZIP archives directly on the server in a fraction of a second – skipping the slow process of uploading thousands of tiny files over traditional FTP.',
      color: 'text-sky-400 bg-sky-500/10'
    },
    {
      icon: ShieldCheck,
      titlePl: 'Rekurencyjny CHMOD',
      titleEn: 'Recursive CHMOD Permissions',
      descPl: 'Błyskawiczne ustawianie i naprawianie uprawnień dla całego drzewa katalogów (np. 755 dla folderów i 644 dla plików) jednym kliknięciem.',
      descEn: 'Instantly apply and repair correct file and folder permissions across your entire directory tree (e.g., 755 for folders and 644 for files) in one click.',
      color: 'text-emerald-400 bg-emerald-500/10'
    },
    {
      icon: Archive,
      titlePl: 'Szybka Kompresja katalogów',
      titleEn: 'Fast Directory Compression',
      descPl: 'Możliwość spakowania wybranego podfolderu lub całej zawartości strony do nowego archiwum ZIP bezpośrednio na dysku serwera.',
      descEn: 'Compress any subfolder or your entire website structure into a new ZIP archive directly on the server hard drive.',
      color: 'text-purple-400 bg-purple-500/10'
    },
    {
      icon: Download,
      titlePl: 'CMS Installer 1-Kliknięciem',
      titleEn: 'One-Click CMS Installer',
      descPl: 'Automatyczne pobieranie i instalacja WordPress, PrestaShop, OpenCart, Joomla, Drupal i innych bezpośrednio na serwer z pominięciem blokad bezpiecznego trybu.',
      descEn: 'Automatically download and set up clean installations of WordPress, PrestaShop, OpenCart, Joomla, Drupal, and others directly on your server.',
      color: 'text-yellow-400 bg-yellow-500/10'
    },
    {
      icon: Globe,
      titlePl: 'Remote Downloader & Formaty',
      titleEn: 'Remote Downloader & Formats',
      descPl: 'Pobieraj pliki z zewnętrznych URL bezpośrednio na hosting i wypakowuj archiwa ZIP, RAR, 7z oraz TAR.GZ z inteligentnym dobieraniem rozszerzeń.',
      descEn: 'Download archives from external URLs directly to the server and extract ZIP, RAR, 7z, and TAR.GZ formats with smart extension auto-detection.',
      color: 'text-pink-400 bg-pink-500/10'
    },
    {
      icon: Flame,
      titlePl: 'Samozniszczenie (Dead Man\'s Switch)',
      titleEn: 'Automatic Self-Destruction',
      descPl: 'Wbudowany zegar bezpieczeństwa automatycznie usuwa plik unzippera z serwera po 24h, zapobiegając pozostawieniu tylnej furtki dla hakerów.',
      descEn: 'A built-in countdown clock automatically deletes the unzipper script from your server after 24h, preventing forgotten backdoors.',
      color: 'text-rose-400 bg-rose-500/10'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Introduction Banner */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-900/40 border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-4 max-w-xl text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
              <span>{isPl ? 'Witamy w MegaUnzipper' : 'Welcome to MegaUnzipper'}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
              {isPl ? 'Co to jest MegaUnzipper?' : 'What is MegaUnzipper?'}
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {isPl ? (
                <>
                  <strong>MegaUnzipper</strong> to nowoczesne, ultralekkie i potężne narzędzie webmasterskie zaprojektowane do natychmiastowego zarządzania plikami na serwerach FTP/hostingach współdzielonych. Zamiast męczyć się godzinami z przesyłaniem CMS-ów (np. WordPress, PrestaShop) plik po pliku, pakujesz wszystko w jeden archiwum ZIP, wgrywasz na serwer wraz ze skryptem unzippera i rozpakowujesz w sekundę!
                </>
              ) : (
                <>
                  <strong>MegaUnzipper</strong> is a modern, lightweight, and powerful webmaster tool designed to instantly manage files on shared hosting environments or VPS servers. Instead of wasting hours transferring individual files for CMS platforms (like WordPress, PrestaShop), you compress everything into a single ZIP archive, upload it with the unzipper script, and extract it instantly!
                </>
              )}
            </p>
            
            <div className="flex flex-wrap gap-3 pt-2">
              <button 
                onClick={onNavigateToGenerator}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98]"
              >
                {isPl ? 'Przejdź do konfiguracji i pobierania' : 'Configure & Download unzipper.php'}
              </button>
              <button 
                onClick={onNavigateToServer}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
              >
                {isPl ? 'Zbadaj limity serwera' : 'Check Server Limits'}
              </button>
            </div>
          </div>

          <div className="w-full md:w-auto flex justify-center">
            {/* Minimal Graphical Representation of Unzipping */}
            <div className="bg-slate-950/80 border border-white/10 p-6 rounded-2xl w-64 shadow-2xl relative">
              <div className="absolute top-2 right-2 flex gap-1.5">
                <span className="w-2.5 h-2.5 bg-red-500/80 rounded-full" />
                <span className="w-2.5 h-2.5 bg-yellow-500/80 rounded-full" />
                <span className="w-2.5 h-2.5 bg-green-500/80 rounded-full" />
              </div>

              <div className="flex justify-center items-center h-24 mb-4 relative">
                {/* Dynamic animated graphic */}
                <div className="w-16 h-16 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center absolute">
                  <Archive className="w-8 h-8 text-indigo-400 animate-pulse" />
                </div>
                <div className="w-24 h-24 rounded-full border border-dashed border-indigo-500/20 animate-spin-slow" />
              </div>

              <div className="space-y-2">
                <div className="h-2 bg-slate-800 rounded-full w-full" />
                <div className="h-2 bg-slate-800 rounded-full w-5/6 mx-auto" />
                <div className="h-2 bg-slate-800 rounded-full w-4/6 mx-auto" />
              </div>

              <div className="mt-4 text-center">
                <span className="text-[10px] font-mono text-emerald-400 font-bold tracking-wider uppercase bg-emerald-500/10 px-2 py-0.5 rounded">
                  {isPl ? 'STATUS: GOTOWY' : 'STATUS: READY'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Features Grid */}
      <div>
        <h4 className="text-xl font-bold text-white mb-6 text-center">
          {isPl ? 'Główne zastosowania MegaUnzippera' : 'Key Use Cases of MegaUnzipper'}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                className="bg-slate-900/40 hover:bg-slate-900/60 border border-white/5 hover:border-white/10 p-5 rounded-2xl transition-all flex gap-4"
              >
                <div className={`p-3 rounded-xl shrink-0 h-12 w-12 flex items-center justify-center ${feat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="font-bold text-white text-base mb-1.5">
                    {isPl ? feat.titlePl : feat.titleEn}
                  </h5>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {isPl ? feat.descPl : feat.descEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Why Companion page card */}
      <div className="bg-slate-950/50 border border-dashed border-white/10 rounded-2xl p-6 sm:p-8 text-left">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <HelpCircle className="text-indigo-400 w-5 h-5" />
          {isPl ? 'Do czego służy ten Companion?' : 'Why use this Companion?'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-300">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">01. {isPl ? 'Analiza działania' : 'Flow Analysis'}</span>
            <p className="leading-relaxed">
              {isPl ? 'Możesz zobaczyć, jak dokładnie działa unzipper.php linia po linii, poznając jego zasady zabezpieczeń przed nadpisaniem i atakami.' : 'Explore how unzipper.php processes requests line-by-line and review its security layers protecting you against remote exploitation.'}
            </p>
          </div>
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">02. {isPl ? 'Limity PHP serwera' : 'PHP Server Limits'}</span>
            <p className="leading-relaxed">
              {isPl ? 'Sprawdź, jakie limity pamięci RAM i czasu wykonania (Timeout) mają krytyczne znaczenie dla stabilności operacji rozpakowywania.' : 'Determine which execution time (Timeout) and RAM limits are critical for stable archive extraction directly on your hosting server.'}
            </p>
          </div>
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">03. {isPl ? 'Konfiguracja i Generowanie' : 'Secure Generator'}</span>
            <p className="leading-relaxed">
              {isPl ? 'Skonfiguruj własną nazwę użytkownika, hasło (bezpieczny hash bcrypt), limity samozniszczenia i wygeneruj gotowy plik PHP.' : 'Set up your custom username, password (secure bcrypt hash), self-destruction countdown, and instantly download your ready-to-run file.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
