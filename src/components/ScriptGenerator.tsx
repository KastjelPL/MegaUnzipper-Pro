import React, { useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';
import { motion } from 'motion/react';
import { Settings, Key, Shield, Clock, Download, Copy, Check, Eye, EyeOff, AlertTriangle, Cpu, ToggleLeft, ToggleRight, List, HelpCircle } from 'lucide-react';
import { ScriptCustomizations } from '../types';
import { languagePacks } from './languagePacks';

interface ScriptGeneratorProps {
  lang: 'pl' | 'en';
}

export default function ScriptGenerator({ lang }: ScriptGeneratorProps) {
  const isPl = lang === 'pl';
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isHashing, setIsHashing] = useState(false);

  // Default Customization State
  const [configs, setConfigs] = useState<ScriptCustomizations>({
    adminUser: 'admin',
    passwordHash: '$2b$10$z5mCQPjAiAF1gYG/m6a.QOzSrOay9a.KoCTvzy2te295caBQ48kBK', // default 'password'
    rawPassword: 'password',
    maxLifetimeSeconds: 86400, // 24 hours
    enableBruteForceProtection: true,
    maxFailedAttempts: 5,
    enableServerInfoTab: true,
    enableSafeExtraction: true,
    enforceSsl: false,
    logActions: true,
    selectedLanguage: 'en'
  });

  // Calculate bcrypt hash when rawPassword changes
  useEffect(() => {
    if (!configs.rawPassword) return;
    
    setIsHashing(true);
    const delayDebounce = setTimeout(() => {
      try {
        // Generate salt and hash client-side with bcryptjs
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(configs.rawPassword || '', salt);
        // PHP's password_verify natively supports standard Blowfish/bcrypt $2a$ and $2y$ hashes
        // bcryptjs produces $2a$ which is fully supported by modern PHP's password_verify.
        // We replace the $2a$ with $2y$ to adhere to typical PHP standard, although modern PHP accepts both.
        const phpCompatibleHash = hash.replace(/^\$2a\$/, '$2y$');
        
        setConfigs(prev => ({
          ...prev,
          passwordHash: phpCompatibleHash
        }));
      } catch (err) {
        console.error('Hashing error', err);
      } finally {
        setIsHashing(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [configs.rawPassword]);

  // Handle simple input changes
  const handleInputChange = (field: keyof ScriptCustomizations, val: any) => {
    setConfigs(prev => ({
      ...prev,
      [field]: val
    }));
  };

  // Generate complete, highly advanced, customized single-file PHP script
  const generatePhpCode = (): string => {
    const {
      adminUser,
      passwordHash,
      maxLifetimeSeconds,
      enableBruteForceProtection,
      maxFailedAttempts,
      enableServerInfoTab,
      enableSafeExtraction,
      enforceSsl,
      logActions,
      selectedLanguage
    } = configs;

    const langPack = languagePacks[selectedLanguage] || languagePacks['en'];
    const phpLangArray = Object.entries(langPack)
      .map(([key, val]) => `        '${key}' => '${val.replace(/'/g, "\\'")}'`)
      .join(",\n");

    const phpCode = `<?php
/**
 * MegaUnzipper Pro - Advanced Webmaster Toolkit
 * Engineered by Maciej Łukasik | https://megadesign.pl
 *
 * Generated dynamically via MegaUnzipper Pro
 * @version 1.2.0
 * @author  Maciej Lukasik
 * @license GNU GPL v3
 * 
 * Includes Advanced Hardening:
 * - Dead Man's Switch (${maxLifetimeSeconds > 0 ? `${maxLifetimeSeconds}s life` : 'No expiry'})
 * - Brute-force lockout (${enableBruteForceProtection ? `${maxFailedAttempts} attempts` : 'No brute-force limits'})
 * - ${enforceSsl ? 'Enforced SSL redirects' : 'Standard connections'}
 * - ${logActions ? 'Active security logging' : 'Silent mode'}
 * - ${enableServerInfoTab ? 'Embedded PHP Live Server Parameters Tab' : 'Core extraction features only'}
 */

if (session_status() === PHP_SESSION_NONE) {
    $sess_dir = __DIR__ . '/.sessions';
    if (!is_dir($sess_dir)) {
        @mkdir($sess_dir, 0777, true);
    }
    @chmod($sess_dir, 0777);
    if (is_dir($sess_dir)) {
        ini_set('session.save_path', $sess_dir);
    }
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
        ini_set('session.cookie_secure', 1);
    }
    session_start();
}

// ==========================================
// CONFIGURATION & AUTHENTICATION CORE
// ==========================================
define('AUTH_USER', '${adminUser}');
define('AUTH_PASS_HASH', '${passwordHash}');
define('VERSION', '0.7.2-Hardened');

${enforceSsl ? `
// ==========================================
// SSL ENFORCER
// ==========================================
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === "off") {
    $redirect = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    header('HTTP/1.1 301 Moved Permanently');
    header('Location: ' . $redirect);
    exit;
}
` : ''}

${logActions ? `
// ==========================================
// SECURITY AUDIT LOGGER
// ==========================================
function logSecurityEvent($action, $details = '') {
    $logFile = __DIR__ . '/.unzip_audit_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN';
    $entry = "[$timestamp] [IP: $ip] [ACTION: $action] $details" . PHP_EOL;
    @file_put_contents($logFile, $entry, FILE_APPEND);
}
` : 'function logSecurityEvent($action, $details = "") {}'}

// ==========================================
// MULTILINGUAL ENGINE
// ==========================================
if (isset($_GET['lang'])) {
    $allowed_langs = ['${selectedLanguage}'];
    if (in_array($_GET['lang'], $allowed_langs)) {
        $_SESSION['mega_lang'] = $_GET['lang'];
    }
    header("Location: " . strtok($_SERVER['PHP_SELF'], '?'));
    exit;
}
$lang = isset($_SESSION['mega_lang']) ? $_SESSION['mega_lang'] : '${selectedLanguage}';

$translations = [
    '${selectedLanguage}' => [
${phpLangArray}
    ]
];

function __($key) {
    global $translations, $lang;
    return isset($translations[$lang][$key]) ? $translations[$lang][$key] : $key;
}

function writeProgress($current, $total, $status, $task_id = 'default') {
    $progress_dir = __DIR__ . '/.sessions';
    if (!is_dir($progress_dir)) {
        @mkdir($progress_dir, 0700, true);
    }
    $progress_file = $progress_dir . '/.progress_' . $task_id . '.json';
    @file_put_contents($progress_file, json_encode([
        'current' => $current,
        'total' => $total,
        'status' => $status,
        'percent' => $total > 0 ? round(($current / $total) * 100) : 0
    ]));
}

function clearProgress($task_id = 'default') {
    $progress_file = __DIR__ . '/.sessions/.progress_' . $task_id . '.json';
    if (file_exists($progress_file)) {
        @unlink($progress_file);
    }
}

function deleteDirectory($dirPath) {
    if (!is_dir($dirPath)) return false;
    $objects = scandir($dirPath);
    foreach ($objects as $object) {
        if ($object != "." && $object != "..") {
            if (is_dir($dirPath . "/" . $object) && !is_link($dirPath . "/" . $object)) {
                deleteDirectory($dirPath . "/" . $object);
            } else {
                @unlink($dirPath . "/" . $object);
            }
        }
    }
    return @rmdir($dirPath);
}

function selfDestructCleanup() {
    $sess_dir = __DIR__ . '/.sessions';
    deleteDirectory($sess_dir);
}

function countFilesRecursive($dir) {
    if (!is_dir($dir)) return 0;
    $count = 0;
    try {
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::SELF_FIRST
        );
        foreach ($iterator as $item) {
            if ($item->isFile()) {
                $count++;
            }
        }
    } catch (Exception $e) {
        $count = count(glob($dir . '/*'));
    }
    return $count;
}

function formatBytes($bytes) {
    if ($bytes === 0) return '0 B';
    $k = 1024;
    $sizes = ['B', 'KB', 'MB', 'GB'];
    $i = floor(log($bytes) / log($k));
    return round($bytes / pow($k, $i), 2) . ' ' . $sizes[$i];
}

function downloadFile($url, $destination_path, $task_id = 'default') {
    $url = trim($url);
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        return 'Invalid URL format.';
    }
    
    $parsed_url = parse_url($url);
    if (!isset($parsed_url['scheme']) || !in_array(strtolower($parsed_url['scheme']), ['http', 'https'])) {
        return 'Only HTTP and HTTPS protocols are allowed.';
    }
    
    $safe_dest = securePath($destination_path, true);
    $dest_dir = dirname($safe_dest);
    if (!is_dir($dest_dir)) {
        @mkdir($dest_dir, 0755, true);
    }
    writeProgress(0, 100, 'downloading', $task_id);
    
    $fp_out = @fopen($safe_dest, 'wb');
    if (!$fp_out) {
        return 'Cannot open local file for writing: ' . $destination_path;
    }
    
    if (extension_loaded('curl')) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_FILE, $fp_out);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        curl_setopt($ch, CURLOPT_NOPROGRESS, false);
        curl_setopt($ch, CURLOPT_PROGRESSFUNCTION, function($clientp, $download_size, $downloaded, $upload_size, $uploaded) use ($task_id) {
            if ($download_size > 0) {
                writeProgress(round($downloaded), round($download_size), 'downloading', $task_id);
            }
        });
        curl_setopt($ch, CURLOPT_TIMEOUT, 300);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        
        $res = curl_exec($ch);
        fclose($fp_out);
        
        if ($res === false) {
            $err = curl_error($ch);
            curl_close($ch);
            @unlink($safe_dest);
            clearProgress($task_id);
            return 'cURL error: ' . $err;
        }
        curl_close($ch);
    } else {
        $ctx = stream_context_create([
            'http' => [
                'header' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36\r\n",
                'follow_location' => 1,
                'timeout' => 300
            ],
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false
            ]
        ], [
            'notification' => function($notification_code, $severity, $message, $message_code, $bytes_transferred, $bytes_max) use ($task_id) {
                if ($notification_code === STREAM_NOTIFY_PROGRESS) {
                    if ($bytes_max > 0) {
                        writeProgress($bytes_transferred, $bytes_max, 'downloading', $task_id);
                    }
                }
            }
        ]);
        
        $fp_in = @fopen($url, 'rb', false, $ctx);
        if (!$fp_in) {
            fclose($fp_out);
            @unlink($safe_dest);
            clearProgress($task_id);
            return 'Failed to open URL for reading.';
        }
        
        while (!feof($fp_in)) {
            fwrite($fp_out, fread($fp_in, 8192));
        }
        fclose($fp_in);
        fclose($fp_out);
    }
    
    clearProgress($task_id);
    return true;
}

$installer_apps = [
    'wordpress' => [
        'name' => 'WordPress (Latest)',
        'url' => 'https://wordpress.org/latest.zip',
        'filename' => 'wordpress-latest.zip'
    ],
    'prestashop' => [
        'name' => 'PrestaShop (8.1.5)',
        'url' => 'https://github.com/PrestaShop/PrestaShop/releases/download/8.1.5/prestashop_8.1.5.zip',
        'filename' => 'prestashop_8.1.5.zip'
    ],
    'opencart' => [
        'name' => 'OpenCart (4.0.2.3)',
        'url' => 'https://github.com/opencart/opencart/releases/download/4.0.2.3/opencart-4.0.2.3.zip',
        'filename' => 'opencart-4.0.2.3.zip'
    ],
    'magento' => [
        'name' => 'Magento Open Source (2.4.7)',
        'url' => 'https://github.com/magento/magento2/archive/refs/tags/2.4.7.zip',
        'filename' => 'magento-2.4.7.zip'
    ],
    'joomla' => [
        'name' => 'Joomla (5.0.3)',
        'url' => 'https://github.com/joomla/joomla-cms/releases/download/5.0.3/Joomla_5.0.3-Stable-Full_Package.zip',
        'filename' => 'Joomla_5.0.3-Stable-Full_Package.zip'
    ],
    'drupal' => [
        'name' => 'Drupal (10.2.4)',
        'url' => 'https://ftp.drupal.org/files/projects/drupal-10.2.4.zip',
        'filename' => 'drupal-10.2.4.zip'
    ],
    'nextcloud' => [
        'name' => 'Nextcloud Server',
        'url' => 'https://download.nextcloud.com/server/releases/latest.zip',
        'filename' => 'nextcloud-latest.zip'
    ],
    'mediawiki' => [
        'name' => 'MediaWiki (1.41.0)',
        'url' => 'https://releases.wikimedia.org/mediawiki/1.41/mediawiki-1.41.0.zip',
        'filename' => 'mediawiki-1.41.0.zip'
    ],
    'moodle' => [
        'name' => 'Moodle (4.3.3)',
        'url' => 'https://download.moodle.org/download.php/direct/stable403/moodle-latest-403.zip',
        'filename' => 'moodle-latest-403.zip'
    ],
    'phpmyadmin' => [
        'name' => 'phpMyAdmin (5.2.1)',
        'url' => 'https://files.phpmyadmin.net/phpMyAdmin/5.2.1/phpMyAdmin-5.2.1-all-languages.zip',
        'filename' => 'phpMyAdmin-5.2.1.zip'
    ],
    'adminer' => [
        'name' => 'Adminer (4.8.1)',
        'url' => 'https://github.com/vrana/adminer/releases/download/v4.8.1/adminer-4.8.1.php',
        'filename' => 'adminer.php'
    ],
    'filegator' => [
        'name' => 'FileGator (7.8.0)',
        'url' => 'https://github.com/filegator/filegator/releases/download/v7.8.0/filegator_v7.8.0.zip',
        'filename' => 'filegator_v7.8.0.zip'
    ],
    'n8n' => [
        'name' => 'n8n (Source Zip)',
        'url' => 'https://github.com/n8n-io/n8n/archive/refs/heads/master.zip',
        'filename' => 'n8n-master.zip'
    ],
    'roundcube' => [
        'name' => 'Roundcube Webmail (1.6.6)',
        'url' => 'https://github.com/roundcube/roundcubemail/releases/download/1.6.6/roundcubemail-1.6.6-complete.tar.gz',
        'filename' => 'roundcubemail-1.6.6.tar.gz'
    ],
    'yourls' => [
        'name' => 'YOURLS (1.9.2)',
        'url' => 'https://github.com/YOURLS/YOURLS/archive/refs/tags/1.9.2.zip',
        'filename' => 'YOURLS-1.9.2.zip'
    ],
    'matomo' => [
        'name' => 'Matomo Analytics',
        'url' => 'https://builds.matomo.org/matomo.zip',
        'filename' => 'matomo.zip'
    ],
    'bitwarden' => [
        'name' => 'Bitwarden Vault (Vaultwarden Web Build)',
        'url' => 'https://github.com/dani-garcia/bw_web_builds/releases/download/v2024.1.2/bw_web_v2024.1.2.tar.gz',
        'filename' => 'vaultwarden-web-build.tar.gz'
    ],
    'gitea' => [
        'name' => 'Gitea Git Server (Source 1.21.7)',
        'url' => 'https://github.com/go-gitea/gitea/archive/refs/tags/v1.21.7.zip',
        'filename' => 'gitea-1.21.7.zip'
    ],
    'uptimekuma' => [
        'name' => 'Uptime Kuma (1.23.11)',
        'url' => 'https://github.com/louislam/uptime-kuma/archive/refs/tags/1.23.11.zip',
        'filename' => 'uptime-kuma-1.23.11.zip'
    ],
    'taiga' => [
        'name' => 'Taiga Back (6.8.0)',
        'url' => 'https://github.com/taigaio/taiga-back/archive/refs/tags/6.8.0.zip',
        'filename' => 'taiga-back-6.8.0.zip'
    ],
    'vikunja' => [
        'name' => 'Vikunja Frontend (0.23.0)',
        'url' => 'https://dl.vikunja.io/frontend/vikunja-frontend-0.23.0.zip',
        'filename' => 'vikunja-frontend-0.23.0.zip'
    ],
    'laravel' => [
        'name' => 'Laravel Boilerplate (10.2.6)',
        'url' => 'https://github.com/laravel/laravel/archive/refs/tags/v10.2.6.zip',
        'filename' => 'laravel-10.2.6.zip'
    ],
    'bootstrap' => [
        'name' => 'Bootstrap CSS Framework (5.3.3)',
        'url' => 'https://github.com/twbs/bootstrap/releases/download/v5.3.3/bootstrap-5.3.3-dist.zip',
        'filename' => 'bootstrap-5.3.3-dist.zip'
    ],
    'codeigniter' => [
        'name' => 'CodeIgniter Framework (4.4.6)',
        'url' => 'https://github.com/codeigniter4/framework/archive/refs/tags/v4.4.6.zip',
        'filename' => 'codeigniter-4.4.6.zip'
    ],
    'phpmailer' => [
        'name' => 'PHPMailer (6.9.1)',
        'url' => 'https://github.com/PHPMailer/PHPMailer/archive/refs/tags/v6.9.1.zip',
        'filename' => 'phpmailer-6.9.1.zip'
    ],
    'tinymce' => [
        'name' => 'TinyMCE Community (6.8.2)',
        'url' => 'https://download.tiny.cloud/tinymce/community/tinymce_6.8.2.zip',
        'filename' => 'tinymce_6.8.2.zip'
    ]
];

if (isset($_GET['get_progress'])) {
    header('Content-Type: application/json');
    $task_id = isset($_GET['task_id']) ? preg_replace('/[^a-zA-Z0-9_\\-]/', '', $_GET['task_id']) : 'default';
    $progress_file = __DIR__ . '/.sessions/.progress_' . $task_id . '.json';
    if (file_exists($progress_file)) {
        echo file_get_contents($progress_file);
    } else {
        echo json_encode(['current' => 0, 'total' => 0, 'status' => 'idle']);
    }
    exit;
}

if (isset($_GET['check_url'])) {
    header('Content-Type: application/json');
    $check_url = isset($_GET['url']) ? trim($_GET['url']) : '';
    if (empty($check_url) || !filter_var($check_url, FILTER_VALIDATE_URL)) {
        echo json_encode(['exists' => false]);
        exit;
    }
    
    $ctx = stream_context_create([
        'http' => [
            'method' => 'HEAD',
            'header' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36\\r\\n",
            'follow_location' => 1,
            'timeout' => 5
        ],
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false
        ]
    ]);
    
    $fp = @fopen($check_url, 'r', false, $ctx);
    if ($fp) {
        $meta = stream_get_meta_data($fp);
        fclose($fp);
        $headers = $meta['wrapper_data'] ?? [];
        $status_line = $headers[0] ?? '';
        $exists = false;
        if (preg_match('/HTTP\\/[0-9\\.]+\\s+([0-9]+)/i', $status_line, $matches)) {
            $code = (int)$matches[1];
            $exists = ($code >= 200 && $code < 400);
        }
        echo json_encode(['exists' => $exists]);
    } else {
        if (extension_loaded('curl')) {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $check_url);
            curl_setopt($ch, CURLOPT_NOBODY, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            echo json_encode(['exists' => ($code >= 200 && $code < 400)]);
        } else {
            echo json_encode(['exists' => false]);
        }
    }
    exit;
}

// ==========================================
// MECHANISM 1: DEAD MAN'S SWITCH (TIME BOMB)
// ==========================================
$max_lifetime_seconds = ${maxLifetimeSeconds};
$time_left = 0;

if ($max_lifetime_seconds > 0 && file_exists(__FILE__)) {
    $file_creation_time = filemtime(__FILE__);
    $age = time() - $file_creation_time;
    if ($age > $max_lifetime_seconds) {
        logSecurityEvent('AUTO_SELF_DESTRUCT', 'Script expired, trigger deletion');
        selfDestructCleanup();
        @unlink(__FILE__);
        if (isset($_SESSION)) {
            session_destroy();
        }
        die(__('time_bomb_msg'));
    } else {
        $time_left = $max_lifetime_seconds - $age;
    }
}

// ==========================================
// SESSION PROTECTION (ANTI-HIJACKING)
// ==========================================
if (isset($_SESSION['mega_auth']) && $_SESSION['mega_auth'] === true) {
    if (!isset($_SESSION['user_agent']) || $_SESSION['user_agent'] !== $_SERVER['HTTP_USER_AGENT']) {
        logSecurityEvent('SESSION_HIJACK', 'User-Agent mismatch, destroying session');
        session_destroy();
        die('Access Denied: Session hijacking detected.');
    }
}

if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

if (isset($_GET['logout'])) {
    logSecurityEvent('LOGOUT', 'User logout initiated');
    $_SESSION['mega_auth'] = false;
    session_destroy();
    header("Location: " . strtok($_SERVER['PHP_SELF'], '?'));
    exit;
}

// ==========================================
// BRUTE-FORCE PROTECTION CORE
// ==========================================
${enableBruteForceProtection ? `
if (!isset($_SESSION['login_attempts'])) {
    $_SESSION['login_attempts'] = 0;
}
if (isset($_SESSION['lockout_time']) && time() < $_SESSION['lockout_time']) {
    die(__('brute_force_lock'));
}
` : ''}

if (isset($_POST['auth_login'])) {
    $user = isset($_POST['auth_user']) ? trim($_POST['auth_user']) : '';
    $pass = isset($_POST['auth_pass']) ? trim($_POST['auth_pass']) : '';
    
    if ($user === AUTH_USER && password_verify($pass, AUTH_PASS_HASH)) {
        $_SESSION['mega_auth'] = true;
        $_SESSION['user_agent'] = $_SERVER['HTTP_USER_AGENT'];
        ${enableBruteForceProtection ? `$_SESSION['login_attempts'] = 0;` : ''}
        logSecurityEvent('LOGIN_SUCCESS', "Admin logged in");
        session_write_close();
        header("Location: " . strtok($_SERVER['PHP_SELF'], '?'));
        exit;
    } else {
        ${enableBruteForceProtection ? `
        $_SESSION['login_attempts']++;
        if ($_SESSION['login_attempts'] >= ${maxFailedAttempts}) {
            $_SESSION['lockout_time'] = time() + 900; // 15 mins
            logSecurityEvent('LOGIN_LOCKOUT', "Brute-force lockout triggered for User: $user");
            die(__('brute_force_lock'));
        }
        ` : ''}
        logSecurityEvent('LOGIN_FAIL', "Failed login attempt for User: $user");
        $auth_error = __('invalid_creds');
    }
}

$timestart = microtime(TRUE);
$GLOBALS['status'] = array();

function securePath($relative_path, $allow_non_existent = false) {
    $base_dir = rtrim(realpath(__DIR__), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
    if (empty($relative_path) || $relative_path === '.') {
        return rtrim($base_dir, DIRECTORY_SEPARATOR);
    }
    
    // Normalize slashes
    $relative_path = str_replace('\\\\', '/', $relative_path);
    $base_dir_normalized = str_replace('\\\\', '/', $base_dir);
    
    // Strip absolute base path if user provided it
    if (strpos($relative_path, $base_dir_normalized) === 0) {
        $relative_path = substr($relative_path, strlen($base_dir_normalized));
    }
    
    $clean_path = str_replace(array('../', '..'), array('', ''), $relative_path);
    $clean_path = ltrim($clean_path, '/');
    $combined = $base_dir . $clean_path;
    $real_target = realpath($combined);
    
    if ($real_target === false) {
        if ($allow_non_existent) {
            $test_path = $combined;
            while (!file_exists($test_path) && $test_path !== dirname($test_path)) {
                $test_path = dirname($test_path);
            }
            $real_exist = realpath($test_path);
            if ($real_exist !== false) {
                $real_exist_dir = rtrim($real_exist, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
                if (strpos($real_exist_dir, $base_dir) === 0) {
                    return $combined;
                }
            }
        }
        die(__('path_invalid'));
    }
    
    $real_target_dir = is_dir($real_target) ? rtrim($real_target, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR : $real_target;
    if (strpos($real_target_dir, $base_dir) !== 0) {
        die(__('path_traversal'));
    }
    
    return $real_target;
}

$unzipper = new Unzipper;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_POST['auth_login'])) {
    if (!isset($_SESSION['mega_auth']) || $_SESSION['mega_auth'] !== true) {
        die(__('access_denied_post'));
    }
    if (!isset($_POST['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
        die(__('csrf_failed'));
    }

    if (isset($_POST['self_destruct'])) {
        logSecurityEvent('SELF_DESTRUCT_MANUAL', 'Triggered script deletion manually');
        selfDestructCleanup();
        if (@unlink(__FILE__)) {
            $_SESSION = array();
            if (ini_get("session.use_cookies")) {
                $params = session_get_cookie_params();
                setcookie(session_name(), '', time() - 42000, $params["path"], $params["domain"], $params["secure"], $params["httponly"]);
            }
            session_destroy();
            die('<!DOCTYPE html><html lang="' . htmlspecialchars($lang, ENT_QUOTES, 'UTF-8') . '"><head><meta charset="UTF-8"><title>' . htmlspecialchars(__('destruct_title'), ENT_QUOTES, 'UTF-8') . '</title></head><body style="background:#06040A;color:#30D158;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;text-align:center;"><div><h1 style="font-size:48px;">' . htmlspecialchars(__('destruct_success_title'), ENT_QUOTES, 'UTF-8') . '</h1><p style="font-size:20px;color:#F1EFF7;">' . htmlspecialchars(__('destruct_success_desc'), ENT_QUOTES, 'UTF-8') . '</p></div></body></html>');
        } else {
            header("Location: " . $_SERVER['PHP_SELF'] . "?error=" . urlencode(__('destruct_failed')));
            exit;
        }
    }

    // Unzipping
    if (isset($_POST['dounzip'])) {
        $archive = isset($_POST['zipfile']) ? strip_tags($_POST['zipfile']) : '';
        $destination = isset($_POST['extpath']) ? trim(strip_tags($_POST['extpath'])) : '';
        $dir_chmod = isset($_POST['dir_chmod']) ? strip_tags($_POST['dir_chmod']) : '755';
        $file_chmod = isset($_POST['file_chmod']) ? strip_tags($_POST['file_chmod']) : '644';
        $force_unsafe = isset($_POST['force_unsafe_extract']) ? (bool)$_POST['force_unsafe_extract'] : false;
        $overwrite_mode = isset($_POST['unzip_overwrite']) ? strip_tags($_POST['unzip_overwrite']) : 'skip';
        $task_id = isset($_POST['task_id']) ? preg_replace('/[^a-zA-Z0-9_\\-]/', '', $_POST['task_id']) : 'default';

        if (empty($archive)) {
            header("Location: " . $_SERVER['PHP_SELF'] . "?error=" . urlencode(__('no_archive')));
            exit;
        }

        $safe_archive = securePath($archive);
        $safe_destination = ($destination === '') ? realpath(__DIR__) : securePath($destination, true);

        logSecurityEvent('UNZIP_INIT', "Archive: $archive, To: $destination");
        $extraction_result = $unzipper->extract($safe_archive, $safe_destination, $overwrite_mode, $task_id, $force_unsafe);

        if ($extraction_result === true) {
            $unzipper->fixPermissions($safe_destination, $dir_chmod, $file_chmod);
            logSecurityEvent('UNZIP_SUCCESS', "Archive $archive unzipped successfully");
            header("Location: " . $_SERVER['PHP_SELF'] . "?success=" . urlencode(__('unzip_success')));
        } else {
            logSecurityEvent('UNZIP_ERROR', "Error unzipping $archive: $extraction_result");
            header("Location: " . $_SERVER['PHP_SELF'] . "?error=" . urlencode(__('unzip_error') . $extraction_result));
        }
        exit;
    }

    // Zipping
    if (isset($_POST['dozip'])) {
        $zippath = !empty($_POST['zippath']) ? strip_tags($_POST['zippath']) : '.';
        $safe_zippath = securePath($zippath);
        $task_id = isset($_POST['task_id']) ? preg_replace('/[^a-zA-Z0-9_\\-]/', '', $_POST['task_id']) : 'default';
        
        $baseZipName = 'zipper-' . date("Y-m-d--H-i-s");
        if (!empty($_POST['zipsuffix'])) {
            $suffix = preg_replace('/[^a-zA-Z0-9_\\\\-]/', '', strip_tags($_POST['zipsuffix']));
            if (!empty($suffix)) {
                $baseZipName .= '--' . $suffix;
            }
        }
        $zipfile = $baseZipName . '.zip';
        $safe_out_zip = securePath($zipfile, true);
        
        logSecurityEvent('ZIP_INIT', "Folder to pack: $zippath into $zipfile");
        if (Zipper::zipDir($safe_zippath, $safe_out_zip, $task_id)) {
            logSecurityEvent('ZIP_SUCCESS', "Created zip archive $zipfile successfully");
            header("Location: " . $_SERVER['PHP_SELF'] . "?success=" . urlencode(__('zip_success') . $zipfile));
        } else {
            logSecurityEvent('ZIP_ERROR', "Failed creating zip for path: $zippath");
            header("Location: " . $_SERVER['PHP_SELF'] . "?error=" . urlencode(__('zip_error')));
        }
        exit;
    }

    // Deletion
    if (isset($_POST['dodelete'])) {
        $targetsToDelete = isset($_POST['delpaths']) ? $_POST['delpaths'] : [];
        if (empty($targetsToDelete) || !is_array($targetsToDelete)) {
            header("Location: " . $_SERVER['PHP_SELF'] . "?error=" . urlencode(__('no_delete_target')));
            exit;
        }

        $success_count = 0;
        $error_count = 0;
        $deleted_items = [];
        $failed_items = [];

        foreach ($targetsToDelete as $targetToDelete) {
            $targetToDelete = strip_tags($targetToDelete);
            if (empty($targetToDelete)) continue;

            $safe_delete_target = securePath($targetToDelete);

            if (basename($safe_delete_target) === basename(__FILE__)) {
                $failed_items[] = "$targetToDelete (" . __('delete_self_denied') . ")";
                $error_count++;
                continue;
            }

            logSecurityEvent('DELETE_INIT', "Target path: $targetToDelete");
            if (is_dir($safe_delete_target)) {
                if ($unzipper->deleteDir($safe_delete_target)) {
                    logSecurityEvent('DELETE_DIR_SUCCESS', "Deleted directory $targetToDelete");
                    $deleted_items[] = $targetToDelete;
                    $success_count++;
                } else {
                    $failed_items[] = $targetToDelete;
                    $error_count++;
                }
            } elseif (is_file($safe_delete_target)) {
                if (@unlink($safe_delete_target)) {
                    logSecurityEvent('DELETE_FILE_SUCCESS', "Deleted file $targetToDelete");
                    $deleted_items[] = $targetToDelete;
                    $success_count++;
                } else {
                    $failed_items[] = $targetToDelete;
                    $error_count++;
                }
            }
        }

        if ($error_count === 0) {
            $detail_msg = __('delete_success_detail') . ' (' . implode(', ', $deleted_items) . ')';
            header("Location: " . $_SERVER['PHP_SELF'] . "?success=" . urlencode($detail_msg));
        } else {
            $detail_msg = '';
            if (!empty($deleted_items)) {
                $detail_msg .= __('delete_success_detail') . ' (' . implode(', ', $deleted_items) . '). ';
            }
            $detail_msg .= __('delete_error_detail') . ' (' . implode(', ', $failed_items) . ')';
            header("Location: " . $_SERVER['PHP_SELF'] . "?error=" . urlencode($detail_msg));
        }
        exit;
    }

    // CHMOD Fixer
    if (isset($_POST['dochmod'])) {
        $chmodPath = isset($_POST['chmodpath']) ? strip_tags($_POST['chmodpath']) : '';
        $dir_chmod = isset($_POST['fix_dir_chmod']) ? strip_tags($_POST['fix_dir_chmod']) : '755';
        $file_chmod = isset($_POST['fix_file_chmod']) ? strip_tags($_POST['fix_file_chmod']) : '644';

        if ($chmodPath !== '') {
            $safe_chmod_path = securePath($chmodPath);
            logSecurityEvent('CHMOD_INIT', "Path: $chmodPath, Dir: $dir_chmod, File: $file_chmod");
            $unzipper->fixPermissions($safe_chmod_path, $dir_chmod, $file_chmod);
            logSecurityEvent('CHMOD_SUCCESS', "Updated permissions on $chmodPath recursively");
            header("Location: " . $_SERVER['PHP_SELF'] . "?success=" . urlencode(__('chmod_success')));
        } else {
            header("Location: " . $_SERVER['PHP_SELF'] . "?error=" . urlencode(__('chmod_error')));
        }
        exit;
    }

    // Remote Downloader
    if (isset($_POST['dodownload'])) {
        $url = isset($_POST['download_url']) ? trim($_POST['download_url']) : '';
        $dest_file = isset($_POST['download_path']) ? trim(strip_tags($_POST['download_path'])) : '';
        $task_id = isset($_POST['task_id']) ? preg_replace('/[^a-zA-Z0-9_\\-]/', '', $_POST['task_id']) : 'default';

        if (empty($url)) {
            header("Location: " . $_SERVER['PHP_SELF'] . "?error=" . urlencode('URL is empty.'));
            exit;
        }

        if (empty($dest_file)) {
            $url_path = parse_url($url, PHP_URL_PATH);
            $dest_file = $url_path ? basename($url_path) : 'downloaded_file.zip';
            $dest_file = preg_replace('/[^a-zA-Z0-9_\\-\\.]/', '', $dest_file);
            if (empty($dest_file)) {
                $dest_file = 'downloaded_file.zip';
            }
        } else {
            $path_info = pathinfo($dest_file);
            if (!isset($path_info['extension']) || empty($path_info['extension'])) {
                $url_path = parse_url($url, PHP_URL_PATH);
                $url_ext = $url_path ? pathinfo($url_path, PATHINFO_EXTENSION) : '';
                if (!empty($url_ext)) {
                    if (substr(strtolower($url_path), -7) === '.tar.gz') {
                        $dest_file .= '.tar.gz';
                    } elseif (substr(strtolower($url_path), -4) === '.tgz') {
                        $dest_file .= '.tgz';
                    } else {
                        $dest_file .= '.' . $url_ext;
                    }
                }
            }
        }

        $safe_dest_file = securePath($dest_file, true);
        
        logSecurityEvent('DOWNLOAD_INIT', "Downloading $url to $dest_file");
        $res = downloadFile($url, $safe_dest_file, $task_id);

        if ($res === true) {
            logSecurityEvent('DOWNLOAD_SUCCESS', "Successfully downloaded $url to $dest_file");
            header("Location: " . $_SERVER['PHP_SELF'] . "?success=" . urlencode(__('download_success')));
        } else {
            logSecurityEvent('DOWNLOAD_ERR', "Failed downloading $url: $res");
            header("Location: " . $_SERVER['PHP_SELF'] . "?error=" . urlencode(__('download_error') . $res));
        }
        exit;
    }

    // CMS Installer
    if (isset($_POST['doinstall'])) {
        $app_key = isset($_POST['app_key']) ? strip_tags($_POST['app_key']) : '';
        $dest_folder = isset($_POST['install_path']) ? trim(strip_tags($_POST['install_path'])) : '';
        $overwrite_mode = isset($_POST['install_overwrite']) ? strip_tags($_POST['install_overwrite']) : 'skip';
        $task_id = isset($_POST['task_id']) ? preg_replace('/[^a-zA-Z0-9_\\-]/', '', $_POST['task_id']) : 'default';

        if (!isset($installer_apps[$app_key])) {
            header("Location: " . $_SERVER['PHP_SELF'] . "?error=" . urlencode('Invalid application selection.'));
            exit;
        }

        $app = $installer_apps[$app_key];
        $local_filename = '.sessions/' . $app['filename'];
        $safe_local_path = securePath($local_filename, true);
        
        logSecurityEvent('INSTALL_DOWNLOAD_INIT', "Downloading " . $app['name'] . " from " . $app['url']);
        $download_res = downloadFile($app['url'], $safe_local_path, $task_id);
        if ($download_res !== true) {
            logSecurityEvent('INSTALL_DOWNLOAD_ERR', $download_res);
            header("Location: " . $_SERVER['PHP_SELF'] . "?error=" . urlencode(__('download_error') . $download_res));
            exit;
        }

        if ($app_key === 'adminer') {
            $dest_file = ($dest_folder === '') ? 'adminer.php' : $dest_folder . '/adminer.php';
            $safe_dest_file = securePath($dest_file, true);
            $dir_name = dirname($safe_dest_file);
            if (!is_dir($dir_name)) {
                @mkdir($dir_name, 0755, true);
            }
            @copy($safe_local_path, $safe_dest_file);
            @unlink($safe_local_path);
            @chmod($safe_dest_file, 0644);
            logSecurityEvent('INSTALL_SUCCESS', "Adminer installed to $dest_file");
            header("Location: " . $_SERVER['PHP_SELF'] . "?success=" . urlencode(__('install_success')));
            exit;
        }

        $safe_destination = ($dest_folder === '') ? realpath(__DIR__) : securePath($dest_folder, true);
        logSecurityEvent('INSTALL_EXTRACT_INIT', "Extracting " . $app['name'] . " to " . $dest_folder);
        $extract_res = $unzipper->extract($safe_local_path, $safe_destination, $overwrite_mode, $task_id, true);
        
        @unlink($safe_local_path);

        if ($extract_res === true) {
            $unzipper->fixPermissions($safe_destination, '755', '644');
            logSecurityEvent('INSTALL_SUCCESS', "Successfully installed " . $app['name'] . " to " . $dest_folder);
            header("Location: " . $_SERVER['PHP_SELF'] . "?success=" . urlencode(__('install_success')));
        } else {
            logSecurityEvent('INSTALL_EXTRACT_ERR', $extract_res);
            header("Location: " . $_SERVER['PHP_SELF'] . "?error=" . urlencode(__('install_error') . $extract_res));
        }
        exit;
    }
}

if (isset($_GET['success'])) {
    $GLOBALS['status'] = array('success' => strip_tags($_GET['success']));
} elseif (isset($_GET['error'])) {
    $GLOBALS['status'] = array('error' => strip_tags($_GET['error']));
}

class Unzipper {
    public $localdir = '.';
    public $zipfiles = array();
    public $directories = array();

    public function __construct() {
        $this->zipfiles = self::getZipFiles($this->localdir);
        $this->directories = self::getDirectories($this->localdir);
    }

    public static function getZipFiles($dir) {
        if (is_dir($dir)) {
            $dh = opendir($dir);
            $files = array();
            if ($dh) {
                while (($file = readdir($dh)) !== false) {
                    if (preg_match('/\\.zip$|\\.rar$|\\.gz$|\\.tar$|\\.tgz$|\\.7z$/i', $file) && $file != "." && $file != "..") {
                        $files[] = $file;
                    }
                }
                closedir($dh);
            }
            return $files;
        }
        return array();
    }

    public static function getDirectories($dir) {
        if (is_dir($dir)) {
            $dh = opendir($dir);
            $dirs = array();
            if ($dh) {
                while (($file = readdir($dh)) !== false) {
                    if (is_dir($dir . '/' . $file) && $file != "." && $file != ".." && $file != ".sessions") {
                        $dirs[] = $file;
                    }
                }
                closedir($dh);
            }
            sort($dirs);
            return $dirs;
        }
        return array();
    }

    public function deleteDir($dirPath) {
        if (!is_dir($dirPath)) return false;
        $objects = scandir($dirPath);
        foreach ($objects as $object) {
            if ($object != "." && $object != "..") {
                if (is_dir($dirPath . "/" . $object) && !is_link($dirPath . "/" . $object)) {
                    $this->deleteDir($dirPath . "/" . $object);
                } else {
                    @unlink($dirPath . "/" . $object);
                }
            }
        }
        return @rmdir($dirPath);
    }

    public function fixPermissions($dir, $dir_chmod, $file_chmod) {
        $d_mode = octdec(str_pad($dir_chmod, 4, '0', STR_PAD_LEFT));
        $f_mode = octdec(str_pad($file_chmod, 4, '0', STR_PAD_LEFT));
        if (!is_dir($dir)) return;

        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::SELF_FIRST
        );
        foreach ($iterator as $item) {
            if ($item->isDir()) {
                @chmod($item->getPathname(), $d_mode);
            } else {
                @chmod($item->getPathname(), $f_mode);
            }
        }
        @chmod($dir, $d_mode);
    }

    public function extract($archive, $destination, $overwrite_mode = 'skip', $task_id = 'default', $force_unsafe = false) {
        $ext = strtolower(pathinfo($archive, PATHINFO_EXTENSION));
        if (substr(strtolower($archive), -7) === '.tar.gz' || substr(strtolower($archive), -4) === '.tgz') {
            $ext = 'tar.gz';
        }

        switch ($ext) {
            case 'zip':
                return $this->extractZipArchive($archive, $destination, $overwrite_mode, $task_id, $force_unsafe);
            case 'rar':
                return $this->extractRarArchive($archive, $destination, $overwrite_mode, $task_id);
            case 'tar':
            case 'tar.gz':
                return $this->extractTarArchive($archive, $destination, $overwrite_mode, $task_id);
            case '7z':
                return $this->extract7zArchive($archive, $destination, $overwrite_mode, $task_id);
            default:
                return __('only_zip_supported');
        }
    }

    private function extractZipArchive($archive, $destination, $overwrite_mode = 'skip', $task_id = 'default', $force_unsafe = false) {
        $zip = new ZipArchive;
        if ($zip->open($archive) !== TRUE) {
            return __('zip_err_open');
        }

        $base_jail = rtrim(realpath(__DIR__), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        $dest_clean = rtrim($destination, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        $total = $zip->numFiles;

        for ($i = 0; $i < $total; $i++) {
            $filename = $zip->getNameIndex($i);
            $target_file = $dest_clean . str_replace(array('\\\\', '../'), array('/', ''), $filename);
            
            if (strpos($target_file, $base_jail) !== 0) {
                $zip->close();
                return __('zip_err_traversal');
            }

            ${enableSafeExtraction ? `
            // SAFE EXTRACTION CHECKS
            if (!$force_unsafe) {
                $baseNameLower = strtolower(basename($target_file));
                $ext = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));
                if ($baseNameLower === '.htaccess' || $baseNameLower === '.env' || $ext === 'php' || $ext === 'php5' || $ext === 'phtml') {
                    $zip->close();
                    return __('safe_extract_err') . " ($filename)";
                }
            }
            ` : ''}
        }

        for ($i = 0; $i < $total; $i++) {
            $filename = $zip->getNameIndex($i);
            if (substr($filename, -1) == '/') {
                $dir_path = $dest_clean . str_replace(array('\\\\', '../'), array('/', ''), $filename);
                if (!is_dir($dir_path)) {
                    @mkdir($dir_path, 0755, true);
                }
            } else {
                $file_path = $dest_clean . str_replace(array('\\\\', '../'), array('/', ''), $filename);
                
                if (is_file($file_path)) {
                    if ($overwrite_mode === 'skip') {
                        if ($i % 10 == 0 || $i === $total - 1) {
                            writeProgress($i + 1, $total, 'extracting', $task_id);
                        }
                        continue;
                    } elseif ($overwrite_mode === 'older') {
                        $stat = $zip->statIndex($i);
                        if (isset($stat['mtime']) && $stat['mtime'] <= filemtime($file_path)) {
                            if ($i % 10 == 0 || $i === $total - 1) {
                                writeProgress($i + 1, $total, 'extracting', $task_id);
                            }
                            continue;
                        }
                    }
                }

                $dir_name = dirname($file_path);
                if (!is_dir($dir_name)) {
                    @mkdir($dir_name, 0755, true);
                }
                
                $fp_out = @fopen($file_path, 'wb');
                $fp_in = $zip->getStream($filename);
                if ($fp_out && $fp_in) {
                    while (!feof($fp_in)) {
                        fwrite($fp_out, fread($fp_in, 8192));
                    }
                    fclose($fp_out);
                    fclose($fp_in);
                }
            }
            if ($i % 10 == 0 || $i === $total - 1) {
                writeProgress($i + 1, $total, 'extracting', $task_id);
            }
        }

        $zip->close();
        clearProgress($task_id);
        return true;
    }

    private function extractRarArchive($archive, $destination, $overwrite_mode = 'skip', $task_id = 'default') {
        if (!class_exists('RarArchive')) {
            return 'RarArchive extension is not loaded in PHP.';
        }
        $rar = RarArchive::open($archive);
        if ($rar === false) {
            return __('zip_err_open');
        }
        $entries = $rar->getEntries();
        if ($entries === false) {
            $rar->close();
            return 'Failed to read RAR entries.';
        }
        
        $base_jail = rtrim(realpath(__DIR__), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        $dest_clean = rtrim($destination, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        $total = count($entries);
        
        foreach ($entries as $entry) {
            $filename = $entry->getName();
            $target_file = $dest_clean . str_replace(array('\\\\', '../'), array('/', ''), $filename);
            if (strpos($target_file, $base_jail) !== 0) {
                $rar->close();
                return __('zip_err_traversal');
            }
        }
        
        $i = 0;
        foreach ($entries as $entry) {
            $filename = $entry->getName();
            $target_file = $dest_clean . str_replace(array('\\\\', '../'), array('/', ''), $filename);
            
            if ($entry->isDirectory()) {
                if (!is_dir($target_file)) {
                    @mkdir($target_file, 0755, true);
                }
            } else {
                if (is_file($target_file)) {
                    if ($overwrite_mode === 'skip') {
                        $i++;
                        if ($i % 10 == 0 || $i === $total) {
                            writeProgress($i, $total, 'extracting', $task_id);
                        }
                        continue;
                    } elseif ($overwrite_mode === 'older') {
                        $mtime = strtotime($entry->getFileTime());
                        if ($mtime !== false && $mtime <= filemtime($target_file)) {
                            $i++;
                            if ($i % 10 == 0 || $i === $total) {
                                writeProgress($i, $total, 'extracting', $task_id);
                            }
                            continue;
                        }
                    }
                }
                
                $dir_name = dirname($target_file);
                if (!is_dir($dir_name)) {
                    @mkdir($dir_name, 0755, true);
                }
                
                $entry->extract(dirname($target_file), basename($target_file));
            }
            
            $i++;
            if ($i % 10 == 0 || $i === $total) {
                writeProgress($i, $total, 'extracting', $task_id);
            }
        }
        $rar->close();
        clearProgress($task_id);
        return true;
    }

    private function extractTarArchive($archive, $destination, $overwrite_mode = 'skip', $task_id = 'default') {
        if (!class_exists('PharData')) {
            return 'PharData (Phar extension) is not enabled in PHP.';
        }
        try {
            $phar = new PharData($archive);
            $base_jail = rtrim(realpath(__DIR__), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
            $dest_clean = rtrim($destination, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
            
            $total = 0;
            $files_to_extract = [];
            foreach (new RecursiveIteratorIterator($phar) as $file) {
                $filename = $file->getPathname();
                $relative_path = str_replace('phar://' . str_replace('\\\\', '/', $archive) . '/', '', str_replace('\\\\', '/', $filename));
                $target_file = $dest_clean . str_replace(array('\\\\', '../'), array('/', ''), $relative_path);
                
                if (strpos($target_file, $base_jail) !== 0) {
                    return __('zip_err_traversal');
                }
                $files_to_extract[] = [
                    'relative' => $relative_path,
                    'target' => $target_file,
                    'mtime' => $file->getMTime()
                ];
                $total++;
            }
            
            $i = 0;
            foreach ($files_to_extract as $f) {
                $target_file = $f['target'];
                if (is_file($target_file)) {
                    if ($overwrite_mode === 'skip') {
                        $i++;
                        if ($i % 10 == 0 || $i === $total) {
                            writeProgress($i, $total, 'extracting', $task_id);
                        }
                        continue;
                    } elseif ($overwrite_mode === 'older') {
                        if ($f['mtime'] <= filemtime($target_file)) {
                            $i++;
                            if ($i % 10 == 0 || $i === $total) {
                                writeProgress($i, $total, 'extracting', $task_id);
                            }
                            continue;
                        }
                    }
                }
                
                $dir_name = dirname($target_file);
                if (!is_dir($dir_name)) {
                    @mkdir($dir_name, 0755, true);
                }
                
                @copy('phar://' . $archive . '/' . $f['relative'], $target_file);
                
                $i++;
                if ($i % 10 == 0 || $i === $total) {
                    writeProgress($i, $total, 'extracting', $task_id);
                }
            }
            clearProgress($task_id);
            return true;
        } catch (Exception $e) {
            return $e->getMessage();
        }
    }

    private function extract7zArchive($archive, $destination, $overwrite_mode = 'skip', $task_id = 'default') {
        $disabled = explode(',', ini_get('disable_functions'));
        $disabled = array_map('trim', $disabled);
        if (in_array('shell_exec', $disabled) || in_array('exec', $disabled)) {
            return '7z extraction requires command-line utilities but shell_exec/exec functions are disabled on this server.';
        }
        
        $check_7z = shell_exec('7z --help 2>&1');
        if (strpos($check_7z, '7-Zip') === false) {
            $check_7z = shell_exec('7za --help 2>&1');
            if (strpos($check_7z, '7-Zip') === false) {
                return '7-Zip utility (7z or 7za) was not found on this server.';
            }
            $cmd_name = '7za';
        } else {
            $cmd_name = '7z';
        }
        
        $base_jail = rtrim(realpath(__DIR__), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        $dest_clean = rtrim($destination, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        
        $list_out = shell_exec($cmd_name . ' l ' . escapeshellarg($archive) . ' 2>&1');
        $lines = explode("\n", $list_out);
        $files_to_extract = [];
        $parsing = false;
        foreach ($lines as $line) {
            if (preg_match('/^-+/', $line)) {
                $parsing = !$parsing;
                continue;
            }
            if ($parsing) {
                if (preg_match('/^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+([D\.]{5})\s+(\d+)\s+(\d+)?\s+(.+)$/', trim($line), $m)) {
                    $mtime = strtotime($m[1]);
                    $is_dir = strpos($m[2], 'D') !== false;
                    $filename = trim($m[5]);
                    
                    $target_file = $dest_clean . str_replace(array('\\\\', '../'), array('/', ''), $filename);
                    if (strpos($target_file, $base_jail) !== 0) {
                        return __('zip_err_traversal');
                    }
                    
                    if (!$is_dir) {
                        $files_to_extract[] = [
                            'name' => $filename,
                            'target' => $target_file,
                            'mtime' => $mtime
                        ];
                    }
                }
            }
        }
        
        $total = count($files_to_extract);
        writeProgress(0, $total, 'extracting', $task_id);
        
        $i = 0;
        foreach ($files_to_extract as $f) {
            $target_file = $f['target'];
            if (is_file($target_file)) {
                if ($overwrite_mode === 'skip') {
                    $i++;
                    if ($i % 5 == 0 || $i === $total) {
                        writeProgress($i, $total, 'extracting', $task_id);
                    }
                    continue;
                } elseif ($overwrite_mode === 'older') {
                    if ($f['mtime'] <= filemtime($target_file)) {
                        $i++;
                        if ($i % 5 == 0 || $i === $total) {
                            writeProgress($i, $total, 'extracting', $task_id);
                        }
                        continue;
                    }
                }
            }
            
            $cmd = $cmd_name . ' x -y -o' . escapeshellarg(dirname($target_file)) . ' ' . escapeshellarg($archive) . ' ' . escapeshellarg($f['name']) . ' 2>&1';
            shell_exec($cmd);
            
            $i++;
            if ($i % 5 == 0 || $i === $total) {
                writeProgress($i, $total, 'extracting', $task_id);
            }
        }
        
        clearProgress($task_id);
        return true;
    }
}

class Zipper {
    public static $total_files = 0;
    public static $added_files = 0;
    public static $task_id = 'default';

    public static function zipDir($sourcePath, $outZipPath, $task_id = 'default') {
        if (!extension_loaded('zip')) return false;
        self::$task_id = $task_id;
        self::$total_files = countFilesRecursive($sourcePath);
        self::$added_files = 0;

        $z = new ZipArchive();
        if ($z->open($outZipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) return false;

        $realSourcePath = realpath($sourcePath);
        if ($sourcePath === '.' || $realSourcePath === realpath(__DIR__)) {
            self::dirToZip($realSourcePath, $z, strlen($realSourcePath) + 1, '');
        } else {
            $parentPath = dirname($realSourcePath);
            $cutLength = strlen($parentPath) + 1;
            if (is_file($realSourcePath)) {
                $z->addFile($realSourcePath, basename($realSourcePath));
                self::$added_files++;
                writeProgress(self::$added_files, self::$total_files, 'compressing', self::$task_id);
            } elseif (is_dir($realSourcePath)) {
                $baseDirName = basename($realSourcePath);
                $z->addEmptyDir($baseDirName);
                self::dirToZip($realSourcePath, $z, $cutLength, $baseDirName);
            }
        }
        $res = $z->close();
        clearProgress(self::$task_id);
        return $res;
    }

    private static function dirToZip($folder, &$zipFile, $cutLength, $archiveRoot = '') {
        $handle = opendir($folder);
        if (!$handle) return;
        $script_name = basename(__FILE__);

        while (false !== $f = readdir($handle)) {
            if ($f === '.' || $f === '..') continue;
            $filePath = $folder . '/' . $f;
            $realFilePath = realpath($filePath);

            if (basename($realFilePath) === $script_name || preg_match('/^zipper-.*\\.zip$/', basename($realFilePath))) {
                continue;
            }

            $localPath = substr($realFilePath, $cutLength);
            if (!empty($archiveRoot)) {
                $localPath = $archiveRoot . '/' . ltrim($localPath, '/');
            }
            $localPath = str_replace('\\\\', '/', $localPath);

            if (is_file($realFilePath)) {
                $zipFile->addFile($realFilePath, $localPath);
                self::$added_files++;
                if (self::$added_files % 10 == 0 || self::$added_files === self::$total_files) {
                    writeProgress(self::$added_files, self::$total_files, 'compressing', self::$task_id);
                }
            } elseif (is_dir($realFilePath)) {
                $zipFile->addEmptyDir($localPath);
                self::dirToZip($realFilePath, $zipFile, $cutLength, $archiveRoot);
            }
        }
        closedir($handle);
    }
}

$timeend = microtime(TRUE);
$time = round($timeend - $timestart, 4);
?>
<!DOCTYPE html>
<html lang="<?php echo $lang; ?>">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MegaUnzipper — Secure Pro Edition</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/repalash/gilroy-free-webfont@fonts/Gilroy-Light.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/repalash/gilroy-free-webfont@fonts/Gilroy-Extrabold.css">
  <style>
    :root {
      --font-light: 'Gilroy-Light', -apple-system, sans-serif;
      --font-bold: 'Gilroy-ExtraBold', -apple-system, sans-serif;
      --glass-bg: rgba(18, 16, 32, 0.65);
      --glass-bg-hover: rgba(28, 24, 48, 0.8);
      --glass-bg-active: rgba(14, 11, 26, 0.9);
      --glass-border: rgba(255, 255, 255, 0.08);
      --glass-border-glow: rgba(99, 102, 241, 0.4);
      --text-main: #F1EFF7;
      --text-muted: #9C98B3;
      --grad-cyan: #38bdf8;
      --grad-blue: #6366f1;
      --grad-purple: #8b5cf6;
      --grad-pink: #ec4899;
    }
    body { font-family: var(--font-light); font-size: 14px; color: var(--text-main); background: linear-gradient(135deg, #040209 0%, #0d061f 40%, #071026 80%, #02141f 100%); background-attachment: fixed; margin: 0; padding: 40px 20px 100px 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; box-sizing: border-box; }
    .container { width: 100%; max-width: 1100px; }
    .app-header { margin-bottom: 40px; text-align: center; position: relative; }
    .app-header h1 { font-family: var(--font-bold); font-size: 46px; margin: 0 0 6px 0; letter-spacing: -1px; background: linear-gradient(90deg, var(--grad-cyan), var(--grad-blue), var(--grad-pink)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 4px 12px rgba(99, 102, 241, 0.3)); }
    .app-header p { color: var(--text-muted); margin: 0 auto; font-size: 15px; letter-spacing: 0.5px; }
    .auth-wrapper { max-width: 420px; width: 100%; margin: 0 auto; background: var(--glass-bg); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); border: 1px solid var(--glass-border); border-radius: 24px; padding: 40px; box-shadow: 0 30px 60px rgba(0,0,0,0.4); box-sizing: border-box; }
    .status-panel { padding: 20px; background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); border: 1px solid var(--glass-border); border-radius: 16px; margin-bottom: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
    .status-title { font-family: var(--font-bold); font-size: 16px; margin-bottom: 4px; }
    .status--success { color: var(--grad-cyan); text-shadow: 0 0 10px rgba(56,189,248,0.3); }
    .status--error { color: #FF453A; text-shadow: 0 0 10px rgba(255,69,58,0.3); }
    .status-time { font-size: 11px; color: var(--text-muted); margin-top: 6px; }
    .svg-defs { position: absolute; width: 0; height: 0; }
    .grid-flex-container { display: flex; flex-wrap: wrap; gap: 24px; transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1); }
    .app-card { flex: 1 1 calc(50% - 12px); min-width: 300px; background: var(--glass-bg); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: 20px; overflow: hidden; box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2); transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1); cursor: pointer; position: relative; }
    .app-card:hover { background: var(--glass-bg-hover); border-color: rgba(255, 255, 255, 0.15); transform: translateY(-4px); }
    .card-trigger-header { padding: 30px; display: flex; align-items: center; gap: 20px; user-select: none; }
    .card-icon-frame { width: 60px; height: 60px; border-radius: 14px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: center; align-items: center; transition: all 0.3s ease; }
    .card-icon-frame svg { width: 32px; height: 32px; }
    .card-meta-title h2 { font-family: var(--font-bold); font-size: 20px; margin: 0 0 4px 0; color: #FFF; letter-spacing: -0.3px; }
    .card-meta-title p { margin: 0; color: var(--text-muted); font-size: 12px; }
    .card-runtime-content { max-height: 0; opacity: 0; visibility: hidden; overflow: hidden; transition: max-height 0.1s ease-out, opacity 0.1s ease-out; }
    .inner-card-body { padding: 0 30px 35px 30px; }
    .app-card.active-expanded { flex: 1 1 100%; background: var(--glass-bg-active); border-color: var(--glass-border-glow); box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), 0 0 30px rgba(99, 102, 241, 0.15); cursor: default; }
    .app-card.active-expanded .card-icon-frame { background: rgba(99, 102, 241, 0.15); border-color: rgba(99, 102, 241, 0.4); box-shadow: 0 0 15px rgba(99, 102, 241, 0.2); }
    .app-card.active-expanded .card-runtime-content { max-height: 2500px; opacity: 1; visibility: visible; transition: max-height 0.6s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease-in; }
    .grid-flex-container.has-active .app-card:not(.active-expanded) { flex: 1 1 calc(25% - 20px); opacity: 0.5; }
    @media(max-width: 900px) { .grid-flex-container.has-active .app-card:not(.active-expanded) { flex: 1 1 calc(50% - 12px); } }
    label { display: block; font-family: var(--font-bold); font-size: 13px; margin-bottom: 8px; color: #FFF; letter-spacing: 0.3px; }
    .form-group { margin-bottom: 24px; }
    .form-field { width: 100%; box-sizing: border-box; padding: 14px 18px; background: rgba(0, 0, 0, 0.25); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; color: #FFF; font-family: var(--font-light); font-size: 14px; outline: none; transition: all 0.2s ease; }
    .form-field:focus { border-color: var(--grad-blue); box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15); background: rgba(0, 0, 0, 0.4); }
    .select { width: 100%; box-sizing: border-box; padding: 14px 45px 14px 18px; background: rgba(0, 0, 0, 0.25); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; color: #FFF; font-family: var(--font-light); font-size: 14px; outline: none; transition: all 0.2s ease; cursor: pointer; appearance: none; -webkit-appearance: none; -moz-appearance: none; background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239C98B3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>"); background-repeat: no-repeat; background-position: right 18px center; background-size: 16px; }
    .select:focus { border-color: var(--grad-blue); box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15); background-color: rgba(14, 11, 26, 0.95); }
    .select option { background-color: #120E22; color: #F1EFF7; padding: 12px; font-family: var(--font-light); }
    .select optgroup { background-color: #0A0714; color: var(--grad-cyan); font-family: var(--font-bold); font-style: normal; padding: 8px 0; }
    .select optgroup option { color: #F1EFF7; font-family: var(--font-light); padding-left: 15px; }
    .form-field.chmod-text-field { width: 80px; text-align: center; font-family: monospace; font-size: 16px; font-weight: bold; letter-spacing: 1px; padding: 12px; cursor: pointer; }
    .form-field.chmod-text-field.focused-context { border-color: var(--grad-cyan); box-shadow: 0 0 12px rgba(56, 189, 248, 0.25); background: rgba(56, 189, 248, 0.05); }
    .info { font-size: 12px; color: var(--text-muted); margin: 8px 0 0 0; line-height: 1.5; }
    .submit { padding: 14px 28px; background: linear-gradient(90deg, #6366f1, #38bdf8); color: #030C1B; border: none; border-radius: 10px; font-family: var(--font-bold); cursor: pointer; font-size: 14px; transition: all 0.3s ease; box-shadow: 0 8px 20px rgba(56, 189, 248, 0.2); }
    .submit:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(56, 189, 248, 0.35); }
    .submit-delete { background: linear-gradient(90deg, #FF453A, #FF9500); color: #FFF; box-shadow: 0 8px 20px rgba(255, 69, 58, 0.2); }
    .submit-delete:hover { box-shadow: 0 12px 25px rgba(255, 69, 58, 0.35); }
    .submit-chmod { background: linear-gradient(90deg, #8b5cf6, #ec4899); color: #FFF; box-shadow: 0 8px 20px rgba(236, 72, 153, 0.2); }
    .submit-chmod:hover { box-shadow: 0 12px 25px rgba(236, 72, 153, 0.35); }
    .chmod-panel { background: rgba(0, 0, 0, 0.15); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; padding: 20px; margin-top: 20px; }
    .chmod-inputs-row { display: flex; gap: 24px; margin-bottom: 20px; background: rgba(255,255,255,0.02); padding: 16px; border-radius: 10px; border: 1px dashed rgba(255, 255, 255, 0.1); }
    .chmod-input-container { display: flex; align-items: center; gap: 12px; }
    .chmod-input-container label { margin-bottom: 0; color: var(--text-muted); }
    .chmod-input-container label.active-label { color: #FFF; }
    .chmod-table { width: 100%; border-collapse: collapse; }
    .chmod-table th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); padding: 8px 6px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
    .chmod-table td { padding: 10px 6px; }
    .chmod-table td:first-child { font-family: var(--font-bold); color: #FFF; width: 110px; }
    .checkbox-label { display: inline-flex; align-items: center; cursor: pointer; user-select: none; }
    .checkbox-label input { position: absolute; opacity: 0; width: 0; height: 0; }
    .checkmark { height: 20px; width: 20px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 6px; position: relative; transition: all 0.2s ease; }
    .checkbox-label:hover input ~ .checkmark { border-color: rgba(255,255,255,0.4); }
    .checkbox-label input:checked ~ .checkmark { background: linear-gradient(135deg, var(--grad-blue), var(--grad-cyan)); border-color: transparent; box-shadow: 0 0 10px rgba(56, 189, 248, 0.4); }
    .checkbox-label input:checked ~ .checkmark:after { content: ""; position: absolute; display: block; left: 7px; top: 3px; width: 4px; height: 9px; border: solid #030C1B; border-width: 0 2px 2px 0; transform: rotate(45deg); }
    
    /* Embed Server Parameters Table styles */
    .server-table { width:100%; border-collapse: collapse; margin-top: 15px; }
    .server-table th { text-align:left; color: var(--text-muted); padding:10px; border-bottom: 1px solid var(--glass-border); text-transform:uppercase; font-size:11px; }
    .server-table td { padding:12px 10px; border-bottom:1px solid rgba(255,255,255,0.04); font-family: monospace; font-size:13px; }
    .server-status { padding:2px 8px; border-radius:4px; font-size:11px; font-weight:bold; }
    .server-status-ok { background:rgba(48,209,88,0.15); color:#30d158; }
    .server-status-warn { background:rgba(255,149,0,0.15); color:#ff9500; }
    
    footer { position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(13, 10, 24, 0.75); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-top: 1px solid var(--glass-border); padding: 16px 20px; text-align: center; box-sizing: border-box; z-index: 9999; box-shadow: 0 -10px 30px rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; gap: 20px; }
    .footer-content { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); }
    .footer-content a { color: var(--grad-cyan); text-decoration: none; font-family: var(--font-bold); transition: color 0.2s ease; }
    .footer-content a:hover { color: var(--grad-blue); }
    .logout-btn { background: rgba(255, 69, 58, 0.15); border: 1px solid rgba(255, 69, 58, 0.3); color: #FF453A; padding: 4px 10px; border-radius: 6px; font-size: 10px; text-transform: uppercase; font-family: var(--font-bold); text-decoration: none; transition: all 0.2s ease; }
    .logout-btn:hover { background: #FF453A; color: #FFF; box-shadow: 0 0 10px rgba(255,69,58,0.4); }
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(6, 4, 10, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 100000;
    }
    .custom-modal-content {
      animation: modalFadeIn 0.3s cubic-bezier(0.25, 1, 0.5, 1);
    }
    @keyframes modalFadeIn {
      from { opacity: 0; transform: scale(0.95) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .scrollable-checkbox-list::-webkit-scrollbar {
      width: 6px;
    }
    .scrollable-checkbox-list::-webkit-scrollbar-track {
      background: rgba(0,0,0,0.1);
      border-radius: 3px;
    }
    .scrollable-checkbox-list::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.1);
      border-radius: 3px;
    }
    .scrollable-checkbox-list::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.2);
    }
    .btn-cancel {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #fff;
      padding: 10px 20px;
      border-radius: 12px;
      font-size: 14px;
      cursor: pointer;
      font-family: var(--font-bold);
      transition: all 0.2s ease;
    }
    .btn-cancel:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }
  </style>
</head>
<body>


<svg class="svg-defs">
  <defs>
    <linearGradient id="gradUnzip" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#38bdf8" /><stop offset="100%" stop-color="#6366f1" /></linearGradient>
    <linearGradient id="gradFixer" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#8b5cf6" /><stop offset="100%" stop-color="#ec4899" /></linearGradient>
    <linearGradient id="gradDelete" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF453A" /><stop offset="100%" stop-color="#FF9500" /></linearGradient>
    <linearGradient id="gradZip" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#34d399" /><stop offset="100%" stop-color="#38bdf8" /></gradient>
  </defs>
</svg>

<?php if (!isset($_SESSION['mega_auth']) || $_SESSION['mega_auth'] !== true): ?>
  <div class="auth-wrapper">
    <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="font-family: var(--font-bold); font-size: 28px; margin: 0; background: linear-gradient(90deg, var(--grad-cyan), var(--grad-blue)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;"><?php echo __('login_title'); ?></h2>
        <p style="color: var(--text-muted); font-size: 13px; margin: 5px 0 0 0;"><?php echo __('login_subtitle'); ?></p>
    </div>
    <?php if (isset($auth_error)): ?>
        <div style="color: #FF453A; font-size: 13px; text-align: center; margin-bottom: 20px; font-family: var(--font-bold);"><?php echo $auth_error; ?></div>
    <?php endif; ?>
    <form action="" method="POST">
        <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($_SESSION['csrf_token'], ENT_QUOTES, 'UTF-8'); ?>">
        <div class="form-group">
            <label for="auth_user"><?php echo __('user'); ?></label>
            <input type="text" id="auth_user" name="auth_user" class="form-field" placeholder="Admin" required autocomplete="off" />
        </div>
        <div class="form-group">
            <label for="auth_pass"><?php echo __('pass'); ?></label>
            <input type="password" id="auth_pass" name="auth_pass" class="form-field" placeholder="••••••••" required />
        </div>
        <button type="submit" name="auth_login" class="submit" style="width: 100%; margin-top: 10px;"><?php echo __('btn_login'); ?></button>
    </form>
  </div>
<?php else: ?>
  <div class="container">
    <div class="app-header">
      <h1>MegaUnzipper <span style="font-size:20px; color:var(--grad-cyan); font-family:var(--font-light);">Pro</span></h1>
      <p><?php echo __('app_desc'); ?></p>
      
      <?php if ($max_lifetime_seconds > 0): ?>
      <div style="margin-top: 18px; display: inline-block; padding: 6px 16px; background: rgba(255, 69, 58, 0.08); border: 1px solid rgba(255, 69, 58, 0.18); border-radius: 20px; font-size: 12px; letter-spacing: 0.5px;">
        <?php echo __('timer_text'); ?><span id="countdown-timer" style="font-family: monospace; font-weight: bold; color: #FF453A;">--:--:--</span>
      </div>
      <?php endif; ?>
    </div>

    <?php if (!empty($GLOBALS['status'])): ?>
      <?php 
        $statusType = key($GLOBALS['status']);
        $message = reset($GLOBALS['status']);
        $action_type = isset($_GET['action_type']) ? $_GET['action_type'] : '';
        $details = isset($_GET['details']) ? htmlspecialchars($_GET['details'], ENT_QUOTES, 'UTF-8') : '';
      ?>
      <div id="resultModal" class="modal-overlay" style="display: flex;">
        <div class="custom-modal-content" style="max-width: 480px; width: 90%; background: var(--glass-bg-active); border: 1px solid <?php echo $statusType === 'success' ? 'rgba(0, 242, 254, 0.4)' : 'rgba(255, 69, 58, 0.4)'; ?>; border-radius: 24px; padding: 35px; text-align: center; box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), 0 0 30px <?php echo $statusType === 'success' ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 69, 58, 0.15)'; ?>; position: relative; backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px);">
          <button type="button" class="modal-close-x" onclick="closeResultModal()" style="position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 24px; color: var(--text-muted); cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='var(--text-muted)'">&times;</button>
          
          <div style="width: 80px; height: 80px; border-radius: 20px; background: <?php echo $statusType === 'success' ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255, 69, 58, 0.1)'; ?>; border: 1px solid <?php echo $statusType === 'success' ? 'rgba(0, 242, 254, 0.3)' : 'rgba(255, 69, 58, 0.3)'; ?>; display: flex; justify-content: center; align-items: center; margin: 0 auto 25px auto;">
            <?php if ($statusType === 'success'): ?>
              <svg viewBox="0 0 24 24" fill="none" stroke="#00f2fe" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 40px; height: 40px;">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            <?php else: ?>
              <svg viewBox="0 0 24 24" fill="none" stroke="#ff453a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 40px; height: 40px;">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            <?php endif; ?>
          </div>
          
          <h2 style="font-family: var(--font-bold); font-size: 22px; color: #FFF; margin: 0 0 8px 0; letter-spacing: -0.5px;">
            <?php echo $statusType === 'success' ? __('op_success') : __('op_error'); ?>
          </h2>
          
          <p style="color: #fff; font-size: 15px; margin: 0 0 15px 0; line-height: 1.5; font-family: var(--font-medium);">
            <?php echo $message; ?>
          </p>

          <?php if (!empty($details)): ?>
            <div style="background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 15px; margin-bottom: 25px; text-align: left; font-size: 13px; font-family: monospace; color: #a9a6c3; line-height: 1.6; word-break: break-all;">
              <div style="font-weight: bold; color: #fff; margin-bottom: 6px; font-family: var(--font-bold);"><?php echo __('operation_details'); ?></div>
              <?php echo nl2br($details); ?>
            </div>
          <?php endif; ?>

          <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 25px;">
            <?php echo __('exec_time'); ?><?php echo $time; ?> s.
          </div>
          
          <button type="button" class="submit" onclick="closeResultModal()" style="width: 100%; border-radius: 14px; background: <?php echo $statusType === 'success' ? 'linear-gradient(90deg, #00f2fe, #4facfe)' : 'linear-gradient(90deg, #ff453a, #ff9f0a)'; ?>;"><?php echo __('btn_close'); ?></button>
        </div>
      </div>
      <script>
        function closeResultModal() {
          const modal = document.getElementById('resultModal');
          if (modal) {
            modal.style.display = 'none';
            // Clean URL from GET params
            const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({path: cleanUrl}, '', cleanUrl);
          }
        }
      </script>
    <?php endif; ?>

    <form action="" method="POST" id="mainToolsForm">
      <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($_SESSION['csrf_token'], ENT_QUOTES, 'UTF-8'); ?>">
      <div class="grid-flex-container" id="gridFlexModule">

        <div class="app-card active-expanded" data-card-id="unzip">
          <div class="card-trigger-header">
            <div class="card-icon-frame">
              <svg viewBox="0 0 24 24" fill="none" stroke="url(#gradUnzip)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5" rx="1"></rect><line x1="10" y1="12" x2="14" y2="12"></line>
              </svg>
            </div>
            <div class="card-meta-title">
              <h2><?php echo __('card_unzip_title'); ?></h2>
              <p><?php echo __('card_unzip_desc'); ?></p>
            </div>
          </div>
          <div class="card-runtime-content">
            <div class="inner-card-body">
              <div class="form-group">
                <label for="zipfile"><?php echo __('select_archive'); ?></label>
                <select name="zipfile" class="select">
                  <?php if (empty($unzipper->zipfiles)): ?>
                    <option value=""><?php echo __('no_archives'); ?></option>
                  <?php else: ?>
                    <?php foreach ($unzipper->zipfiles as $zip): ?>
                      <option value="<?php echo htmlspecialchars($zip, ENT_QUOTES, 'UTF-8'); ?>"><?php echo htmlspecialchars($zip, ENT_QUOTES, 'UTF-8'); ?></option>
                    <?php endforeach; ?>
                  <?php endif; ?>
                </select>
              </div>

              <div class="form-group">
                <label for="extpath"><?php echo __('dest_folder'); ?></label>
                <input type="text" name="extpath" class="form-field" placeholder="<?php echo htmlspecialchars(__('placeholder_dest_folder'), ENT_QUOTES, 'UTF-8'); ?>" />
                <p class="info"><?php echo __('dest_folder_info'); ?></p>
              </div>

              <div class="form-group">
                <label for="unzip_overwrite"><?php echo __('overwrite_mode'); ?></label>
                <select name="unzip_overwrite" id="unzip_overwrite" class="select">
                  <option value="skip"><?php echo __('overwrite_skip'); ?></option>
                  <option value="overwrite"><?php echo __('overwrite_all'); ?></option>
                  <option value="older"><?php echo __('overwrite_older'); ?></option>
                </select>
              </div>

              ${enableSafeExtraction ? `
              <div class="form-group" style="background:rgba(255,149,0,0.04); border:1px solid rgba(255,149,0,0.15); padding:15px; border-radius:10px;">
                <label class="checkbox-label" style="margin-bottom:0; font-family:var(--font-light); color:#ff9500; font-size:13px; font-weight:bold;">
                  <input type="checkbox" name="force_unsafe_extract" value="1">
                  <span class="checkmark" style="margin-right:10px;"></span>
                  <?php echo __('force_unsafe'); ?>
                </label>
                <p class="info" style="color:var(--text-muted); margin-top:5px; margin-left:30px;"><?php echo __('safe_extraction_info'); ?></p>
              </div>
              ` : ''}

              <div class="chmod-panel" data-matrix-group="unzipper">
                <p class="info" style="margin-bottom: 14px; color: var(--grad-cyan);"><?php echo __('chmod_after_unzip'); ?></p>
                <div class="chmod-inputs-row">
                  <div class="chmod-input-container">
                    <label id="lbl_dir_chmod" for="dir_chmod" class="active-label"><?php echo __('folders'); ?></label>
                    <input type="text" id="dir_chmod" name="dir_chmod" class="form-field chmod-text-field focused-context" value="755" maxlength="3" readonly />
                  </div>
                  <div class="chmod-input-container">
                    <label id="lbl_file_chmod" for="file_chmod"><?php echo __('files'); ?></label>
                    <input type="text" id="file_chmod" name="file_chmod" class="form-field chmod-text-field" value="644" maxlength="3" readonly />
                  </div>
                </div>
                <table class="chmod-table">
                  <thead><tr><th><?php echo __('scope'); ?></th><th>Read (4)</th><th>Write (2)</th><th>Execute (1)</th></tr></thead>
                  <tbody>
                    <tr><td><?php echo __('owner'); ?></td><td><label class="checkbox-label"><input type="checkbox" data-role="ur" data-val="400"><span class="checkmark"></span></label></td><td><label class="checkbox-label"><input type="checkbox" data-role="uw" data-val="200"><span class="checkmark"></span></label></td><td><label class="checkbox-label"><input type="checkbox" data-role="ux" data-val="100"><span class="checkmark"></span></label></td></tr>
                    <tr><td><?php echo __('group'); ?></td><td><label class="checkbox-label"><input type="checkbox" data-role="gr" data-val="40"><span class="checkmark"></span></label></td><td><label class="checkbox-label"><input type="checkbox" data-role="gw" data-val="20"><span class="checkmark"></span></label></td><td><label class="checkbox-label"><input type="checkbox" data-role="gx" data-val="10"><span class="checkmark"></span></label></td></tr>
                    <tr><td><?php echo __('others'); ?></td><td><label class="checkbox-label"><input type="checkbox" data-role="or" data-val="4"><span class="checkmark"></span></label></td><td><label class="checkbox-label"><input type="checkbox" data-role="ow" data-val="2"><span class="checkmark"></span></label></td><td><label class="checkbox-label"><input type="checkbox" data-role="ox" data-val="1"><span class="checkmark"></span></label></td></tr>
                  </tbody>
                </table>
              </div>

              <div style="margin-top: 25px;">
                <input type="submit" name="dounzip" class="submit" value="<?php echo __('btn_unzip'); ?>" />
              </div>
            </div>
          </div>
        </div>

        <div class="app-card" data-card-id="fixer">
          <div class="card-trigger-header">
            <div class="card-icon-frame">
              <svg viewBox="0 0 24 24" fill="none" stroke="url(#gradFixer)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div class="card-meta-title">
              <h2><?php echo __('card_chmod_title'); ?></h2>
              <p><?php echo __('card_chmod_desc'); ?></p>
            </div>
          </div>
          <div class="card-runtime-content">
            <div class="inner-card-body">
              <div class="form-group">
                <label for="chmodpath"><?php echo __('select_target'); ?></label>
                <select name="chmodpath" class="select">
                  <option value="."><?php echo __('root_dir'); ?></option>
                  <?php foreach ($unzipper->directories as $dir): ?>
                    <option value="<?php echo htmlspecialchars($dir, ENT_QUOTES, 'UTF-8'); ?>"><?php echo htmlspecialchars($dir, ENT_QUOTES, 'UTF-8'); ?></option>
                  <?php endforeach; ?>
                </select>
              </div>

              <div class="chmod-panel" data-matrix-group="fixer">
                <p class="info" style="margin-bottom: 14px; color: var(--grad-pink);"><?php echo __('new_matrix'); ?></p>
                <div class="chmod-inputs-row">
                  <div class="chmod-input-container">
                    <label id="lbl_fix_dir_chmod" for="fix_dir_chmod" class="active-label"><?php echo __('folders'); ?></label>
                    <input type="text" id="fix_dir_chmod" name="fix_dir_chmod" class="form-field chmod-text-field focused-context" value="755" maxlength="3" readonly />
                  </div>
                  <div class="chmod-input-container">
                    <label id="lbl_fix_file_chmod" for="fix_file_chmod"><?php echo __('files'); ?></label>
                    <input type="text" id="fix_file_chmod" name="fix_file_chmod" class="form-field chmod-text-field" value="644" maxlength="3" readonly />
                  </div>
                </div>
                <table class="chmod-table">
                  <thead><tr><th><?php echo __('scope'); ?></th><th>Read (4)</th><th>Write (2)</th><th>Execute (1)</th></tr></thead>
                  <tbody>
                    <tr><td><?php echo __('owner'); ?></td><td><label class="checkbox-label"><input type="checkbox" data-role="ur" data-val="400"><span class="checkmark"></span></label></td><td><label class="checkbox-label"><input type="checkbox" data-role="uw" data-val="200"><span class="checkmark"></span></label></td><td><label class="checkbox-label"><input type="checkbox" data-role="ux" data-val="100"><span class="checkmark"></span></label></td></tr>
                    <tr><td><?php echo __('group'); ?></td><td><label class="checkbox-label"><input type="checkbox" data-role="gr" data-val="40"><span class="checkmark"></span></label></td><td><label class="checkbox-label"><input type="checkbox" data-role="gw" data-val="20"><span class="checkmark"></span></label></td><td><label class="checkbox-label"><input type="checkbox" data-role="gx" data-val="10"><span class="checkmark"></span></label></td></tr>
                    <tr><td><?php echo __('others'); ?></td><td><label class="checkbox-label"><input type="checkbox" data-role="or" data-val="4"><span class="checkmark"></span></label></td><td><label class="checkbox-label"><input type="checkbox" data-role="ow" data-val="2"><span class="checkmark"></span></label></td><td><label class="checkbox-label"><input type="checkbox" data-role="ox" data-val="1"><span class="checkmark"></span></label></td></tr>
                  </tbody>
                </table>
              </div>
              <div style="margin-top: 25px;">
                <input type="submit" name="dochmod" class="submit submit-chmod" value="<?php echo __('btn_chmod'); ?>" />
              </div>
            </div>
          </div>
        </div>

        <div class="app-card" data-card-id="deleter">
          <div class="card-trigger-header">
            <div class="card-icon-frame">
              <svg viewBox="0 0 36 36" style="fill:none; stroke:#ff453a; stroke-width:2.5px; stroke-linecap:round; stroke-linejoin:round; width:32px; height:32px;">
                  <g transform="translate(6, 6)"> <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></g>
              </svg>
            </div>
            <div class="card-meta-title">
              <h2><?php echo __('card_delete_title'); ?></h2>
              <p><?php echo __('card_delete_desc'); ?></p>
            </div>
          </div>
          <div class="card-runtime-content">
            <div class="inner-card-body">
              <div class="form-group">
                <label><?php echo __('select_del_targets'); ?></label>
                <div class="scrollable-checkbox-list" style="max-height: 200px; overflow-y: auto; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 10px; padding: 12px; margin-top: 8px;">
                  <?php if (empty($unzipper->directories) && empty($unzipper->zipfiles)): ?>
                    <p style="color: var(--text-muted); margin: 0; font-size: 13px;"><?php echo __('no_objects'); ?></p>
                  <?php else: ?>
                    <?php if (!empty($unzipper->directories)): ?>
                      <div style="font-weight: bold; font-size: 12px; color: var(--grad-cyan); margin-bottom: 8px; margin-top: 4px;"><?php echo __('folders_optgroup'); ?></div>
                      <?php foreach ($unzipper->directories as $dir): ?>
                        <label class="checkbox-label" style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-weight: normal; cursor: pointer; user-select: none;">
                          <input type="checkbox" name="delpaths[]" value="<?php echo htmlspecialchars($dir, ENT_QUOTES, 'UTF-8'); ?>" class="delete-checkbox" />
                          <span class="checkmark" style="position: static; transform: none; margin-right: 0; flex-shrink: 0;"></span>
                          <span style="font-size: 13px; color: #fff;"><?php echo htmlspecialchars($dir, ENT_QUOTES, 'UTF-8'); ?><?php echo __('folder_suffix'); ?></span>
                        </label>
                      <?php endforeach; ?>
                    <?php endif; ?>
                    <?php if (!empty($unzipper->zipfiles)): ?>
                      <div style="font-weight: bold; font-size: 12px; color: var(--grad-blue); margin-bottom: 8px; margin-top: 12px;"><?php echo __('zip_optgroup'); ?></div>
                      <?php foreach ($unzipper->zipfiles as $zip): ?>
                        <label class="checkbox-label" style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-weight: normal; cursor: pointer; user-select: none;">
                          <input type="checkbox" name="delpaths[]" value="<?php echo htmlspecialchars($zip, ENT_QUOTES, 'UTF-8'); ?>" class="delete-checkbox" />
                          <span class="checkmark" style="position: static; transform: none; margin-right: 0; flex-shrink: 0;"></span>
                          <span style="font-size: 13px; color: #fff;"><?php echo htmlspecialchars($zip, ENT_QUOTES, 'UTF-8'); ?></span>
                        </label>
                      <?php endforeach; ?>
                    <?php endif; ?>
                  <?php endif; ?>
                </div>
                <p class="info" style="color: #FF453A; font-weight: bold; margin-top: 12px;"><?php echo __('warning_undone'); ?></p>
              </div>
              <button type="button" class="submit submit-delete" onclick="showDeleteConfirmModal()"><?php echo __('btn_delete'); ?></button>
            </div>
          </div>
        </div>

        <div class="app-card" data-card-id="zipper">
          <div class="card-trigger-header">
            <div class="card-icon-frame">
              <svg viewBox="0 0 24 24" fill="none" stroke="url(#gradZip)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3 21 12 17 21 21"></polyline><polyline points="12 3 12 17"></polyline><polyline points="12 12 21 8"></polyline><polyline points="12 12 3 8"></polyline>
              </svg>
            </div>
            <div class="card-meta-title">
              <h2><?php echo __('card_zip_title'); ?></h2>
              <p><?php echo __('card_zip_desc'); ?></p>
            </div>
          </div>
          <div class="card-runtime-content">
            <div class="inner-card-body">
              <div class="form-group">
                <label for="zippath"><?php echo __('select_zip_target'); ?></label>
                <select name="zippath" class="select">
                  <option value="."><?php echo __('compress_all'); ?></option>
                  <?php foreach ($unzipper->directories as $dir): ?>
                    <option value="<?php echo htmlspecialchars($dir, ENT_QUOTES, 'UTF-8'); ?>"><?php echo htmlspecialchars($dir, ENT_QUOTES, 'UTF-8'); ?></option>
                  <?php endforeach; ?>
                </select>
              </div>
              <div class="form-group">
                <label for="zipsuffix"><?php echo __('suffix'); ?></label>
                <input type="text" name="zipsuffix" class="form-field" placeholder="<?php echo htmlspecialchars(__('placeholder_suffix'), ENT_QUOTES, 'UTF-8'); ?>" />
              </div>
              <input type="submit" name="dozip" class="submit" value="<?php echo __('btn_zip'); ?>" />
            </div>
          </div>
        </div>

        <div class="app-card" data-card-id="download_installer">
          <div class="card-trigger-header">
            <div class="card-icon-frame">
              <svg viewBox="0 0 24 24" fill="none" stroke="url(#gradUnzip)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </div>
            <div class="card-meta-title">
              <h2><?php echo __('card_download_title'); ?></h2>
              <p><?php echo __('card_download_desc'); ?></p>
            </div>
          </div>
          <div class="card-runtime-content">
            <div class="inner-card-body">
              <div style="border-bottom: 1px dashed rgba(255, 255, 255, 0.1); padding-bottom: 20px; margin-bottom: 20px;">
                <h3 style="font-size: 15px; font-family: var(--font-bold); margin-top: 0; margin-bottom: 15px; color: var(--grad-cyan);">
                  <?php echo __('remote_downloader_title'); ?>
                </h3>
                <div class="form-group">
                  <label for="download_url"><?php echo __('download_url'); ?></label>
                  <div style="position: relative;">
                    <input type="text" name="download_url" id="download_url" class="form-field" placeholder="https://example.com/file.zip" style="padding-right: 45px;" />
                    <div id="download_url_check" style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); display: none; align-items: center; justify-content: center; width: 20px; height: 20px; font-size: 16px;"></div>
                  </div>
                </div>
                <div class="form-group">
                  <label for="download_path"><?php echo __('save_as'); ?></label>
                  <input type="text" name="download_path" id="download_path" class="form-field" placeholder="<?php echo htmlspecialchars(__('placeholder_package'), ENT_QUOTES, 'UTF-8'); ?>" />
                </div>
                <button type="button" id="btn_run_download" class="submit"><?php echo __('btn_download'); ?></button>
              </div>

              <div>
                <h3 style="font-size: 15px; font-family: var(--font-bold); margin-top: 0; margin-bottom: 15px; color: var(--grad-blue);">
                  <?php echo __('cms_installer_title'); ?>
                </h3>
                <div class="form-group">
                  <label for="app_key"><?php echo __('select_app'); ?></label>
                  <div style="position: relative;">
                    <select name="app_key" id="app_key" class="select" style="padding-right: 65px;">
                      <option value=""><?php echo __('select_app_default'); ?></option>
                      <?php foreach ($installer_apps as $key => $app): ?>
                        <option value="<?php echo htmlspecialchars($key, ENT_QUOTES, 'UTF-8'); ?>">
                          <?php echo htmlspecialchars($app['name'], ENT_QUOTES, 'UTF-8'); ?>
                        </option>
                      <?php endforeach; ?>
                    </select>
                    <div id="app_key_check" style="position: absolute; right: 45px; top: 50%; transform: translateY(-50%); display: none; align-items: center; justify-content: center; width: 20px; height: 20px; font-size: 16px; pointer-events: none;"></div>
                  </div>
                  <div id="app_url_status_text" style="font-size: 11px; margin-top: 5px; color: var(--text-muted); display: none;"></div>
                </div>
                <div class="form-group">
                  <label for="install_path"><?php echo __('install_dir'); ?></label>
                  <input type="text" name="install_path" id="install_path" class="form-field" placeholder="<?php echo htmlspecialchars(__('placeholder_install_dir'), ENT_QUOTES, 'UTF-8'); ?>" />
                </div>
                <div class="form-group">
                  <label for="install_overwrite"><?php echo __('overwrite_mode'); ?></label>
                  <select name="install_overwrite" id="install_overwrite" class="select">
                    <option value="skip"><?php echo __('overwrite_skip'); ?></option>
                    <option value="overwrite"><?php echo __('overwrite_all'); ?></option>
                    <option value="older"><?php echo __('overwrite_older'); ?></option>
                  </select>
                </div>
                <button type="button" id="btn_run_install" class="submit" style="background: linear-gradient(90deg, #4FACFE, #7F00FF);"><?php echo __('btn_install'); ?></button>
              </div>
            </div>
          </div>
        </div>

        ${enableServerInfoTab ? `
        <!-- EMBEDDED PHP SERVER PARAMETERS LIVE TAB -->
        <div class="app-card" data-card-id="serverinfo">
          <div class="card-trigger-header">
            <div class="card-icon-frame">
              <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line>
              </svg>
            </div>
            <div class="card-meta-title">
              <h2><?php echo __('card_server_title'); ?></h2>
              <p><?php echo __('card_server_desc'); ?></p>
            </div>
          </div>
          <div class="card-runtime-content">
            <div class="inner-card-body">
              <table class="server-table">
                <thead>
                  <tr>
                    <th><?php echo __('server_param_php'); ?></th>
                    <th><?php echo __('server_value_on_server'); ?></th>
                    <th><?php echo __('server_recommended'); ?></th>
                    <th><?php echo __('server_status'); ?></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>PHP Version</td>
                    <td><?= phpversion() ?></td>
                    <td>>= 8.1.0</td>
                    <td><span class="server-status server-status-ok"><?php echo __('server_optimal'); ?></span></td>
                  </tr>
                  <tr>
                    <td>memory_limit</td>
                    <td><?= ini_get('memory_limit') ?></td>
                    <td>>= 128M</td>
                    <td><span class="server-status <?= (int)ini_get('memory_limit') >= 128 ? 'server-status-ok' : 'server-status-warn' ?>"><?= (int)ini_get('memory_limit') >= 128 ? __('server_compatible') : __('server_warning') ?></span></td>
                  </tr>
                  <tr>
                    <td>max_execution_time</td>
                    <td><?= ini_get('max_execution_time') ?>s</td>
                    <td>>= 60s</td>
                    <td><span class="server-status <?= (int)ini_get('max_execution_time') >= 60 ? 'server-status-ok' : 'server-status-warn' ?>"><?= (int)ini_get('max_execution_time') >= 60 ? __('server_compatible') : __('server_warning') ?></span></td>
                  </tr>
                  <tr>
                    <td>upload_max_filesize</td>
                    <td><?= ini_get('upload_max_filesize') ?></td>
                    <td>>= 32M</td>
                    <td><span class="server-status">Info</span></td>
                  </tr>
                  <tr>
                    <td>post_max_size</td>
                    <td><?= ini_get('post_max_size') ?></td>
                    <td>>= upload</td>
                    <td><span class="server-status">Info</span></td>
                  </tr>
                  <tr>
                    <td><?php echo __('server_zip_ext'); ?></td>
                    <td><?= extension_loaded('zip') ? __('server_installed') : __('server_missing') ?></td>
                    <td><?php echo __('server_installed'); ?></td>
                    <td><span class="server-status <?= extension_loaded('zip') ? 'server-status-ok' : 'server-status-warn' ?>"><?= extension_loaded('zip') ? __('server_optimal') : __('server_critical') ?></span></td>
                  </tr>
                  <tr>
                    <td><?php echo __('server_zlib_comp'); ?></td>
                    <td><?= extension_loaded('zlib') ? __('server_active') : __('server_none') ?></td>
                    <td><?php echo __('server_active'); ?></td>
                    <td><span class="server-status <?= extension_loaded('zlib') ? 'server-status-ok' : 'server-status-warn' ?>"><?= extension_loaded('zlib') ? __('server_optimal') : __('server_critical') ?></span></td>
                  </tr>
                  <tr>
                    <td>allow_url_fopen</td>
                    <td><?= ini_get('allow_url_fopen') ? __('server_enabled_on') : __('server_disabled') ?></td>
                    <td><?php echo __('server_any'); ?></td>
                    <td><span class="server-status"><?php echo __('server_security'); ?></span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        ` : ''}

      </div>
    </form>
  </div>
<?php endif; ?>

<footer>
  <div class="footer-content">
    Custom MegaUnzipper Pro &copy; <?php echo date('Y'); ?>
  </div>
  <?php if (isset($_SESSION['mega_auth']) && $_SESSION['mega_auth'] === true): ?>
    <form action="" method="POST" style="display:inline;">
      <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($_SESSION['csrf_token'], ENT_QUOTES, 'UTF-8'); ?>">
      <button type="button" class="logout-btn" style="background:rgba(255,69,58,0.25); border-color:#FF453A; color:#FF453A; font-weight:bold; cursor:pointer; padding:6px 14px;" onclick="showSelfDestructModal(event)">
        <?php echo __('btn_self_destruct'); ?>
      </button>
    </form>
    <a href="?logout=true" class="logout-btn"><?php echo __('btn_logout'); ?></a>
  <?php endif; ?>
</footer>

<script>
  const gridContainer = document.getElementById('gridFlexModule');
  const cards = document.querySelectorAll('.app-card');
  if(gridContainer && cards.length > 0) {
    const savedActiveCardId = localStorage.getItem('mega_active_card');
    if (savedActiveCardId) {
      const targetCard = document.querySelector('.app-card[data-card-id="' + savedActiveCardId + '"]');
      if (targetCard) {
        cards.forEach(c => c.classList.remove('active-expanded'));
        targetCard.classList.add('active-expanded');
        gridContainer.classList.add('has-active');
      }
    } else {
      const activeCard = document.querySelector('.app-card.active-expanded');
      if (activeCard) {
        gridContainer.classList.add('has-active');
      }
    }

    cards.forEach(card => {
      const header = card.querySelector('.card-trigger-header');
      header.addEventListener('click', (e) => {
        if (card.classList.contains('active-expanded')) return;
        cards.forEach(c => c.classList.remove('active-expanded'));
        card.classList.add('active-expanded');
        gridContainer.classList.add('has-active');
        const cardId = card.getAttribute('data-card-id');
        if (cardId) {
          localStorage.setItem('mega_active_card', cardId);
        }
      });
    });
  }

  function setupMatrixGroup(groupSelector, fieldConfigs) {
    const container = document.querySelector('[data-matrix-group="' + groupSelector + '"]');
    if (!container) return;
    let currentActiveInputId = fieldConfigs[0].id;
    const textInputs = fieldConfigs.map(cfg => document.getElementById(cfg.id));
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');

    function syncCheckboxesFromActiveInput() {
      const activeInput = document.getElementById(currentActiveInputId);
      const val = activeInput.value.trim();
      if (val.length !== 3 || isNaN(val)) return;
      const u = parseInt(val.charAt(0)); const g = parseInt(val.charAt(1)); const o = parseInt(val.charAt(2));
      checkboxes.forEach(cb => {
        const role = cb.getAttribute('data-role'); let checkedStatus = false;
        if (role === 'ur') checkedStatus = (u & 4) === 4; if (role === 'uw') checkedStatus = (u & 2) === 2; if (role === 'ux') checkedStatus = (u & 1) === 1;
        if (role === 'gr') checkedStatus = (g & 4) === 4; if (role === 'gw') checkedStatus = (g & 2) === 2; if (role === 'gx') checkedStatus = (g & 1) === 1;
        if (role === 'or') checkedStatus = (o & 4) === 4; if (role === 'ow') checkedStatus = (o & 2) === 2; if (role === 'ox') checkedStatus = (o & 1) === 1;
        cb.checked = checkedStatus;
      });
    }

    function syncActiveInputFromCheckboxes() {
      const activeInput = document.getElementById(currentActiveInputId);
      let u = 0, g = 0, o = 0;
      checkboxes.forEach(cb => {
        const role = cb.getAttribute('data-role'); if (!cb.checked) return;
        if (role === 'ur') u += 4; if (role === 'uw') u += 2; if (role === 'ux') u += 1;
        if (role === 'gr') g += 4; if (role === 'gw') g += 2; if (role === 'gx') g += 1;
        if (role === 'or') o += 4; if (role === 'ow') o += 2; if (role === 'ox') o += 1;
      });
      activeInput.value = "" + u + g + o;
    }

    textInputs.forEach(input => {
      input.addEventListener('click', (e) => {
        e.stopPropagation();
        textInputs.forEach(i => {
          i.classList.remove('focused-context');
          const lbl = document.getElementById('lbl_' + i.id); if (lbl) lbl.classList.remove('active-label');
        });
        input.classList.add('focused-context');
        const activeLabel = document.getElementById('lbl_' + input.id); if (activeLabel) activeLabel.classList.add('active-label');
        currentActiveInputId = input.id;
        syncCheckboxesFromActiveInput();
      });
    });
    checkboxes.forEach(cb => { cb.addEventListener('change', () => { syncActiveInputFromCheckboxes(); }); });
    syncCheckboxesFromActiveInput();
  }
  setupMatrixGroup('unzipper', [{ id: 'dir_chmod' }, { id: 'file_chmod' }]);
  setupMatrixGroup('fixer', [{ id: 'fix_dir_chmod' }, { id: 'fix_file_chmod' }]);

  // Dynamiczny licznik Dead Man's Switch (Time Bomb)
  (function() {
    let timeLeft = <?php echo isset($time_left) ? (int)$time_left : 0; ?>;
    const timerDisplay = document.getElementById('countdown-timer');
    
    if (!timerDisplay || timeLeft <= 0) return;

    function updateTimer() {
      if (timeLeft <= 0) {
        timerDisplay.innerHTML = "<?php echo __('timer_destroying'); ?>";
        location.reload(); 
        return;
      }

      const hours = Math.floor(timeLeft / 3600);
      const minutes = Math.floor((timeLeft % 3600) / 60);
      const seconds = timeLeft % 60;

      const formattedTime = 
        String(hours).padStart(2, '0') + ':' + 
        String(minutes).padStart(2, '0') + ':' + 
        String(seconds).padStart(2, '0');

      timerDisplay.textContent = formattedTime;
      timeLeft--;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
  })();

  // NEW: Progress tracking, remote download, and installer javascript
  let progressInterval = null;

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function showCustomAlert(title, message, isSuccess) {
      isSuccess = !!isSuccess;
      var modal = document.getElementById("customAlertModal");
      if (!modal) {
          modal = document.createElement("div");
          modal.id = "customAlertModal";
          modal.style.cssText = "position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(6, 4, 10, 0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); display: flex; justify-content: center; align-items: center; z-index: 100001; opacity: 0; transition: opacity 0.3s ease;";
          document.body.appendChild(modal);
      }
      
      var borderColor = isSuccess ? "rgba(0, 242, 254, 0.4)" : "rgba(255, 69, 58, 0.4)";
      var shadowColor = isSuccess ? "rgba(0, 242, 254, 0.15)" : "rgba(255, 69, 58, 0.15)";
      var iconBg = isSuccess ? "rgba(0, 242, 254, 0.1)" : "rgba(255, 69, 58, 0.1)";
      var iconBorder = isSuccess ? "rgba(0, 242, 254, 0.3)" : "rgba(255, 69, 58, 0.3)";
      var btnBg = isSuccess ? "linear-gradient(90deg, #00f2fe, #4facfe)" : "linear-gradient(90deg, #ff453a, #ff9f0a)";
      var iconSvg = isSuccess 
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="#00f2fe" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 40px; height: 40px;"><polyline points="20 6 9 17 4 12"></polyline></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="#ff453a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 40px; height: 40px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

      modal.innerHTML = '<div style="background: var(--glass-bg); border: 1px solid ' + borderColor + '; border-radius: 24px; padding: 35px; width: 90%; max-width: 450px; box-shadow: 0 30px 60px rgba(0,0,0,0.5), 0 0 30px ' + shadowColor + '; text-align: center; position: relative; backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px);">' +
          '<button type="button" onclick="closeCustomAlert()" style="position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 24px; color: var(--text-muted); cursor: pointer; transition: color 0.2s;">&times;</button>' +
          '<div style="width: 80px; height: 80px; border-radius: 20px; background: ' + iconBg + '; border: 1px solid ' + iconBorder + '; display: flex; justify-content: center; align-items: center; margin: 0 auto 25px auto;">' +
              iconSvg +
          '</div>' +
          '<h2 style="font-family: var(--font-bold); font-size: 22px; color: #FFF; margin: 0 0 8px 0; letter-spacing: -0.5px;">' + title + '</h2>' +
          '<p style="color: #fff; font-size: 15px; margin: 0 0 25px 0; line-height: 1.5; font-family: var(--font-medium); white-space: pre-wrap;">' + message + '</p>' +
          '<button type="button" class="submit" onclick="closeCustomAlert()" style="width: 100%; border-radius: 14px; background: ' + btnBg + '; margin: 0;"><?php echo htmlspecialchars(__("btn_close"), ENT_QUOTES, "UTF-8"); ?></button>' +
      '</div>';
      
      modal.style.display = "flex";
      setTimeout(function() { modal.style.opacity = "1"; }, 10);
  }

  function closeCustomAlert() {
      var modal = document.getElementById("customAlertModal");
      if (modal) {
          modal.style.opacity = "0";
          setTimeout(function() { modal.style.display = "none"; }, 300);
      }
  }

  function showProgressModal(statusText, iconType) {
    let modal = document.getElementById('progressModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'progressModal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(6, 4, 10, 0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); display: flex; justify-content: center; align-items: center; z-index: 100000; opacity: 0; transition: opacity 0.3s ease;';
        modal.innerHTML = '<div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 24px; padding: 40px; width: 90%; max-width: 450px; box-shadow: 0 30px 60px rgba(0,0,0,0.5); text-align: center; font-family: var(--font-light);">' +
                '<div id="modalIconFrame" style="width: 80px; height: 80px; border-radius: 20px; background: rgba(111, 93, 252, 0.15); border: 1px solid rgba(111, 93, 252, 0.4); display: flex; justify-content: center; align-items: center; margin: 0 auto 25px auto; box-shadow: 0 0 20px rgba(111, 93, 252, 0.2);">' +
                    '<svg id="modalIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 40px; height: 40px; color: var(--grad-cyan);"></svg>' +
                '</div>' +
                '<h2 id="modalTitle" style="font-family: var(--font-bold); font-size: 22px; color: #FFF; margin: 0 0 8px 0; letter-spacing: -0.5px;"><?php echo htmlspecialchars(__("executing_operation"), ENT_QUOTES, "UTF-8"); ?></h2>' +
                '<p id="modalStatus" style="color: var(--text-muted); font-size: 14px; margin: 0 0 25px 0;">Inicjalizacja...</p>' +
                '<div style="width: 100%; height: 8px; background: rgba(255, 255, 255, 0.05); border-radius: 4px; overflow: hidden; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.03);">' +
                    '<div id="modalProgressBar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #00F2FE, #4FACFE, #7F00FF); transition: width 0.2s ease; border-radius: 4px;"></div>' +
                '</div>' +
                '<div style="display: flex; justify-content: space-between; font-size: 12px; font-family: monospace;">' +
                    '<span id="modalProgressDetail" style="color: var(--text-muted);">0 / 0</span>' +
                    '<span id="modalProgressPercent" style="color: var(--grad-cyan); font-weight: bold;">0%</span>' +
                '</div>' +
            '</div>';
        document.body.appendChild(modal);
    }
    
    const iconSvg = document.getElementById('modalIcon');
    iconType = iconType || '';
    if (iconType === 'download' || statusText.toLowerCase().includes('download') || statusText.toLowerCase().includes('pobier')) {
        iconSvg.innerHTML = '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>';
    } else if (iconType === 'unzip' || statusText.toLowerCase().includes('unzip') || statusText.toLowerCase().includes('rozpak')) {
        iconSvg.innerHTML = '<polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5" rx="1"></rect><line x1="10" y1="12" x2="14" y2="12"></line>';
    } else if (iconType === 'zip' || statusText.toLowerCase().includes('zip') || statusText.toLowerCase().includes('kompres')) {
        iconSvg.innerHTML = '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3 21 12 17 21 21"></polyline><polyline points="12 3 12 17"></polyline>';
    } else {
        iconSvg.innerHTML = '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>';
    }
    
    document.getElementById('modalStatus').textContent = statusText;
    document.getElementById('modalProgressBar').style.width = '0%';
    document.getElementById('modalProgressPercent').textContent = '0%';
    document.getElementById('modalProgressDetail').textContent = '';
    
    modal.style.display = 'flex';
    setTimeout(() => { modal.style.opacity = '1'; }, 10);
  }

  function hideProgressModal() {
    const modal = document.getElementById('progressModal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    }
  }

  function startPollingProgress(taskId) {
    if (progressInterval) clearInterval(progressInterval);
    
    progressInterval = setInterval(() => {
        fetch('?get_progress=1&task_id=' + taskId)
            .then(res => res.json())
            .then(data => {
                if (data && data.status && data.status !== 'idle') {
                    const percent = data.percent || 0;
                    document.getElementById('modalProgressBar').style.width = percent + '%';
                    document.getElementById('modalProgressPercent').textContent = percent + '%';
                    
                    let statusLabel = '';
                    let detailLabel = '';
                    
                    if (data.status === 'downloading') {
                        statusLabel = '<?php echo htmlspecialchars(__("status_downloading"), ENT_QUOTES, "UTF-8"); ?>';
                        detailLabel = formatBytes(data.current) + ' / ' + formatBytes(data.total);
                    } else if (data.status === 'extracting') {
                        statusLabel = '<?php echo htmlspecialchars(__("status_extracting"), ENT_QUOTES, "UTF-8"); ?>';
                        detailLabel = data.current + ' / ' + data.total;
                    } else if (data.status === 'compressing') {
                        statusLabel = '<?php echo htmlspecialchars(__("status_compressing"), ENT_QUOTES, "UTF-8"); ?>';
                        detailLabel = data.current + ' / ' + data.total;
                    }
                    
                    document.getElementById('modalStatus').textContent = statusLabel;
                    document.getElementById('modalProgressDetail').textContent = detailLabel;
                }
            })
            .catch(err => console.error('Error polling progress:', err));
    }, 400);
  }

  function stopPollingProgress() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Dynamic URL check for Remote Downloader
    const urlInput = document.getElementById('download_url');
    const urlCheckDiv = document.getElementById('download_url_check');
    let debounceTimer = null;

    if (urlInput && urlCheckDiv) {
        urlInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            const url = urlInput.value.trim();
            if (!url) {
                urlCheckDiv.style.display = 'none';
                return;
            }
            urlCheckDiv.style.display = 'flex';
            urlCheckDiv.innerHTML = '🔄';
            urlCheckDiv.style.color = '#9C98B3';
            
            debounceTimer = setTimeout(() => {
                fetch('?check_url=1&url=' + encodeURIComponent(url))
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.exists) {
                            urlCheckDiv.innerHTML = '✔';
                            urlCheckDiv.style.color = '#38bdf8';
                        } else {
                            urlCheckDiv.innerHTML = '✕';
                            urlCheckDiv.style.color = '#FF453A';
                        }
                    })
                    .catch(() => {
                        urlCheckDiv.innerHTML = '✕';
                        urlCheckDiv.style.color = '#FF453A';
                    });
            }, 600);
        });
    }

    // Dynamic URL check for CMS select dropdown
    const appSelect = document.getElementById('app_key');
    const appCheckDiv = document.getElementById('app_key_check');
    const appStatusText = document.getElementById('app_url_status_text');
    
    // PHP array representation of installer apps for JavaScript lookup
    const installerAppsConfig = <?php echo json_encode($installer_apps); ?>;

    if (appSelect && appCheckDiv && appStatusText) {
        appSelect.addEventListener('change', () => {
            const key = appSelect.value;
            if (!key || !installerAppsConfig[key]) {
                appCheckDiv.style.display = 'none';
                appStatusText.style.display = 'none';
                return;
            }
            const app = installerAppsConfig[key];
            appCheckDiv.style.display = 'flex';
            appCheckDiv.innerHTML = '🔄';
            appCheckDiv.style.color = '#9C98B3';
            appStatusText.style.display = 'block';
            appStatusText.textContent = '<?php echo htmlspecialchars(__("checking_package"), ENT_QUOTES, "UTF-8"); ?>';
            appStatusText.style.color = 'var(--text-muted)';
            
            fetch('?check_url=1&url=' + encodeURIComponent(app.url))
                .then(res => res.json())
                .then(data => {
                    if (data && data.exists) {
                        appCheckDiv.innerHTML = '✔';
                        appCheckDiv.style.color = '#34d399';
                        appStatusText.textContent = '<?php echo htmlspecialchars(__("package_ok"), ENT_QUOTES, "UTF-8"); ?>';
                        appStatusText.style.color = '#34d399';
                    } else {
                        appCheckDiv.innerHTML = '✕';
                        appCheckDiv.style.color = '#FF453A';
                        appStatusText.textContent = '<?php echo htmlspecialchars(__("package_error"), ENT_QUOTES, "UTF-8"); ?>';
                        appStatusText.style.color = '#FF453A';
                    }
                })
                .catch(() => {
                    appCheckDiv.innerHTML = '✕';
                    appCheckDiv.style.color = '#FF453A';
                    appStatusText.textContent = '<?php echo htmlspecialchars(__("package_conn_error"), ENT_QUOTES, "UTF-8"); ?>';
                    appStatusText.style.color = '#FF453A';
                });
        });
    }

    const form = document.getElementById('mainToolsForm');
    if (!form) return;
    
    let clickedSubmitterName = null;
    const submitButtons = form.querySelectorAll('input[type="submit"]');
    submitButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            clickedSubmitterName = btn.name;
        });
    });

    const btnDownload = document.getElementById('btn_run_download');
    if (btnDownload) {
        btnDownload.addEventListener('click', (e) => {
            e.preventDefault();
            const urlInput = document.getElementById('download_url');
            if (!urlInput || !urlInput.value.trim()) {
                showCustomAlert('<?php echo htmlspecialchars(__("op_error"), ENT_QUOTES, "UTF-8"); ?>', '<?php echo htmlspecialchars(__("enter_url_alert"), ENT_QUOTES, "UTF-8"); ?>');
                return;
            }
            triggerAjaxOperation('dodownload', '<?php echo htmlspecialchars(__("downloading_from_url"), ENT_QUOTES, "UTF-8"); ?>', 'download');
        });
    }
    
    const btnInstall = document.getElementById('btn_run_install');
    if (btnInstall) {
        btnInstall.addEventListener('click', (e) => {
            e.preventDefault();
            const appSelect = document.getElementById('app_key');
            if (!appSelect || !appSelect.value) {
                showCustomAlert('<?php echo htmlspecialchars(__("op_error"), ENT_QUOTES, "UTF-8"); ?>', '<?php echo htmlspecialchars(__("select_app_alert"), ENT_QUOTES, "UTF-8"); ?>');
                return;
            }
            triggerAjaxOperation('doinstall', '<?php echo htmlspecialchars(__("launching_installer"), ENT_QUOTES, "UTF-8"); ?>', 'download');
        });
    }
    
    form.addEventListener('submit', (e) => {
        const submitterName = e.submitter ? e.submitter.name : clickedSubmitterName;
        if (submitterName === 'dounzip' || submitterName === 'dozip') {
            e.preventDefault();
            const label = submitterName === 'dounzip' ? '<?php echo htmlspecialchars(__("extracting_archive_status"), ENT_QUOTES, "UTF-8"); ?>' : '<?php echo htmlspecialchars(__("compressing_dir_status_short"), ENT_QUOTES, "UTF-8"); ?>';
            const iconHint = submitterName === 'dounzip' ? 'unzip' : 'zip';
            triggerAjaxOperation(submitterName, label, iconHint);
        }
    });
    
    function triggerAjaxOperation(actionName, initialLabel, iconHint) {
        const taskId = 'task_' + Math.random().toString(36).substring(2, 10);
        showProgressModal(initialLabel, iconHint);
        startPollingProgress(taskId);
        
        const formData = new FormData(form);
        formData.set('task_id', taskId);
        formData.set(actionName, '1');
        
        fetch(window.location.href, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            stopPollingProgress();
            hideProgressModal();
            window.location.href = response.url;
        })
        .catch(err => {
            stopPollingProgress();
            hideProgressModal();
            console.error('Operation failed:', err);
            showCustomAlert('<?php echo htmlspecialchars(__("op_error"), ENT_QUOTES, "UTF-8"); ?>', err);
        });
    }
  });
</script>

<div id="deleteConfirmModal" class="modal-overlay" style="display: none;">
  <div class="custom-modal-content" style="max-width: 480px; width: 90%; background: var(--glass-bg-active); border: 1px solid rgba(255, 69, 58, 0.4); border-radius: 24px; padding: 35px; text-align: center; box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), 0 0 30px rgba(255, 69, 58, 0.15); position: relative; backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px);">
    <button type="button" class="modal-close-x" onclick="closeDeleteModal()" style="position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 24px; color: var(--text-muted); cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='var(--text-muted)'">&times;</button>
    
    <div style="width: 80px; height: 80px; border-radius: 20px; background: rgba(255, 69, 58, 0.1); border: 1px solid rgba(255, 69, 58, 0.3); display: flex; justify-content: center; align-items: center; margin: 0 auto 25px auto;">
      <svg viewBox="0 0 24 24" fill="none" stroke="#ff453a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 40px; height: 40px;">
        <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
      </svg>
    </div>
    
    <h2 style="font-family: var(--font-bold); font-size: 22px; color: #FFF; margin: 0 0 8px 0; letter-spacing: -0.5px;">
      <?php echo __('confirm_delete_title'); ?>
    </h2>
    
    <p style="color: var(--text-muted); font-size: 14px; margin: 0 0 15px 0;">
      <?php echo __('warning_undone'); ?>
    </p>
    
    <div id="deleteModalList" class="scrollable-checkbox-list" style="max-height: 150px; overflow-y: auto; background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 15px; margin-bottom: 25px;">
    </div>
    
    <div style="display: flex; gap: 12px; justify-content: center;">
      <button type="button" class="btn-cancel" onclick="closeDeleteModal()" style="flex: 1;"><?php echo __('btn_cancel'); ?></button>
      <button type="button" class="submit" onclick="confirmDeleteAction()" style="flex: 1; border-radius: 14px; background: linear-gradient(90deg, #ff453a, #ff9f0a); margin: 0;"><?php echo __('btn_delete_confirm'); ?></button>
    </div>
  </div>
</div>

<div id="selfDestructConfirmModal" class="modal-overlay" style="display: none;">
  <div class="custom-modal-content" style="max-width: 480px; width: 90%; background: var(--glass-bg-active); border: 1px solid rgba(255, 69, 58, 0.4); border-radius: 24px; padding: 35px; text-align: center; box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), 0 0 30px rgba(255, 69, 58, 0.15); position: relative; backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px);">
    <button type="button" class="modal-close-x" onclick="closeSelfDestructModal()" style="position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 24px; color: var(--text-muted); cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='var(--text-muted)'">&times;</button>
    
    <div style="width: 80px; height: 80px; border-radius: 20px; background: rgba(255, 69, 58, 0.1); border: 1px solid rgba(255, 69, 58, 0.3); display: flex; justify-content: center; align-items: center; margin: 0 auto 25px auto;">
      <svg viewBox="0 0 24 24" fill="none" stroke="#ff453a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 40px; height: 40px;">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    </div>
    
    <h2 style="font-family: var(--font-bold); font-size: 22px; color: #FFF; margin: 0 0 8px 0; letter-spacing: -0.5px;">
      <?php echo __('confirm_delete_title'); ?>
    </h2>
    
    <p style="color: #fff; font-size: 15px; margin: 0 0 25px 0; line-height: 1.5; font-family: var(--font-medium);">
      <?php echo __('confirm_self_destruct'); ?>
    </p>
    
    <div style="display: flex; gap: 12px; justify-content: center;">
      <button type="button" class="btn-cancel" onclick="closeSelfDestructModal()" style="flex: 1;"><?php echo __('btn_cancel'); ?></button>
      <button type="button" class="submit" onclick="confirmSelfDestructAction()" style="flex: 1; border-radius: 14px; background: linear-gradient(90deg, #ff453a, #ff9f0a); margin: 0;"><?php echo __('btn_delete_confirm'); ?></button>
    </div>
  </div>
</div>

<script>
  function showDeleteConfirmModal() {
    const checkboxes = document.querySelectorAll('.delete-checkbox:checked');
    if (checkboxes.length === 0) {
      showCustomAlert('<?php echo htmlspecialchars(__("op_error"), ENT_QUOTES, "UTF-8"); ?>', '<?php echo htmlspecialchars(__("no_delete_target"), ENT_QUOTES, "UTF-8"); ?>');
      return;
    }
    
    let listHtml = '<ul style="margin: 0; padding: 0 0 0 20px; text-align: left; color: #fff; font-size: 13px; line-height: 1.6;">';
    checkboxes.forEach(cb => {
      listHtml += '<li>' + escapeHtml(cb.value) + '</li>';
    });
    listHtml += '</ul>';
    
    document.getElementById('deleteModalList').innerHTML = listHtml;
    document.getElementById('deleteConfirmModal').style.display = 'flex';
  }

  function closeDeleteModal() {
    document.getElementById('deleteConfirmModal').style.display = 'none';
  }

  function confirmDeleteAction() {
    const form = document.getElementById('mainToolsForm');
    const hiddenSubmit = document.createElement('input');
    hiddenSubmit.type = 'hidden';
    hiddenSubmit.name = 'dodelete';
    hiddenSubmit.value = '1';
    form.appendChild(hiddenSubmit);
    form.submit();
  }

  function showSelfDestructModal(e) {
    if (e) e.preventDefault();
    document.getElementById('selfDestructConfirmModal').style.display = 'flex';
  }

  function closeSelfDestructModal() {
    document.getElementById('selfDestructConfirmModal').style.display = 'none';
  }

  function confirmSelfDestructAction() {
    const form = document.getElementById('mainToolsForm');
    const hiddenSubmit = document.createElement('input');
    hiddenSubmit.type = 'hidden';
    hiddenSubmit.name = 'self_destruct';
    hiddenSubmit.value = '1';
    form.appendChild(hiddenSubmit);
    form.submit();
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
</script>
</body>
</html>`;

    return phpCode;
  };


  const downloadFile = () => {
    const code = generatePhpCode();
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'unzipper_pro.php';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const code = generatePhpCode();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Configuration Header card */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Settings className="text-violet-400 w-5 h-5" />
          {isPl ? 'Dostosuj i Zabezpiecz Skrypt PHP' : 'Customize & Secure PHP Script'}
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          {isPl ? (
            <>
              Skonfiguruj parametry skryptu poniżej. Możesz wygenerować bezpieczny hash hasła, włączyć blokadę brute-force, dodać wbudowany tab diagnostyki serwera, a następnie pobrać gotowy plik PHP <strong>unzipper_pro.php</strong>.
            </>
          ) : (
            <>
              Configure your script parameters below. You can generate a secure password hash, enable brute-force lockout, add an embedded server diagnostics tab, and download your production-ready <strong>unzipper_pro.php</strong> file.
            </>
          )}
        </p>
      </div>

      {/* Main configuration grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column - options */}
        <div className="space-y-6">
          {/* Section 1 - Auth */}
          <div className="bg-slate-950/40 border border-white/5 p-5 rounded-xl space-y-4">
            <h4 className="text-white font-bold text-sm flex items-center gap-2 border-b border-white/5 pb-2">
              <Key className="text-indigo-400 w-4 h-4" />
              {isPl ? 'Uwierzytelnienie (Autoryzacja)' : 'Authentication Credentials'}
            </h4>

            {/* Username */}
            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">
                {isPl ? 'Nazwa administratora:' : 'Admin Username:'}
              </label>
              <input
                type="text"
                value={configs.adminUser}
                onChange={(e) => handleInputChange('adminUser', e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Password input & hashing */}
            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">
                {isPl ? 'Nowe bezpieczne hasło (w locie zamieniane na BCRYPT):' : 'New secure password (compiled to BCRYPT hash):'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={configs.rawPassword}
                  onChange={(e) => handleInputChange('rawPassword', e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg pl-3 pr-10 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Wpisz nowe hasło..."
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Output Hash code info */}
            <div className="bg-slate-900/50 p-3 rounded-lg border border-white/5 font-mono text-xs">
              <span className="text-slate-500 block mb-1">
                {isPl ? 'Wygenerowany PHP hash (Bcrypt):' : 'Generated PHP Bcrypt Hash:'}
              </span>
              <div className="text-emerald-400 truncate select-all">
                {isHashing ? (
                  <span className="text-slate-400 animate-pulse">Hashing in progress...</span>
                ) : (
                  configs.passwordHash
                )}
              </div>
            </div>
          </div>

          {/* Section 2 - Expiry */}
          <div className="bg-slate-950/40 border border-white/5 p-5 rounded-xl space-y-4">
            <h4 className="text-white font-bold text-sm flex items-center gap-2 border-b border-white/5 pb-2">
              <Clock className="text-teal-400 w-4 h-4" />
              {isPl ? 'Dead Man\'s Switch (Bomba Czasowa)' : 'Dead Man\'s Switch Expiration'}
            </h4>

            <div>
              <label className="text-xs text-slate-400 font-bold block mb-2">
                {isPl ? 'Czas życia skryptu na serwerze:' : 'Time script can live on server before deletion:'}
              </label>
              <select
                value={configs.maxLifetimeSeconds}
                onChange={(e) => handleInputChange('maxLifetimeSeconds', Number(e.target.value))}
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
              >
                <option value={3600}>1 {isPl ? 'godzina' : 'hour'}</option>
                <option value={21600}>6 {isPl ? 'godzin' : 'hours'}</option>
                <option value={43200}>12 {isPl ? 'godzin' : 'hours'}</option>
                <option value={86400}>24 {isPl ? 'godziny (zalecane)' : 'hours (recommended)'}</option>
                <option value={172800}>48 {isPl ? 'godziny' : 'hours'}</option>
                <option value={604800}>1 {isPl ? 'tydzień' : 'week'}</option>
                <option value={0}>{isPl ? 'Nigdy nie usuwaj (Niebezpieczne!)' : 'Never delete (Dangerous!)'}</option>
              </select>
            </div>

            {configs.maxLifetimeSeconds === 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-400 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  {isPl ? (
                    'Uwaga: Całkowite wyłączenie samozniszczenia grozi pozostawieniem skryptu na serwerze na stałe. Jeśli intruz odkryje zapomniany skrypt, uzyska pełny dostęp do Twoich plików.'
                  ) : (
                    'Warning: Disabling automatic self-destruction risks leaving this script active forever. If an attacker discovers this forgotten script, they will gain full access to your server.'
                  )}
                </p>
              </div>
            )}

            {/* Język skryptu */}
            <div className="pt-2 border-t border-white/5">
              <label className="text-xs text-slate-400 font-bold block mb-2">
                {isPl ? 'Język skryptu unzipper_pro.php:' : 'Language of unzipper_pro.php script:'}
              </label>
              <select
                value={configs.selectedLanguage}
                onChange={(e) => handleInputChange('selectedLanguage', e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
              >
                <option value="en">🇬🇧 English (EN)</option>
                <option value="pl">🇵🇱 Polski (PL)</option>
                <option value="de">🇩🇪 Deutsch (DE)</option>
                <option value="es">🇪🇸 Español (ES)</option>
                <option value="fr">🇫🇷 Français (FR)</option>
                <option value="it">🇮🇹 Italiano (IT)</option>
                <option value="pt">🇵🇹 Português (PT)</option>
              </select>
            </div>
          </div>

          {/* Section 3 - Switches and Options */}
          <div className="bg-slate-950/40 border border-white/5 p-5 rounded-xl space-y-4">
            <h4 className="text-white font-bold text-sm flex items-center gap-2 border-b border-white/5 pb-2">
              <Shield className="text-amber-500 w-4 h-4" />
              {isPl ? 'Opcjonalne Zabezpieczenia' : 'Additional Security Hardening'}
            </h4>

            {/* Brute force */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-200 block">
                  {isPl ? 'Ochrona Brute-Force' : 'Brute-Force Lockout'}
                </span>
                <span className="text-xs text-slate-500">
                  {isPl ? 'Blokada logowania po serii błędów' : 'Lockout IP after consecutive failed attempts'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <HelpCircle className="w-4 h-4 text-slate-500 hover:text-indigo-400 transition-colors cursor-help" />
                  <div className="absolute right-0 bottom-full mb-2 w-72 bg-slate-900 border border-indigo-500/30 text-xs text-slate-200 p-3 rounded-lg shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                    <div className="font-bold text-indigo-400 mb-1">
                      {isPl ? 'Ochrona Brute-Force' : 'Brute-Force Lockout'}
                    </div>
                    <div className="leading-relaxed font-sans font-normal text-slate-300">
                      {isPl 
                        ? 'Automatycznie blokuje dostęp do panelu logowania na 15 minut po osiągnięciu limitu nieudanych prób logowania (domyślnie 5). Chroni serwer przed zautomatyzowanymi atakami słownikowymi i botami skanującymi.'
                        : 'Temporarily locks the login page for 15 minutes after reaching 5 consecutive failed attempts. Prevents automated dictionary attacks and network scanning bots.'}
                    </div>
                    <div className="absolute right-1 top-full w-2 h-2 bg-slate-900 border-r border-b border-indigo-500/30 rotate-45 -translate-y-1" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange('enableBruteForceProtection', !configs.enableBruteForceProtection)}
                  className="text-indigo-400 hover:text-white"
                >
                  {configs.enableBruteForceProtection ? <ToggleRight className="w-10 h-10 text-emerald-400" /> : <ToggleLeft className="w-10 h-10 text-slate-600" />}
                </button>
              </div>
            </div>

            {/* Embed parameters tab */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-200 block">
                  {isPl ? 'Zintegruj Tab Parametrów Serwera' : 'Embed Server Parameters Tab'}
                </span>
                <span className="text-xs text-slate-500">
                  {isPl ? 'Pokaże parametry PHP live w unzipperze' : 'Embeds a Live PHP configuration checker in unzipper'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <HelpCircle className="w-4 h-4 text-slate-500 hover:text-indigo-400 transition-colors cursor-help" />
                  <div className="absolute right-0 bottom-full mb-2 w-72 bg-slate-900 border border-indigo-500/30 text-xs text-slate-200 p-3 rounded-lg shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                    <div className="font-bold text-indigo-400 mb-1">
                      {isPl ? 'Tab Parametrów Serwera' : 'Server Parameters Tab'}
                    </div>
                    <div className="leading-relaxed font-sans font-normal text-slate-300">
                      {isPl 
                        ? 'Wbudowuje w unzipper_pro.php zakładkę diagnostyczną na żywo, wyświetlającą limity serwera (RAM memory_limit, limit czasu max_execution_time itp.). Pozwala upewnić się, czy serwer uciągnie duże ZIPy.'
                        : 'Embeds a live diagnostics view directly inside the unzipper script, displaying server limits (RAM memory_limit, script timeout max_execution_time, etc.) to ensure host readiness.'}
                    </div>
                    <div className="absolute right-1 top-full w-2 h-2 bg-slate-900 border-r border-b border-indigo-500/30 rotate-45 -translate-y-1" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange('enableServerInfoTab', !configs.enableServerInfoTab)}
                  className="text-indigo-400 hover:text-white"
                >
                  {configs.enableServerInfoTab ? <ToggleRight className="w-10 h-10 text-emerald-400" /> : <ToggleLeft className="w-10 h-10 text-slate-600" />}
                </button>
              </div>
            </div>

            {/* Safe extraction mode */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-200 block">
                  {isPl ? 'Bezpieczna Ekstrakcja (Safe Extraction)' : 'Safe Extraction Shield'}
                </span>
                <span className="text-xs text-slate-500">
                  {isPl ? 'Blokuje nadpisywanie .htaccess, .env i .php' : 'Protects against rewriting critical files'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <HelpCircle className="w-4 h-4 text-slate-500 hover:text-indigo-400 transition-colors cursor-help" />
                  <div className="absolute right-0 bottom-full mb-2 w-72 bg-slate-900 border border-indigo-500/30 text-xs text-slate-200 p-3 rounded-lg shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                    <div className="font-bold text-indigo-400 mb-1">
                      {isPl ? 'Bezpieczna Ekstrakcja' : 'Safe Extraction Shield'}
                    </div>
                    <div className="leading-relaxed font-sans font-normal text-slate-300">
                      {isPl 
                        ? 'Dodatkowy mechanizm ochronny uniemożliwiający nadpisywanie krytycznych plików systemowych i konfiguracyjnych (np. .htaccess, .env, .php) podczas standardowego wypakowywania. Chroni przed przypadkowym nadpisaniem konfiguracji i wstrzyknięciem exploita.'
                        : 'A protective filter that prevents overwriting critical system configuration and scripting files (like .htaccess, .env, or raw .php files) during typical extractions. Blocks remote code execution and config destruction.'}
                    </div>
                    <div className="absolute right-1 top-full w-2 h-2 bg-slate-900 border-r border-b border-indigo-500/30 rotate-45 -translate-y-1" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange('enableSafeExtraction', !configs.enableSafeExtraction)}
                  className="text-indigo-400 hover:text-white"
                >
                  {configs.enableSafeExtraction ? <ToggleRight className="w-10 h-10 text-emerald-400" /> : <ToggleLeft className="w-10 h-10 text-slate-600" />}
                </button>
              </div>
            </div>

            {/* Enforce SSL */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-200 block">
                  {isPl ? 'Wymuś Połączenie SSL (HTTPS)' : 'Enforce HTTPS SSL Link'}
                </span>
                <span className="text-xs text-slate-500">
                  {isPl ? 'Przekieruje automatycznie na HTTPS' : 'Forces secure login transmission over SSL'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <HelpCircle className="w-4 h-4 text-slate-500 hover:text-indigo-400 transition-colors cursor-help" />
                  <div className="absolute right-0 bottom-full mb-2 w-72 bg-slate-900 border border-indigo-500/30 text-xs text-slate-200 p-3 rounded-lg shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                    <div className="font-bold text-indigo-400 mb-1">
                      {isPl ? 'Wymuś Połączenie SSL' : 'Enforce HTTPS SSL Link'}
                    </div>
                    <div className="leading-relaxed font-sans font-normal text-slate-300">
                      {isPl 
                        ? 'Wymusza ładowanie skryptu przez bezpieczne połączenie szyfrowane HTTPS (kod przekierowania 301). Chroni Twoje dane logowania oraz wysyłane żądania przed przechwyceniem przez osoby trzecie w sieci lokalnej (podatność Man-in-the-Middle).'
                        : 'Forces the script to load exclusively over an encrypted HTTPS connection (using 301 redirects). Prevents your password and commands from being intercepted in transit (Man-in-the-Middle attacks).'}
                    </div>
                    <div className="absolute right-1 top-full w-2 h-2 bg-slate-900 border-r border-b border-indigo-500/30 rotate-45 -translate-y-1" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange('enforceSsl', !configs.enforceSsl)}
                  className="text-indigo-400 hover:text-white"
                >
                  {configs.enforceSsl ? <ToggleRight className="w-10 h-10 text-emerald-400" /> : <ToggleLeft className="w-10 h-10 text-slate-600" />}
                </button>
              </div>
            </div>

            {/* Logging */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-200 block">
                  {isPl ? 'Dziennik zdarzeń (Audit Log)' : 'Security Audit Logging'}
                </span>
                <span className="text-xs text-slate-500">
                  {isPl ? 'Loguje działania do ukrytego pliku logów' : 'Writes actions to a local hidden log file'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <HelpCircle className="w-4 h-4 text-slate-500 hover:text-indigo-400 transition-colors cursor-help" />
                  <div className="absolute right-0 bottom-full mb-2 w-72 bg-slate-900 border border-indigo-500/30 text-xs text-slate-200 p-3 rounded-lg shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                    <div className="font-bold text-indigo-400 mb-1">
                      {isPl ? 'Dziennik Zdarzeń (Audit Log)' : 'Security Audit Logging'}
                    </div>
                    <div className="leading-relaxed font-sans font-normal text-slate-300">
                      {isPl 
                        ? 'Wszystkie kluczowe operacje, takie jak logowanie, rozpakowywanie archiwów, usuwanie plików czy modyfikacje uprawnień, zostaną zarejestrowane w ukrytym pliku tekstowym (.unzip_audit_log.txt) na Twoim serwerze. Idealne do śledzenia aktywności.'
                        : 'Records all essential operations (logins, extracted ZIPs, file deletions, permissions adjustments) into a hidden text log file named .unzip_audit_log.txt on your host. Ideal for verifying and auditing server activity.'}
                    </div>
                    <div className="absolute right-1 top-full w-2 h-2 bg-slate-900 border-r border-b border-indigo-500/30 rotate-45 -translate-y-1" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange('logActions', !configs.logActions)}
                  className="text-indigo-400 hover:text-white"
                >
                  {configs.logActions ? <ToggleRight className="w-10 h-10 text-emerald-400" /> : <ToggleLeft className="w-10 h-10 text-slate-600" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - PHP Code Preview & Action triggers */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 flex-1 flex flex-col">
            <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
              <h4 className="text-white font-bold text-sm flex items-center gap-2">
                <List className="text-indigo-400 w-4 h-4" />
                {isPl ? 'Podgląd Wygenerowanego Kodu PHP' : 'PHP Generated Code Preview'}
              </h4>
              <span className="text-[11px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/30 font-mono">
                unzipper_pro.php
              </span>
            </div>

            {/* Code container */}
            <div className="bg-slate-950 border border-white/5 rounded-xl p-4 overflow-y-auto font-mono text-xs text-indigo-200/90 whitespace-pre scrollbar-thin h-[500px]">
              {generatePhpCode()}
            </div>

            {/* Informative text */}
            <p className="text-[11px] text-slate-500 mt-3 italic leading-relaxed">
              {isPl ? (
                '* Kod PHP jest kompilowany w czasie rzeczywistym. Wszystkie powyższe opcje są wstrzykiwane bezpośrednio do struktury kodu przed pobraniem.'
              ) : (
                '* PHP code compiles dynamically in real time. All chosen configuration parameters are injected cleanly before downloading.'
              )}
            </p>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={copyToClipboard}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3.5 rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2 text-sm select-none active:scale-[0.98]"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{isPl ? 'Skopiowano!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{isPl ? 'Skopiuj kod PHP' : 'Copy PHP Code'}</span>
                </>
              )}
            </button>

            <button
              onClick={downloadFile}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 text-sm select-none active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>{isPl ? 'Pobierz unzipper_pro.php' : 'Download unzipper_pro.php'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
