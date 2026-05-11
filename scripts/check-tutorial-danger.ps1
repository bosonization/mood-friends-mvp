Write-Host "== Checking dangerous tutorial image references =="
$patterns = @("/tutorial/chu01", "chu01.png", "backgroundImage", "background-image")
$paths = @("src", "public", "scripts")
foreach ($pattern in $patterns) {
  Write-Host "`n--- $pattern ---"
  Select-String -Path ($paths | ForEach-Object { Join-Path $_ "*" }) -Pattern $pattern -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
    "$($_.Path):$($_.LineNumber): $($_.Line.Trim())"
  }
}
