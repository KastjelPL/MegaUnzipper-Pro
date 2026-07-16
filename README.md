[ENGLISH](https://github.com/KastjelPL/MegaUnzipper-Pro/blob/main/README.md) | [POLISH](https://github.com/KastjelPL/MegaUnzipper-Pro/blob/main/README_PL.md)

<p align="center">
  <img src="https://raw.githubusercontent.com/KastjelPL/MegaUnzipper-Pro/main/images/logo.jpg" alt="Logo">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/KastjelPL/MegaUnzipper-Pro/main/images/hero.jpg" alt="Hero">
</p>

<p align="center">
  <a href="https://megadesign.pl/megadesign/megaunzipper/">
    <img src="https://raw.githubusercontent.com/KastjelPL/MegaUnzipper-Pro/main/images/btn-download.png" alt="Download">
  </a>
</p>

# 📦 MegaUnzipper Pro

**MegaUnzipper Pro** is an advanced, professional web-based tool for server-side archive extraction, remote downloading, and software deployment directly on PHP/FTP servers. The application consists of a responsive configuration companion wizard (built with React and TypeScript) and a generated, optimized, and 100% standalone **`unzipper_pro.php`** script designed for deployment on target web hosts.

No more slow, file-by-file FTP transfers of large CMS scripts. With MegaUnzipper Pro, you can download and extract any archive or CMS in a matter of seconds.

---

## ⚡ Quick Start

Don't want to run the generator? We've included a ready-to-use, pre-generated script **`unzipper_pro-EN-1.2.0.php`** directly in the repository for quick testing!

*   **Download link**: [unzipper_pro-EN-1.2.0.php](https://github.com/KastjelPL/MegaUnzipper-Pro/blob/main/unzipper_pro-EN-1.2.0.php)
*   **Password**: `admin`
*   **Settings**: All optional security features (Safe Extraction, etc.) are **enabled**.

---

<p align="center">
  <img src="https://raw.githubusercontent.com/KastjelPL/MegaUnzipper-Pro/main/images/generator.jpg" alt="Generator">
</p>

## 🚀 Key Features of `unzipper_pro.php`

The generated `unzipper_pro.php` is a single-file, lightweight administration panel featuring the following modules:

### 1. Multi-Format Archive Extractor
*   **Broad Compatibility**: Native support for `.zip` (via standard `ZipArchive`), `.rar` (via `RarArchive`), `.tar`/`.tar.gz`/`.tgz` (via `PharData`), and `.7z` (via command-line tool fallback `7z`/`7za`).
*   **Overwrite Rules**:
    *   `Skip`: Skips extraction for files that already exist on the server (recommended, safest mode).
    *   `Overwrite`: Force-overwrites all existing files.
    *   `Overwrite if Older`: Only overwrites an existing file if the file in the archive has a newer modification date.
*   **Safe Extraction Guard**: A filter designed to protect critical configuration files (such as `.htaccess`, `.env`, index.php) from being overwritten. Can be explicitly bypassed when generated or toggled via checkbox.

### 2. Remote Downloader
*   **CDN Bot Protection Bypass**: Automatically mirrors real browser User-Agent headers, preventing cURL or HTTP stream blocks from Cloudflare or standard web application firewalls.
*   **Download Progress Modal**: Includes a dynamic overlay displaying progress percentage, processed files/bytes, and transfer speed in real time.
*   **Pre-download Validation**: Verifies the remote file's existence and status code in the background via AJAX (Green Check mark `✔` / Red cross `✕` indicator).

### 3. One-Click CMS & Tools Installer
Instantly downloads, unpacks, and launches setup wizards for **28 popular systems, libraries, and frameworks**:
*   **CMS Platforms**: WordPress, PrestaShop, OpenCart, Magento Open Source, Joomla, Drupal, Nextcloud.
*   **Forums, Wikis & Blogs**: phpBB, Flarum, MediaWiki, Moodle.
*   **Databases & Web Apps**: phpMyAdmin, Adminer, FileGator, n8n, Roundcube, YOURLS, Matomo, Bitwarden, Gitea, Uptime Kuma, Taiga, Vikunja.
*   **Frameworks & Libraries**: Laravel, Bootstrap, CodeIgniter, PHPMailer, TinyMCE.
*   *Downloads are pre-verified via status checks before execution.*

### 4. Integrated Server Diagnostics (Diagnostics Tab)
Live diagnostics are built directly into the **PHP Server Parameters** card inside `unzipper_pro.php` (no extra files needed):
*   Current PHP Version (verified against minimal requirements).
*   Extension status: `ZipArchive`, `RarArchive`, `Zlib`, `Phar` (`PharData`).
*   Security limitations: `allow_url_fopen`, cURL availability, OpenSSL support, maximum execution time (`max_execution_time`), and maximum upload size (`upload_max_filesize`).
*   Multilingual indicators showing recommended vs active states.

### 5. Recursive Permissions Changer (CHMOD Matrix)
*   Interactive, visual permissions matrix for Owner, Group, and Others (Read, Write, Execute).
*   Enables recursive CHMOD adjustments, applying unique permissions separately to directories (e.g. `755`) and files (e.g. `644`) within any chosen path.

### 6. Directory Compressor
*   Quickly compresses multiple subfolders and files into a single `.zip` archive with customizable names.
*   Ideal for creating instant backups of your site before applying updates.

### 7. Secure Bulk File Deleter
*   Lists all items in the working directory (excluding system/hidden folders).
*   **Multi-select**: Check multiple files and folders to delete simultaneously.
*   **Modal Dialog Confirmation**: Replaces default browser popups with custom dark-themed confirm overlays.
*   Provides detailed feedback reporting which files were deleted or failed (due to folder permission blocks).

---

<p align="center">
  <img src="https://raw.githubusercontent.com/KastjelPL/MegaUnzipper-Pro/main/images/megaunzipper-view.jpg" alt="MegaUnzipper View">
</p>

## 🔒 Advanced Security Core

*   **IP Address Locking**: Locks access exclusively to the creator's IP address.
*   **Session Guard**: Prevents session hijacking by verifying browser User-Agents and blocks CSRF threats using unique, cryptographically secure session-bound POST tokens.
*   **Self-Destruct Sequence (Dead Man's Switch)**:
    *   *Automatic (Time Bomb)*: Deletes the script automatically after a defined timeframe (e.g., 1, 3, or 24 hours).
    *   *Manual*: Footer button triggers immediate deletion of the script after custom modal confirmation.
*   **Traces Cleanup**: Upon self-destruction, it recursively wipes out the local hidden `.sessions` folder containing session data and logs, leaving no trace behind.

---

## 🛠️ How to Customize and Download `unzipper_pro.php`

1.  **Language selection**: Use the dropdown with flag icons at the top of the generator wizard to choose the script's default language. Available translations:
    *   🇺🇸 English (EN)
    *   🇵🇱 Polski (PL)
    *   🇩🇪 Deutsch (DE)
    *   🇪🇸 Español (ES)
    *   🇫🇷 Français (FR)
    *   🇮🇹 Italiano (IT)
    *   🇵🇹 Português (PT)
    *   *Note: Only the chosen language dataset is injected into the PHP script to keep the final output lightweight and standalone.*
2.  **Define Password**: Set a strong master password for login. Use the visibility eye icon to reveal the password.
3.  **Set Auto-Deletion (Time Bomb)**: Select how long the script should remain active on your host (e.g., 1 hour, 3 hours, 24 hours, or disable it).
4.  **Extra Hardening**:
    *   **Lock to my IP**: Check this to block access from any IP address other than your own.
    *   **Safe Extraction**: Protects configuration files (like `.env`, `.htaccess`) from being overwritten (highly recommended).
5.  **Generate**: Click the **Generate & Download Script** button. The file `unzipper_pro.php` is compiled on the fly and downloaded instantly.

---

## 📦 Deployment Guide

1.  Upload the compiled `unzipper_pro.php` file to the directory you want to manage on your web server.
2.  Access the file in your web browser, e.g., `https://yourdomain.com/unzipper_pro.php`.
3.  Enter the master password defined during generation.
4.  Perform archive extractions, remote downloads, or software installations.
5.  Once finished, click the red **Self-Destruct** button in the footer and confirm. The script and the `.sessions` folder will be completely wiped from your server.

---

## 💻 Running the Wizard Locally

**Prerequisite**: Node.js (version 18+)

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Set up local environment parameters:
    ```bash
    cp .env.example .env.local
    ```
3.  Run the Vite development server:
    ```bash
    npm run dev
    ```
4.  Compile production-ready assets:
    ```bash
    npm run build
    ```
