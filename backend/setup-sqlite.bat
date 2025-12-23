@echo off
echo ================================================
echo   PitCrew AI - Setup (SQLite)
echo ================================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found!
    pause
    exit /b 1
)

REM Backend Setup
cd backend
python -m venv venv
call venv\Scripts\activate.bat
pip install Django==4.2.7 djangorestframework==3.14.0 django-cors-headers==4.3.1 requests==2.31.0 anthropic==0.7.7

REM Create .env if not exists
if not exist ".env" (
    echo SECRET_KEY=django-insecure-change-this > .env
    echo DEBUG=True >> .env
    echo ALLOWED_HOSTS=localhost,127.0.0.1 >> .env
    echo GITHUB_CLIENT_ID=your_github_id >> .env
    echo GITHUB_CLIENT_SECRET=your_github_secret >> .env
    echo ANTHROPIC_API_KEY=your_anthropic_key >> .env
)

python manage.py migrate
cd ..

REM Frontend Setup
cd fronted
npm install

if not exist ".env" (
    echo VITE_API_URL=http://localhost:8000 > .env
    echo VITE_GITHUB_CLIENT_ID=your_github_id >> .env
    echo VITE_REDIRECT_URI=http://localhost:3000/auth/callback >> .env
)
cd ..

echo.
echo Setup Complete!
echo Edit .env files, then run: python manage.py createsuperuser
pause