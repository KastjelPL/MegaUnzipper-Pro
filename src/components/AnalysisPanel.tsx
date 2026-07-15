import React from 'react';
import { motion } from 'motion/react';
import { Shield, Clock, Lock, Key, Trash2, Globe, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { SecurityAuditPoint } from '../types';

interface AnalysisPanelProps {
  lang: 'pl' | 'en';
}

export default function AnalysisPanel({ lang }: AnalysisPanelProps) {
  const isPl = lang === 'pl';

  const auditPoints: SecurityAuditPoint[] = [
    {
      id: 'hardcoded_pass',
      titlePl: 'Zdefiniowany BCRYPT hash hasła',
      titleEn: 'Defined BCRYPT password hash',
      severity: 'medium',
      category: 'auth',
      descriptionPl: 'Skrypt używa bezpiecznego hashowania bcrypt (hasło domyślne to "password"), co chroni przed odczytaniem hasła z kodu skryptu. Jednak pozostawienie hasła domyślnego na serwerze to krytyczne ryzyko.',
      descriptionEn: 'The script uses secure bcrypt hashing (default is "password"), protecting against plain-text exposure in code. However, leaving the default password on a production server is a critical risk.',
      solutionPl: 'Wygeneruj własny unikalny hash bcrypt i podmień stałą AUTH_PASS_HASH.',
      solutionEn: 'Generate your own unique bcrypt hash and replace the AUTH_PASS_HASH constant.',
      codeSnippet: "define('AUTH_PASS_HASH', '$2y$10$...')"
    },
    {
      id: 'time_bomb',
      titlePl: 'Dead Man\'s Switch (Bomba zegarowa)',
      titleEn: 'Dead Man\'s Switch (Time Bomb)',
      severity: 'info',
      category: 'tempfile',
      descriptionPl: 'Mechanizm bezpieczeństwa, który automatycznie usuwa plik unzippera (funkcją unlink), jeśli plik przebywa na serwerze dłużej niż 24 godziny. Zabezpiecza przed zapomnianym skryptem na hostingu.',
      descriptionEn: 'A safety mechanism that automatically deletes the unzipper file (via unlink) if it remains on the server for more than 24 hours. Prevents forgotten utility scripts on hosting environments.',
      solutionPl: 'Można dostosować czas wygaśnięcia ($max_lifetime_seconds) lub wyłączyć go całkowicie po zabezpieczeniu skryptu.',
      solutionEn: 'You can customize the expiration time ($max_lifetime_seconds) or disable it entirely once the script is secured.',
      codeSnippet: "@unlink(__FILE__);"
    },
    {
      id: 'path_traversal_jail',
      titlePl: 'Blokada wyjścia poza katalog (Path Traversal)',
      titleEn: 'Directory Escape Lock (Path Traversal)',
      severity: 'high',
      category: 'path',
      descriptionPl: 'Funkcja securePath() sprawdza, czy docelowa ścieżka pliku lub folderu nie zaczyna się poza katalogiem, w którym uruchomiono skrypt. Blokuje manipulacje typu "../../etc/passwd".',
      descriptionEn: 'The securePath() function validates that the target file or directory path does not start outside the directory where the script is run. Blocks manipulations like "../../etc/passwd".',
      solutionPl: 'Funkcja używa realpath() i porównuje prefiksy ścieżek, co stanowi skuteczne zabezpieczenie w systemach Linux.',
      solutionEn: 'The function uses realpath() and compares path prefixes, providing an effective sandbox on Linux environments.',
      codeSnippet: "strpos($real_target_dir, $base_dir) === 0"
    },
    {
      id: 'session_hijacking',
      titlePl: 'Ochrona przed przejęciem sesji (Session Hijacking)',
      titleEn: 'Session Hijacking Protection',
      severity: 'medium',
      category: 'session',
      descriptionPl: 'Skrypt przypisuje sesję do nagłówka User-Agent przeglądarki użytkownika. Jeśli User-Agent nagle się zmieni, sesja jest niszczona.',
      descriptionEn: 'The script binds the active session to the user\'s User-Agent header. If the User-Agent suddenly changes, the session is destroyed.',
      solutionPl: 'Warto dodatkowo powiązać sesję z adresem IP (z uwzględnieniem proxy i Cloudflare) lub wdrożyć obowiązkowe SSL.',
      solutionEn: 'Consider additionally binding the session to a masked IP address (taking proxies/Cloudflare into account) or enforcing SSL.',
      codeSnippet: "$_SESSION['user_agent'] !== $_SERVER['HTTP_USER_AGENT']"
    },
    {
      id: 'csrf_protection',
      titlePl: 'Zabezpieczenie przed atakami CSRF',
      titleEn: 'CSRF Protection',
      severity: 'medium',
      category: 'auth',
      descriptionPl: 'Każde zapytanie POST (rozpakowanie, usunięcie, chmod) wymaga przesłania unikalnego tokenu CSRF wygenerowanego kryptograficznie przy logowaniu. Blokuje zdalne złośliwe wywołania.',
      descriptionEn: 'Every POST request (extraction, deletion, chmod) requires submitting a unique cryptographically secure CSRF token generated during login. Prevents remote cross-site requests.',
      solutionPl: 'Token jest porównywany za pomocą bezpiecznej funkcji hash_equals(), chroniąc przed atakami typu timing.',
      solutionEn: 'The token is compared using the secure hash_equals() function, protecting against timing attacks.',
      codeSnippet: "hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])"
    },
    {
      id: 'brute_force',
      titlePl: 'Brak ochrony przed Brute-Force',
      titleEn: 'No Brute-Force Protection',
      severity: 'high',
      category: 'auth',
      descriptionPl: 'Skrypt nie ogranicza liczby nieudanych prób logowania. Boty skanujące mogą bez przeszkód zgadywać hasło metodą słownikową.',
      descriptionEn: 'The script does not limit the number of failed login attempts. Scanning bots can guess the password continuously using dictionary attacks.',
      solutionPl: 'Należy dodać licznik prób logowania zapisywany w sesji lub tymczasowym pliku blokady (np. blokada na 15 min po 5 błędach).',
      solutionEn: 'Implement a login attempt counter stored in the session or a temporary lock file (e.g., lock for 15 mins after 5 failures).',
      codeSnippet: "// Do zaimplementowania: $_SESSION['failed_attempts']++"
    }
  ];

  const steps = [
    {
      titlePl: 'Uruchomienie skryptu',
      titleEn: 'Script Execution Startup',
      descPl: 'Uruchomienie sesji, konfiguracja bezpiecznych ciasteczek (httponly, secure).',
      descEn: 'Session initialization, secure cookies configuration (httponly, secure).',
      icon: Clock,
      color: 'text-indigo-400'
    },
    {
      titlePl: 'Weryfikacja bomby zegarowej',
      titleEn: 'Time Bomb verification',
      descPl: 'Porównanie daty modyfikacji pliku z czasem bieżącym. Samozniszczenie po 24 godzinach.',
      descEn: 'Compares file modification date with current time. Self-destruction triggers after 24h.',
      icon: AlertTriangle,
      color: 'text-amber-500'
    },
    {
      titlePl: 'Uwierzytelnienie i CSRF',
      titleEn: 'Authentication & CSRF Check',
      descPl: 'Weryfikacja logowania (bcrypt) i sprawdzanie tokenu CSRF przy operacjach POST.',
      descEn: 'Verification of credentials (bcrypt) and validation of CSRF token on POST requests.',
      icon: Lock,
      color: 'text-cyan-400'
    },
    {
      titlePl: 'Wykonanie Operacji',
      titleEn: 'Operation Execution',
      descPl: 'Ekstrakcja (ZipArchive) lub rekurencyjny CHMOD z zabezpieczeniem przed wyjściem z katalogu.',
      descEn: 'Extraction (ZipArchive) or recursive CHMOD with path-traversal protection jail.',
      icon: Shield,
      color: 'text-emerald-400'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Overview Card */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Shield className="text-blue-400 w-5 h-5" />
          {isPl ? 'Przegląd Architektury i Bezpieczeństwa' : 'Architecture & Security Overview'}
        </h3>
        <p className="text-slate-300 leading-relaxed text-sm">
          {isPl ? (
            <>
              Skrypt <strong>MegaUnzipper</strong> został zaprojektowany z myślą o jednorazowym, awaryjnym wgrywaniu na hosting i wypakowywaniu dużych paczek plików. Ze względu na swoją potężną funkcjonalność (dostęp do plików, uprawnienia CHMOD, pakowanie), zawiera on zaawansowane mechanizmy samoobronne, niespotykane w standardowych skryptach typu unzipper.
            </>
          ) : (
            <>
              The <strong>MegaUnzipper</strong> script is designed for one-time, emergency hosting deployment to extract large file packages. Due to its powerful functionality (file system access, CHMOD settings, compression), it contains advanced self-defense mechanisms rarely found in standard unzipper scripts.
            </>
          )}
        </p>
      </div>

      {/* Lifecycle Flowchart */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <RefreshCw className="text-indigo-400 w-5 h-5 animate-spin-slow" />
          {isPl ? 'Przebieg Wykonania Żądania (Flow)' : 'Request Execution Flow'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-950/60 border border-white/5 rounded-xl p-4 relative"
              >
                {idx < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 z-10 text-slate-600 font-mono text-xl font-bold">
                    →
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg bg-white/5 ${step.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-slate-500 font-mono">0{idx + 1}.</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{isPl ? step.titlePl : step.titleEn}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{isPl ? step.descPl : step.descEn}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Audit Checklist */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Lock className="text-teal-400 w-5 h-5" />
          {isPl ? 'Audyt Bezpieczeństwa Skryptu' : 'Script Security Audit'}
        </h3>
        
        <div className="space-y-4">
          {auditPoints.map((point) => {
            const isHigh = point.severity === 'high';
            const isMed = point.severity === 'medium';
            const isInfo = point.severity === 'info';
            const badgeColor = isHigh 
              ? 'bg-red-500/20 text-red-400 border-red-500/30' 
              : isMed 
                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
                : 'bg-blue-500/20 text-blue-400 border-blue-500/30';

            const badgeText = isPl 
              ? (isHigh ? 'Wysoki' : isMed ? 'Średni' : 'Informacja')
              : (isHigh ? 'High' : isMed ? 'Medium' : 'Info');

            return (
              <div 
                key={point.id} 
                className="bg-slate-900/40 hover:bg-slate-900/70 transition-all border border-white/5 rounded-xl p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h4 className="font-bold text-slate-200 text-base flex items-center gap-2">
                    {isHigh ? (
                      <AlertTriangle className="text-red-400 w-5 h-5" />
                    ) : (
                      <CheckCircle className="text-teal-400 w-5 h-5" />
                    )}
                    {isPl ? point.titlePl : point.titleEn}
                  </h4>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border ${badgeColor} font-semibold`}>
                    {badgeText}
                  </span>
                </div>
                
                <p className="text-sm text-slate-400 mb-3 leading-relaxed">
                  {isPl ? point.descriptionPl : point.descriptionEn}
                </p>

                <div className="bg-slate-950/80 rounded-lg p-3 border border-white/5 mb-3">
                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1 font-sans">
                    {isPl ? 'Zasada Działania / Rozwiązanie:' : 'Working Principle / Solution:'}
                  </div>
                  <div className="text-xs text-emerald-400 leading-relaxed font-sans">
                    {isPl ? point.solutionPl : point.solutionEn}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">
                    {isPl ? 'Kluczowy fragment kodu:' : 'Key code snippet:'}
                  </span>
                  <code className="text-xs bg-slate-950 px-2 py-1 rounded text-pink-400 font-mono border border-white/5">
                    {point.codeSnippet}
                  </code>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
