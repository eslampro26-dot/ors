@echo off
echo.
echo ====================================================
echo   ORLUXUS - تطبيق Firestore Security Rules
echo ====================================================
echo.
echo سيفتح المتصفح لتسجيل الدخول بحساب Google...
echo.

cd /d "%~dp0"

firebase login
if errorlevel 1 (
    echo فشل تسجيل الدخول! حاول مرة أخرى.
    pause
    exit /b 1
)

echo.
echo جاري نشر Firebase Rules...
firebase deploy --only firestore:rules --project orluxus

if errorlevel 1 (
    echo.
    echo ❌ فشل النشر. راجع الأخطاء أعلاه.
) else (
    echo.
    echo ✅ تم نشر Firebase Rules بنجاح!
    echo ✅ لن تظهر أخطاء permissions بعد الآن.
)

pause
