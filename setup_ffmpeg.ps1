$zipPath = "C:\Work\reel-caption-tool\ffmpeg.zip"
$destPath = "C:\Work\reel-caption-tool\ffmpeg_temp"
$binPath = "C:\Work\reel-caption-tool\bin"

if (Test-Path $zipPath) {
    Write-Host "Extracting FFmpeg archive..."
    Expand-Archive -Path $zipPath -DestinationPath $destPath -Force
    
    $ffmpegExe = Get-ChildItem -Path $destPath -Filter "ffmpeg.exe" -Recurse | Select-Object -First 1
    $ffprobeExe = Get-ChildItem -Path $destPath -Filter "ffprobe.exe" -Recurse | Select-Object -First 1

    if ($ffmpegExe) {
        Copy-Item -Path $ffmpegExe.FullName -Destination (Join-Path $binPath "ffmpeg.exe") -Force
        Write-Host "ffmpeg.exe copied to bin"
    }

    if ($ffprobeExe) {
        Copy-Item -Path $ffprobeExe.FullName -Destination (Join-Path $binPath "ffprobe.exe") -Force
        Write-Host "ffprobe.exe copied to bin"
    }

    Remove-Item -Path $destPath -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path $zipPath -Force -ErrorAction SilentlyContinue
    Write-Host "FFmpeg setup complete!"
} else {
    Write-Host "ffmpeg.zip not found yet."
}
