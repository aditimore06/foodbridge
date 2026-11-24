$p = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm start" -PassThru
Start-Sleep -Seconds 5
try {
  node test-api.mjs
} finally {
  Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
  Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*next*" } | Stop-Process -Force -ErrorAction SilentlyContinue
}
