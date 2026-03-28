@echo off
echo ==============================================
echo Deploying Bridge AI to Google Cloud App Engine
echo ==============================================
cd /d "%~dp0"

echo [1/2] Building the production assets...
call npm run build

echo [2/2] Pushing to Google Cloud Project...
call gcloud app deploy app.yaml --quiet

echo.
echo Deployment attempted! If successful, your app is now live.
pause
