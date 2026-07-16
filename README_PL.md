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

**MegaUnzipper Pro** to zaawansowany, profesjonalny system webowy do zarządzania archiwami i automatyzacji instalacji oprogramowania bezpośrednio na serwerach PHP/FTP. Aplikacja składa się z responsywnego kreatora (napisanego w React i TypeScript) oraz generowanego, zoptymalizowanego, w 100% niezależnego skryptu **`unzipper_pro.php`**, który wgrywa się na serwer docelowy.

Koniec z uciążliwym wgrywaniem tysięcy drobnych plików CMS przez wolne połączenie FTP. Dzięki MegaUnzipper Pro możesz pobrać i wdrożyć dowolne archiwum lub popularny CMS w kilka sekund.

---

<p align="center">
  <img src="https://raw.githubusercontent.com/KastjelPL/MegaUnzipper-Pro/main/images/generator.jpg" alt="Generator">
</p>

## 🚀 Główne Funkcje Wygenerowanego Skryptu (`unzipper_pro.php`)

Skrypt `unzipper_pro.php` to potężne, jedno-plikowe narzędzie administracyjne, które łączy w sobie następujące moduły:

### 1. Rozpakowywanie Archiwów (Multi-Format Extractor)
*   **Szeroka kompatybilność**: Obsługuje pliki `.zip` (przez standardowe `ZipArchive`), `.rar` (przez moduł `RarArchive`), `.tar`/`.tar.gz`/`.tgz` (przez natywne `PharData`) oraz `.7z` (poprzez fallback do systemowych narzędzi CLI `7z` lub `7za`).
*   **Zaawansowane tryby nadpisywania plików**:
    *   `Pomiń`: Pomija wypakowywanie, jeśli plik już istnieje na serwerze (najbezpieczniejszy tryb).
    *   `Nadpisz`: Bezwzględnie nadpisuje wszystkie istniejące pliki.
    *   `Tylko starsze`: Nadpisuje plik na serwerze tylko wtedy, gdy ten w archiwum ma nowszą datę modyfikacji.
*   **Safe Extraction Guard**: Specjalny filtr ochronny zapobiegający przypadkowemu nadpisaniu wrażliwych plików systemowych (np. `.htaccess`, `.env`, głównych plików `.php`). Opcję tę można wymusić (wyłączyć zabezpieczenie) podczas generowania lub bezpośrednio w interfejsie.

### 2. Pobieranie z URL (Remote Downloader)
*   **Bypass zabezpieczeń CDN**: Skrypt automatycznie symuluje nagłówki przeglądarki (User-Agent), aby zapobiec blokowaniu pobierania przez systemy Cloudflare czy zapory botów.
*   **Wskaźnik pobierania**: Wykorzystuje dynamiczny modal postępu pokazujący procent pobrania oraz przesyłane bajty w czasie rzeczywistym.
*   **Walidacja istnienia pliku**: Przed kliknięciem przycisku pobierania skrypt sprawdza w tle (AJAX), czy podany adres URL jest poprawny i czy plik rzeczywiście istnieje (zielona ikonka check `✔` / czerwony `✕`).

### 3. Automatyczny Instalator CMS i Bibliotek (1-Click Installer)
Umożliwia automatyczne pobranie, rozpakowanie i uruchomienie instalatora dla **28 popularnych aplikacji i frameworków** podzielonych na kategorie:
*   **Systemy CMS**: WordPress, PrestaShop, OpenCart, Magento Open Source, Joomla, Drupal, Nextcloud.
*   **Fora, Wiki i Blogi**: phpBB, Flarum, MediaWiki, Moodle.
*   **Bazy Danych i Narzędzia**: phpMyAdmin, Adminer, FileGator, n8n, Roundcube, YOURLS, Matomo, Bitwarden, Gitea, Uptime Kuma, Taiga, Vikunja.
*   **Frameworki i Biblioteki**: Laravel, Bootstrap, CodeIgniter, PHPMailer, TinyMCE.
*   *Wszystkie paczki są weryfikowane w czasie rzeczywistym przed uruchomieniem.*

### 4. Diagnostyka Serwera (Server Inspector)
Wszystkie niezbędne informacje o serwerze wbudowane są bezpośrednio w kartę **Parametry serwera** (nie potrzebujesz wgrywać żadnych osobnych plików diagnostycznych!):
*   Wersja PHP (wraz z informacją o minimalnych wymaganiach).
*   Stan rozszerzeń: `ZipArchive`, `RarArchive`, `Zlib`, `Phar` (`PharData`).
*   Wartości dyrektyw bezpieczeństwa i limitów: `allow_url_fopen`, włączony/wyłączony cURL, OpenSSL, maksymalny czas wykonywania (`max_execution_time`), maksymalna wielkość przesyłanych plików (`upload_max_filesize`).
*   Wygodna legenda w 7 językach informująca o statusie każdego parametru.

### 5. Rekurencyjna Zmiana Uprawnień (Permissions CHMOD Manager)
*   Posiada interaktywną, graficzną macierz uprawnień (Owner, Group, Others dla praw Odczytu, Zapisu i Wykonania).
*   Pozwala na rekurencyjne (masowe) aplikowanie uprawnień CHMOD osobno dla wszystkich katalogów (np. `755`) i plików (np. `644`) znajdujących się w wybranej ścieżce.

