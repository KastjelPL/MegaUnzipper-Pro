import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Info, CheckCircle, AlertTriangle, XCircle, HardDrive, Cpu, ShieldAlert, CpuIcon, Layers, FileText } from 'lucide-react';
import { PhpParameter } from '../types';

interface ServerInspectorProps {
  lang: 'pl' | 'en';
}

export default function ServerInspector({ lang }: ServerInspectorProps) {
  const isPl = lang === 'pl';
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'core' | 'limits' | 'security' | 'extensions'>('all');

  // Comprehensive list of PHP Server Parameters that can be read
  const phpParameters: PhpParameter[] = [
    {
      key: 'php_version',
      category: 'core',
      name: 'PHP Version',
      value: '8.3.4',
      recommended: '>= 8.1.0',
      status: 'optimal',
      descriptionPl: 'Wersja interpretera PHP zainstalowana na serwerze.',
      descriptionEn: 'The version of the PHP interpreter installed on the server.',
      impactPl: 'Wersje >= 8.1 oferują lepsze zarządzanie pamięcią, szybsze działanie ZIP oraz ulepszone zabezpieczenia.',
      impactEn: 'PHP versions >= 8.1 offer better memory management, faster ZIP operations, and superior security.',
    },
    {
      key: 'memory_limit',
      category: 'limits',
      name: 'memory_limit',
      value: '256M',
      recommended: '>= 128M',
      status: 'optimal',
      descriptionPl: 'Maksymalna ilość pamięci RAM, jaką pojedynczy skrypt PHP może zaalokować.',
      descriptionEn: 'The maximum amount of RAM that a single PHP script is allowed to allocate.',
      impactPl: 'Rozpakowywanie ogromnych plików ZIP (np. 1GB+) w locie wymaga dużej pamięci podręcznej. Przy limitach rzędu 64M skrypt może ulec awarii (fatal error).',
      impactEn: 'Extracting huge ZIP files (e.g. 1GB+) on-the-fly requires significant buffer memory. With limits like 64M, the script might crash with a fatal error.',
    },
    {
      key: 'max_execution_time',
      category: 'limits',
      name: 'max_execution_time',
      value: '120s',
      recommended: '>= 60s',
      status: 'optimal',
      descriptionPl: 'Maksymalny czas (w sekundach), przez jaki skrypt może działać przed przerwaniem przez serwer.',
      descriptionEn: 'The maximum time in seconds a script is allowed to run before being terminated by the parser.',
      impactPl: 'Wypakowywanie dużych archiwów z tysiącami małych plików (np. WordPress) może zająć kilkadziesiąt sekund. Zbyt krótki limit (np. 30s) przerwie rozpakowywanie w połowie.',
      impactEn: 'Extracting large archives with thousands of small files (e.g. WordPress) can take up to a minute. Too short a limit (e.g. 30s) will abort the process halfway through.',
    },
    {
      key: 'upload_max_filesize',
      category: 'limits',
      name: 'upload_max_filesize',
      value: '64M',
      recommended: '>= 32M',
      status: 'neutral',
      descriptionPl: 'Maksymalny dozwolony rozmiar pojedynczego przesyłanego pliku na serwer drogą HTTP POST.',
      descriptionEn: 'The maximum size of an individual uploaded file allowed via HTTP POST.',
      impactPl: 'Jeśli planujesz wgrywać paczkę ZIP bezpośrednio przez formularz przeglądarki, ta wartość ogranicza maksymalną wielkość archiwum.',
      impactEn: 'If you plan to upload the ZIP package directly via a browser form, this value caps the maximum archive file size.',
    },
    {
      key: 'post_max_size',
      category: 'limits',
      name: 'post_max_size',
      value: '80M',
      recommended: '>= post_max_size > upload_max_filesize',
      status: 'optimal',
      descriptionPl: 'Maksymalny dopuszczalny rozmiar danych wysyłanych metodą POST (musi być większy lub równy upload_max_filesize).',
      descriptionEn: 'The maximum size of POST data allowed. This setting also affects file upload size and must be larger than upload_max_filesize.',
      impactPl: 'Zabezpiecza serwer przed wysyceniem pasma, ale musi być wystarczająco duży, by przetworzyć formularze unzippera i wysyłkę plików.',
      impactEn: 'Protects the server from bandwidth exhaustion, but must be large enough to process unzipper forms and file uploads.',
    },
    {
      key: 'extension_zip',
      category: 'extensions',
      name: 'PHP Zip Extension (ZipArchive)',
      value: 'Enabled (v1.22.3)',
      recommended: 'Enabled',
      status: 'optimal',
      descriptionPl: 'Rozszerzenie PHP umożliwiające natywny odczyt i zapis archiwów .zip.',
      descriptionEn: 'PHP extension enabling native reading and writing of .zip archives.',
      impactPl: 'Krytyczne dla działania MegaUnzippera. Bez tego rozszerzenia skrypt musiałby polegać na wolniejszych bibliotekach PHP lub poleceniach systemowych, co często jest zablokowane.',
      impactEn: 'Critical for MegaUnzipper. Without this extension, the script would have to rely on slower PHP userland libraries or system commands, which are often blocked.',
    },
    {
      key: 'allow_url_fopen',
      category: 'security',
      name: 'allow_url_fopen',
      value: 'On',
      recommended: 'Off (unless needed)',
      status: 'warning',
      descriptionPl: 'Zezwala funkcjom obsługującym pliki (np. file_get_contents) na pobieranie danych z zewnętrznych adresów URL.',
      descriptionEn: 'Allows file-handling functions (such as file_get_contents) to retrieve data from external URLs.',
      impactPl: 'Włączenie ułatwia pobieranie paczek ZIP bezpośrednio z zewnętrznych serwerów (np. GitHuba), ale zwiększa ryzyko ataków typu Remote File Inclusion (RFI) w przypadku innych podatnych skryptów.',
      impactEn: 'Enabling this makes it easy to pull ZIP packages directly from external servers (like GitHub), but increases the risk of Remote File Inclusion (RFI) in other vulnerable scripts on the same server.',
    },
    {
      key: 'display_errors',
      category: 'security',
      name: 'display_errors',
      value: 'Off',
      recommended: 'Off',
      status: 'optimal',
      descriptionPl: 'Określa, czy błędy i ostrzeżenia PHP mają być wypisywane bezpośrednio na ekranie użytkownika.',
      descriptionEn: 'Determines whether PHP errors and warnings should be printed directly to the user screen.',
      impactPl: 'Na produkcji powinno być wyłączone ("Off"). Włączenie ułatwia debugowanie, ale ujawnia strukturę katalogów serwera potencjalnym intruzom.',
      impactEn: 'Should be disabled ("Off") in production. Enabling makes debugging easier but reveals server directory structure to potential intruders.',
    },
    {
      key: 'disable_functions',
      category: 'security',
      name: 'disable_functions',
      value: 'exec, system, passthru, popen, proc_open, shell_exec',
      recommended: 'exec, system, shell_exec (for high security)',
      status: 'optimal',
      descriptionPl: 'Lista wbudowanych funkcji PHP, które zostały zablokowane ze względów bezpieczeństwa przez administratora.',
      descriptionEn: 'A list of built-in PHP functions that have been disabled by the administrator for security reasons.',
      impactPl: 'Zablokowanie shell_exec/system chroni serwer przed uruchomieniem złośliwych komend bash. MegaUnzipper opiera się na klasie ZipArchive, więc działa poprawnie nawet przy tych blokadach.',
      impactEn: 'Disabling shell_exec/system protects the server from malicious shell commands. MegaUnzipper relies on ZipArchive, meaning it works flawlessly even with these restrictions.',
    },
    {
      key: 'open_basedir',
      category: 'security',
      name: 'open_basedir',
      value: '/var/www/vhosts/user123/httpdocs/:/tmp/',
      recommended: 'Configured',
      status: 'optimal',
      descriptionPl: 'Ogranicza pliki, które mogą być otwierane przez PHP, do określonego drzewa katalogów (np. tylko katalog konta użytkownika).',
      descriptionEn: 'Limits the files that can be accessed by PHP to the specified directory-tree, preventing scripts from accessing system files.',
      impactPl: 'Znakomite zabezpieczenie. Uniemożliwia skryptom (nawet złośliwym) odczytanie plików konfiguracyjnych innych stron na tym samym serwerze współdzielonym.',
      impactEn: 'Excellent security measure. Prevents scripts (even malicious ones) from reading configuration files of other websites on the same shared server.',
    },
    {
      key: 'max_input_vars',
      category: 'limits',
      name: 'max_input_vars',
      value: '1000',
      recommended: '>= 1000',
      status: 'neutral',
      descriptionPl: 'Maksymalna liczba zmiennych wejściowych (GET, POST, COOKIE), jakie serwer zaakceptuje w jednym żądaniu.',
      descriptionEn: 'How many input variables (GET, POST, and COOKIE) may be accepted in a single request.',
      impactPl: 'Rzadko wpływa na unzippera, chyba że przesyłany jest gigantyczny formularz uprawnień dla tysięcy plików naraz.',
      impactEn: 'Rarely affects the unzipper, unless submitting a massive permissions matrix form for thousands of files simultaneously.',
    },
    {
      key: 'extension_zlib',
      category: 'extensions',
      name: 'PHP Zlib Extension',
      value: 'Enabled',
      recommended: 'Enabled',
      status: 'optimal',
      descriptionPl: 'Rozszerzenie PHP służące do kompresji strumieniowej gzip/deflate.',
      descriptionEn: 'PHP extension providing transparent support for gzip and deflate compression.',
      impactPl: 'Wymagane do prawidłowego dekompresowania skompresowanych wpisów w pliku ZIP.',
      impactEn: 'Required for proper decompression of compressed entries within a ZIP archive.',
    },
    {
      key: 'session_save_path',
      category: 'core',
      name: 'session.save_path',
      value: 'Writable (Custom .sessions)',
      recommended: 'Writable',
      status: 'optimal',
      descriptionPl: 'Katalog na serwerze, w którym przechowywane są dane sesji użytkowników.',
      descriptionEn: 'The directory on the server where active user session data is securely stored.',
      impactPl: 'MegaUnzipper wymusza zapis sesji w podfolderze ".sessions", aby zapobiec odczytaniu danych sesji logowania przez inne skrypty na hostingu współdzielonym.',
      impactEn: 'MegaUnzipper forces sessions to be saved inside a local ".sessions" subfolder to prevent session files from being read by other shared hosting scripts.',
    }
  ];

  const filteredParameters = phpParameters.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.value.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusIcon = (status: 'optimal' | 'warning' | 'critical' | 'neutral') => {
    switch (status) {
      case 'optimal':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStatusBg = (status: 'optimal' | 'warning' | 'critical' | 'neutral') => {
    switch (status) {
      case 'optimal':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-300';
      case 'critical':
        return 'bg-red-500/10 border-red-500/20 text-red-300';
      default:
        return 'bg-blue-500/10 border-blue-500/20 text-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro explain card */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">
              {isPl ? 'Inspektor Środowiska Serwerowego PHP' : 'PHP Server Environment Inspector'}
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              {isPl ? (
                <>
                  Poniższy panel prezentuje <strong>zalecane i optymalne parametry serwera PHP</strong>, które zapewniają stabilne i bezproblemowe działanie MegaUnzipper Pro przy pracy z dużymi plikami (np. archiwami powyżej 500MB). Aby uniknąć błędów takich jak zatrzymanie skryptu (Timeout) lub przekroczenie pamięci (Memory Exhausted), upewnij się, że Twój serwer posiada wersję <strong>PHP &gt;= 8.1</strong>, limit pamięci <strong>memory_limit &gt;= 256M</strong>, czas wykonywania skryptu <strong>max_execution_time &gt;= 120s</strong> oraz aktywne moduły <strong>ZipArchive</strong> i <strong>Zlib</strong>.
                </>
              ) : (
                <>
                  The panel below outlines the <strong>recommended and optimal PHP server configuration</strong> required for MegaUnzipper Pro to work with large files (such as archives exceeding 500MB) without issues. To prevent common issues like script timeouts or memory exhaustion, ensure your hosting environment runs <strong>PHP &gt;= 8.1</strong>, has a <strong>memory_limit &gt;= 256M</strong>, a <strong>max_execution_time &gt;= 120s</strong>, and has <strong>ZipArchive</strong> and <strong>Zlib</strong> extensions enabled.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-950/40 p-4 rounded-xl border border-white/5">
        {/* Search bar */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={isPl ? 'Filtruj parametry...' : 'Search directives...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Categories togglers */}
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {(['all', 'core', 'limits', 'security', 'extensions'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat === 'all' && (isPl ? 'Wszystkie' : 'All')}
              {cat === 'core' && (isPl ? 'Rdzeń' : 'Core')}
              {cat === 'limits' && (isPl ? 'Limity' : 'Limits')}
              {cat === 'security' && (isPl ? 'Bezpieczeństwo' : 'Security')}
              {cat === 'extensions' && (isPl ? 'Rozszerzenia' : 'Extensions')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of PHP parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredParameters.length > 0 ? (
          filteredParameters.map((param, idx) => (
            <motion.div
              key={param.key}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-slate-900/40 hover:bg-slate-900/70 border border-white/5 hover:border-white/10 rounded-xl p-5 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header info */}
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <span className="text-xs text-indigo-400 font-mono font-medium uppercase tracking-widest block mb-1">
                      {param.category}
                    </span>
                    <h4 className="text-base font-bold text-white font-mono">{param.name}</h4>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold ${getStatusBg(param.status)}`}>
                    {getStatusIcon(param.status)}
                    <span>{param.value}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  {isPl ? param.descriptionPl : param.descriptionEn}
                </p>
              </div>

              {/* Collapsible details / Impact section */}
              <div className="bg-slate-950/60 rounded-lg p-3.5 border border-white/5 space-y-2 mt-2">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  <Info className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isPl ? 'Znaczenie dla unzippera' : 'Significance for unzipper'}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {isPl ? param.impactPl : param.impactEn}
                </p>

                {/* Recommendation */}
                <div className="pt-2 border-t border-white/5 flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>{isPl ? 'Zalecane ustawienie:' : 'Recommended setup:'}</span>
                  <span className="text-slate-300 font-bold">{param.recommended}</span>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 text-center py-12 text-slate-500 bg-slate-900/20 rounded-2xl border border-dashed border-white/5">
            {isPl ? 'Brak parametrów spełniających kryteria wyszukiwania.' : 'No parameters match your search criteria.'}
          </div>
        )}
      </div>
    </div>
  );
}
