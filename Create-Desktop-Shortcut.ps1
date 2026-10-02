# PowerShell script to create a Desktop Shortcut for FlowCreator Studio Pro
$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath('Desktop')
$ShortcutPath = Join-Path -Path $DesktopPath -ChildPath "FlowCreator Studio Pro.lnk"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$TargetPath = Join-Path -Path $ScriptDir -ChildPath "Launch-Desktop-App.bat"
$IconPath = Join-Path -Path $ScriptDir -ChildPath "assets\icon.ico"

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $TargetPath
$Shortcut.WorkingDirectory = $ScriptDir
$Shortcut.Description = "FlowCreator Studio Pro - Hardware GPU Accelerated Reel Maker"

if (Test-Path $IconPath) {
    $Shortcut.IconLocation = "$IconPath, 0"
}

$Shortcut.Save()
Write-Host "==========================================================" -ForegroundColor Green
Write-Host " SUCCESS: Desktop Shortcut Created!" -ForegroundColor Yellow
Write-Host " Shortcut: $ShortcutPath" -ForegroundColor Cyan
Write-Host " Target:   $TargetPath" -ForegroundColor White
Write-Host " You can now launch FlowCreator Studio directly from your Desktop!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