### 6. Kompresor Katalogów (Directory Compressor)
*   Szybkie pakowanie wybranych podkatalogów do archiwum `.zip` o niestandardowej, dynamicznie generowanej nazwie.
*   Świetnie sprawdza się do szybkiego tworzenia backupu strony przed wdrożeniem zmian.

### 7. Bezpieczne i Zbiorcze Usuwanie Plików (File Deleter)
*   Lista wyboru wszystkich obiektów w katalogu roboczym (z wyłączeniem folderów systemowych).
*   **Wielokrotny wybór**: Zaznacz wiele plików i folderów do usunięcia jednocześnie.
*   **Modalne potwierdzenie**: Bezpieczne zatwierdzenie operacji w oknie dialogowym dark theme zamiast systemowych alertów przeglądarki.
*   Zwraca szczegółowy raport (które pliki/foldery zostały pomyślnie skasowane, a które zgłosiły błąd uprawnień).

---

<p align="center">
  <img src="https://raw.githubusercontent.com/KastjelPL/MegaUnzipper-Pro/main/images/megaunzipper-view.jpg" alt="MegaUnzipper View">
</p>

## 🔒 Zaawansowane Zabezpieczenia (Security Core)

*   **Blokada IP**: Skrypt może zostać zablokowany tak, aby dostęp do niego miał wyłącznie adres IP komputera, na którym został wygenerowany.
*   **Zabezpieczenie Sesji**: Ochrona przed hijackingiem sesji (weryfikacja User-Agent) oraz pełna ochrona przed atakami CSRF (żądania POST wymagają poprawnego tokenu sesyjnego).
*   **Samozniszczenie (Dead Man's Switch / Time Bomb)**:
    *   *Automatyczne*: Skrypt usuwa się samoczynnie po określonym czasie od momentu wdrożenia (np. po 1, 3 lub 24 godzinach).
    *   *Ręczne*: Przycisk w stopce pozwala jednym kliknięciem (po zatwierdzeniu modalem) bezpowrotnie usunąć skrypt z serwera.
*   **Czyszczenie śladów**: Podczas samozniszczenia skrypt automatycznie usuwa z serwera również cały ukryty katalog `.sessions` zawierający dane tymczasowe i pliki sesji, nie pozostawiając po sobie żadnych śladów.

---

## 🛠️ Jak Skonfigurować i Pobrać Własny `unzipper_pro.php`

1.  **Wybór języka**: W generatorze wybierz preferowany język domyślny za pomocą listy rozwijanej z flagami państw. Dostępne języki to:
    *   🇺🇸 English (EN)
    *   🇵🇱 Polski (PL)
    *   🇩🇪 Deutsch (DE)
    *   🇪🇸 Español (ES)
    *   🇫🇷 Français (FR)
    *   🇮🇹 Italiano (IT)
    *   🇵🇹 Português (PT)
    *   *Uwaga: Wybrany język zostanie trwale wpisany do generowanego kodu źródłowego pliku, dzięki czemu wygenerowany plik będzie lekki i nie będzie wymagał zewnętrznych plików językowych.*
2.  **Ustawienie Hasła**: W sekcji *Ustawienia Zabezpieczeń* wprowadź silne hasło dostępowe. Możesz skorzystać z ikony oka, aby podejrzeć wpisywane znaki.
3.  **Czas Samozniszczenia (Time Bomb)**: Wybierz z listy czas, po jakim skrypt automatycznie usunie się z serwera (np. 1 godzina, 3 godziny, 24 godziny lub wyłącz tę funkcję).
4.  **Opcje dodatkowe**:
    *   **Blokuj dostęp do mojego IP**: Zaznacz, jeśli chcesz, aby nikt inny (nawet znający hasło) nie mógł otworzyć skryptu z innego komputera.
    *   **Włącz Safe Extraction**: Chroni przed nadpisaniem plików konfiguracyjnych i skryptów PHP (rekomendowane).
5.  **Generowanie**: Kliknij przycisk **Generuj & Pobierz Skrypt**. Plik `unzipper_pro.php` zostanie natychmiast wygenerowany i pobrany na Twój komputer.

---

## 📦 Wdrożenie na Serwerze

1.  Prześlij pobrany plik `unzipper_pro.php` na swój serwer FTP do katalogu, w którym chcesz przeprowadzać operacje.
2.  Otwórz plik w przeglądarce, np.: `https://twojadomena.pl/unzipper_pro.php`.
3.  Zaloguj się hasłem podanym podczas generowania.
4.  Wykonaj potrzebne instalacje lub wypakowania archiwów.
5.  Po zakończeniu pracy kliknij czerwony przycisk **Samozniszczenie** w stopce skryptu i zatwierdź usunięcie. Skrypt oraz wszystkie pliki sesyjne w `.sessions` zostaną bezpowrotnie skasowane.

---

## 💻 Uruchomienie Kreatora Lokalnie

**Wymagania wstępne**: Node.js (wersja 18+)

1.  Zainstaluj zależności projektu:
    ```bash
    npm install
    ```
2.  Skopiuj plik środowiskowy i podaj klucze (jeśli wymagane):
    ```bash
    cp .env.example .env.local
    ```
3.  Uruchom serwer deweloperski Vite:
    ```bash
    npm run dev
    ```
4.  Aby zbudować zoptymalizowaną wersję produkcyjną aplikacji klienckiej:
    ```bash
    npm run build
    ```
