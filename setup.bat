@echo off
REM 🌱 GreenMate - Windows Setup Script
REM This script sets up the entire GreenMate development environment on Windows

setlocal EnableDelayedExpansion

REM Colors (basic Windows support)
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "CYAN=[96m"
set "NC=[0m"

echo.
echo %GREEN%╔══════════════════════════════════════════════════════════════════╗%NC%
echo %GREEN%║                     🌱 GreenMate Setup                          ║%NC%
echo %GREEN%║              Your AI-Powered Plant Care Companion               ║%NC%
echo %GREEN%╚══════════════════════════════════════════════════════════════════╝%NC%
echo.

echo %BLUE%[STEP]%NC% Setting up GreenMate on Windows...
echo.

REM Check if Node.js is installed
echo %BLUE%[STEP]%NC% Checking prerequisites...
node --version >nul 2>&1
if errorlevel 1 (
    echo %RED%✗%NC% Node.js is not installed
    echo %CYAN%ℹ%NC% Please install Node.js from: https://nodejs.org/
    echo %CYAN%ℹ%NC% Make sure to install version 18 or higher
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo %GREEN%✓%NC% Node.js !NODE_VERSION! is installed
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo %RED%✗%NC% npm is not installed
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo %GREEN%✓%NC% npm !NPM_VERSION! is installed
)

echo %GREEN%✓%NC% All prerequisites are satisfied
echo.

REM Create environment files
echo %BLUE%[STEP]%NC% Setting up environment variables...

if not exist ".env" (
    echo %CYAN%ℹ%NC% Creating root .env file...
    (
    echo # Environment Configuration
    echo NODE_ENV=development
    echo.
    echo # Server Ports
    echo WEB_PORT=3000
    echo API_PORT=3001
    echo.
    echo # Database Configuration
    echo DATABASE_URL="postgresql://admin:greenmate123@localhost:5433/greenmate"
    echo.
    echo # Redis Configuration
    echo REDIS_URL="redis://localhost:6379"
    ) > .env
    echo %GREEN%✓%NC% Root .env file created
) else (
    echo %CYAN%ℹ%NC% Root .env file already exists
)

if not exist "apps" mkdir apps
if not exist "apps\api" mkdir apps\api
if not exist "apps\api\.env" (
    echo %CYAN%ℹ%NC% Creating API .env file...
    (
    echo # Server Configuration
    echo NODE_ENV=development
    echo PORT=3001
    echo CORS_ORIGIN=http://localhost:3000
    echo.
    echo # JWT Configuration ^(REQUIRED for authentication^)
    echo JWT_SECRET=your-super-secret-jwt-key-for-development-minimum-32-characters-long
    echo JWT_REFRESH_SECRET=your-super-secret-refresh-key-for-development-minimum-32-characters-long
    echo JWT_EXPIRES_IN=15m
    echo JWT_REFRESH_EXPIRES_IN=7d
    echo.
    echo # Database Configuration
    echo DATABASE_URL="postgresql://admin:greenmate123@localhost:5433/greenmate"
    echo.
    echo # External API Keys ^(Optional - for full functionality^)
    echo # Get these from the respective services:
    echo # PLANTNET_API_KEY=your-plantnet-api-key
    echo # OPENWEATHER_API_KEY=your-openweather-api-key
    echo # OPENAI_API_KEY=your-openai-api-key
    echo # GOOGLE_MAPS_API_KEY=your-google-maps-api-key
    echo.
    echo # Redis Configuration
    echo REDIS_URL="redis://localhost:6379"
    ) > apps\api\.env
    echo %GREEN%✓%NC% API .env file created
) else (
    echo %CYAN%ℹ%NC% API .env file already exists
)

if not exist "packages" mkdir packages
if not exist "packages\database" mkdir packages\database
if not exist "packages\database\.env" (
    echo %CYAN%ℹ%NC% Creating database .env file...
    (
    echo # Database Configuration
    echo DATABASE_URL="postgresql://admin:greenmate123@localhost:5433/greenmate"
    echo.
    echo # Direct connection ^(for migrations^)
    echo DIRECT_URL="postgresql://admin:greenmate123@localhost:5433/greenmate"
    ) > packages\database\.env
    echo %GREEN%✓%NC% Database .env file created
) else (
    echo %CYAN%ℹ%NC% Database .env file already exists
)

