Write-Host "== Search tutorial image references =="
Get-ChildItem -Path .\src -Recurse -File | Where-Object { $_.Extension -in '.tsx','.ts','.css' } | Select-String -Pattern 'chu01|/tutorial/chu01|tutorial\\chu01' | ForEach-Object {
  "$($_.Path):$($_.LineNumber): $($_.Line.Trim())"
}
Write-Host ""
Write-Host "正常なら、/tutorial/chu01.png の参照は src/lib/tutorial.ts か src/components/NoriTutorial.tsx だけです。"
Write-Host "globals.css / AppShell.tsx / home/page.tsx に背景として出ていたら削除してください。"
