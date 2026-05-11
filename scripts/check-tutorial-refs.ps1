Write-Host "== Checking tutorial image references =="
Get-ChildItem -Path .\src -Recurse -File | Where-Object { $_.Extension -in ".ts", ".tsx", ".css" } | Select-String -Pattern "chu01|chu02|chu03|chu04|/tutorial/" | ForEach-Object {
  "{0}:{1}: {2}" -f $_.Path, $_.LineNumber, $_.Line.Trim()
}
Write-Host "Expected references should mainly be src\lib\tutorial.ts and src\components\NoriTutorial.tsx."