echo.

REM Install dependencies
echo %BLUE%[STEP]%NC% Installing project dependencies...
echo %CYAN%ℹ%NC% Installing root dependencies...
call npm install
if errorlevel 1 (
    echo %RED%✗%NC% Failed to install dependencies
    pause
    exit /b 1
)

echo %CYAN%ℹ%NC% Installing workspace dependencies...
call npm run setup
if errorlevel 1 (
    echo %YELLOW%⚠%NC% Setup command failed - some dependencies might be missing
)

echo %GREEN%✓%NC% Dependencies installation completed
echo.

REM Setup database
echo %BLUE%[STEP]%NC% Setting up database...
echo %CYAN%ℹ%NC% Generating Prisma client...
call npm run db:generate
if errorlevel 1 (
    echo %YELLOW%⚠%NC% Database generation failed - you may need to set up the database manually
)

REM Check if Docker is available
docker --version >nul 2>&1
if errorlevel 1 (
    echo %YELLOW%⚠%NC% Docker is not available - database will need manual setup
    echo %CYAN%ℹ%NC% You can:
    echo %CYAN%ℹ%NC% 1. Install Docker Desktop for Windows
    echo %CYAN%ℹ%NC% 2. Set up PostgreSQL manually
    echo %CYAN%ℹ%NC% 3. Use a cloud database service
) else (
    echo %CYAN%ℹ%NC% Docker is available - you can run 'docker-compose up -d' to start services
)

echo.

REM Create helpful batch files
echo %BLUE%[STEP]%NC% Creating helpful scripts...

if not exist "start.bat" (
    (
    echo @echo off
    echo echo 🌱 Starting GreenMate development servers...
    echo.
    echo REM Start Docker services if available
    echo docker-compose up -d 2^>nul
    echo if not errorlevel 1 ^(
    echo     echo Docker services started
    echo     timeout /t 3 /nobreak ^> nul
    echo ^)
    echo.
    echo REM Start development servers
    echo echo Starting development servers...
    echo npm run dev
    ) > start.bat
    echo %GREEN%✓%NC% Created start.bat script
)

if not exist "stop.bat" (
    (
    echo @echo off
    echo echo 🛑 Stopping GreenMate services...
    echo.
    echo REM Stop Docker services if available
    echo docker-compose down 2^>nul
    echo if not errorlevel 1 ^(
    echo     echo Docker services stopped
    echo ^)
    echo.
    echo echo Services stopped.
    ) > stop.bat
    echo %GREEN%✓%NC% Created stop.bat script
)

echo.

REM Display completion message
echo %GREEN%╔══════════════════════════════════════════════════════════════════╗%NC%
echo %GREEN%║                    🎉 Setup Complete!                           ║%NC%
echo %GREEN%╚══════════════════════════════════════════════════════════════════╝%NC%
echo.
echo %GREEN%✓%NC% GreenMate is ready for development!
echo.
echo %CYAN%📝 Next Steps:%NC%
echo 1. Start development servers:
echo    %YELLOW%start.bat%NC% or %YELLOW%npm run dev%NC%
echo.
echo 2. Open your browser:
echo    %YELLOW%Frontend: http://localhost:3000%NC%
echo    %YELLOW%API: http://localhost:3001%NC%
echo.
echo 3. Access database admin (if Docker is running):
echo    %YELLOW%Adminer: http://localhost:8080%NC%
echo    %YELLOW%Prisma Studio: npm run db:studio%NC%
echo.
echo %CYAN%🔑 Important Files:%NC%
echo    %YELLOW%apps\api\.env%NC% - Configure API keys for full functionality
echo    %YELLOW%README.md%NC% - Detailed project documentation
echo    %YELLOW%DEVELOPMENT.md%NC% - Development guidelines
echo.
echo %CYAN%📚 Documentation:%NC%
echo    %YELLOW%PROJECT_DOCUMENTATION.md%NC% - Complete technical documentation
echo    %YELLOW%BEGINNER_GUIDE_TO_WEB_DEVELOPMENT.md%NC% - Learning guide
echo.
echo %YELLOW%⚠ Note:%NC% Some features require external API keys (Plant identification, Weather, etc.)
echo Add them to apps\api\.env for full functionality.
echo.
echo %GREEN%✓%NC% Happy coding! 🚀🌱
echo.
pause