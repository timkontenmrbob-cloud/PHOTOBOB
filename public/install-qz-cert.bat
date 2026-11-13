@echo off
echo ========================================================
echo   PHOTOBOX KIOSK - QZ TRAY ONE-CLICK CERTIFICATE SETUP
echo ========================================================
echo.
echo Memasang sertifikat "PHOTOBOX KIOSK" ke QZ Tray...
echo.

set CERT_FILE=%~dp0digital-certificate.txt
set QZ_CONSOLE=%PROGRAMFILES%\QZ Tray\qz-tray-console.exe

if not exist "%QZ_CONSOLE%" (
    echo [ERROR] QZ Tray tidak ditemukan di "%QZ_CONSOLE%".
    echo Silakan buka QZ Tray manual:
    echo 1. Klik kanan ikon QZ Tray di taskbar Windows (dekat jam)
    echo 2. Pilih Advanced -> Site Manager
    echo 3. Tarik (drag & drop) file digital-certificate.txt ke jendela Site Manager.
    echo.
    pause
    exit /b 1
)

"%QZ_CONSOLE%" --whitelist "%CERT_FILE%"

echo.
echo ========================================================
echo [SUKSES] Sertifikat berhasil didaftarkan ke QZ Tray!
echo Sekarang Anda dapat mencetak foto 100%% otomatis tanpa dialog.
echo ========================================================
echo.
pause
