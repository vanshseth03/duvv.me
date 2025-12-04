# ========================================================================
# Master Push Script - Push Both Frontend and Backend
# ========================================================================
# This script orchestrates pushing to both repositories

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "  🚀 DEPLOYING DUVV.ME TO GITHUB" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

$ErrorActionPreference = "Continue"

# Check if git is installed
$gitVersion = git --version 2>$null
if (-not $gitVersion) {
    Write-Host "❌ Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "💡 Install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Git detected: $gitVersion`n" -ForegroundColor Green

# Confirm action
Write-Host "⚠️  This will:" -ForegroundColor Yellow
Write-Host "   1. Clean both GitHub repositories" -ForegroundColor Yellow
Write-Host "   2. Push ONLY essential files" -ForegroundColor Yellow
Write-Host "   3. Force push (overwrite remote)" -ForegroundColor Yellow
Write-Host "`n📦 Frontend Repo: https://github.com/vanshseth03/duvv.me" -ForegroundColor Cyan
Write-Host "📦 Backend Repo:  https://github.com/vanshseth03/duvv.me.api`n" -ForegroundColor Cyan

$confirm = Read-Host "Continue? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "`n❌ Cancelled by user" -ForegroundColor Red
    exit 0
}

Write-Host "`n" -ForegroundColor White

# ========================================================================
# STEP 1: PUSH BACKEND
# ========================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  STEP 1: Pushing Backend API" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

& .\push-backend.ps1

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Backend pushed successfully!`n" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Backend push encountered issues (check output above)`n" -ForegroundColor Yellow
}

Start-Sleep -Seconds 2

# ========================================================================
# STEP 2: PUSH FRONTEND
# ========================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  STEP 2: Pushing Frontend" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

& .\push-frontend.ps1

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Frontend pushed successfully!`n" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Frontend push encountered issues (check output above)`n" -ForegroundColor Yellow
}

# ========================================================================
# COMPLETION
# ========================================================================

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "  🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

Write-Host "✅ Both repositories updated on GitHub`n" -ForegroundColor Green

Write-Host "📦 Frontend Repository:" -ForegroundColor Cyan
Write-Host "   https://github.com/vanshseth03/duvv.me`n" -ForegroundColor White

Write-Host "📦 Backend Repository:" -ForegroundColor Cyan
Write-Host "   https://github.com/vanshseth03/duvv.me.api`n" -ForegroundColor White

Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Deploy Backend to Render:" -ForegroundColor White
Write-Host "      - Go to render.com" -ForegroundColor Gray
Write-Host "      - New Web Service → Connect vanshseth03/duvv.me.api" -ForegroundColor Gray
Write-Host "      - Build: npm install" -ForegroundColor Gray
Write-Host "      - Start: npm start" -ForegroundColor Gray
Write-Host "      - Add environment variables from backend/.env.example`n" -ForegroundColor Gray

Write-Host "   2. Deploy Frontend to Vercel:" -ForegroundColor White
Write-Host "      - Go to vercel.com" -ForegroundColor Gray
Write-Host "      - Import vanshseth03/duvv.me" -ForegroundColor Gray
Write-Host "      - Deploy (vercel.json will handle routing)`n" -ForegroundColor Gray

Write-Host "   3. Update API URL:" -ForegroundColor White
Write-Host "      - Get your Render API URL" -ForegroundColor Gray
Write-Host "      - Update FRONTEND_URL in Render environment" -ForegroundColor Gray
Write-Host "      - Update API_BASE_URL in api-config.js if needed`n" -ForegroundColor Gray

Write-Host "📚 Full deployment guide: Read DEPLOYMENT.md`n" -ForegroundColor Cyan
