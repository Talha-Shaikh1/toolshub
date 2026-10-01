$iconPath = "C:\Work\reel-caption-tool\assets\app_icon.ico"
$targetBat = "C:\Work\reel-caption-tool\run_tool.bat"
$workDir = "C:\Work\reel-caption-tool"
$shortcutName = "Reel Creator Studio & 4K-8K.lnk"

# Locations to update
$desktops = @(
    [Environment]::GetFolderPath("Desktop"),
    "C:\Users\Talha Shaikh\OneDrive\Desktop",
    "C:\Users\Talha Shaikh\Desktop"
) | Select-Object -Unique | Where-Object { Test-Path $_ }

$WshShell = New-Object -ComObject WScript.Shell

foreach ($desk in $desktops) {
    # Remove older variants
    Get-ChildItem -Path $desk -Filter "*Reel*Studio*.lnk" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue

    $lnkPath = Join-Path $desk $shortcutName
    $Shortcut = $WshShell.CreateShortcut($lnkPath)
    $Shortcut.TargetPath = $targetBat
    $Shortcut.WorkingDirectory = $workDir
    $Shortcut.Description = "Reel Creator Studio (Captions, 4K & 8K Bulk Enhancer)"
    $Shortcut.IconLocation = "$iconPath,0"
    $Shortcut.Save()

    Write-Host "Created shortcut with custom icon at: $lnkPath"
}

try {
    Start-Process ie4uinit.exe -ArgumentList "-show" -Wait -ErrorAction SilentlyContinue
} catch {}

Write-Host "Desktop shortcut icons updated successfully!"
