/**
 * Types & Interfaces for MegaUnzipper Companion & PHP Server Inspector
 */

export interface PhpParameter {
  key: string;
  category: 'core' | 'limits' | 'security' | 'execution' | 'extensions';
  name: string;
  value: string;
  unit?: string;
  recommended: string;
  status: 'optimal' | 'warning' | 'critical' | 'neutral';
  descriptionPl: string;
  descriptionEn: string;
  impactPl: string;
  impactEn: string;
}

export interface SecurityAuditPoint {
  id: string;
  titlePl: string;
  titleEn: string;
  severity: 'low' | 'medium' | 'high' | 'info';
  category: 'auth' | 'path' | 'session' | 'tempfile' | 'system';
  descriptionPl: string;
  descriptionEn: string;
  solutionPl: string;
  solutionEn: string;
  codeSnippet: string;
}

export interface ScriptCustomizations {
  adminUser: string;
  passwordHash: string;
  rawPassword?: string;
  maxLifetimeSeconds: number; // 0 to disable
  enableBruteForceProtection: boolean;
  maxFailedAttempts: number;
  enableServerInfoTab: boolean;
  enableSafeExtraction: boolean; // block .htaccess, .env, .php unless forced
  enforceSsl: boolean;
  logActions: boolean;
  selectedLanguage: 'pl' | 'en' | 'de' | 'es' | 'fr' | 'it' | 'pt';
}
