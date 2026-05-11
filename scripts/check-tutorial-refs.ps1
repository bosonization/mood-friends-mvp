Write-Host "== Check tutorial image references =="
Get-ChildItem -Recurse -File -Include *.tsx,*.ts,*.css,*.scss,*.md `
  | Where-Object { $_.FullName -notmatch "node_modules|\.next|\.git" } `
  | Select-String -Pattern "chu01|chu02|chu03|chu04|/tutorial/" `
  | ForEach-Object { "{0}:{1}: {2}" -f $_.Path, $_.LineNumber, $_.Line.Trim() }
