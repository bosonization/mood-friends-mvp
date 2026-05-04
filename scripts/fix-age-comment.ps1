Write-Host "== eMoodition age comment fix =="

$encoding = New-Object System.Text.UTF8Encoding($false)
$targets = @(
  "src\app\profile\page.tsx",
  "src\app\onboarding\page.tsx",
  "src\app\settings\page.tsx",
  "src\components"
)

$replacements = @(
  @{ From = "20歳未満の場合はカフェ表示になります"; To = "20歳未満の場合は「飲み」は選べません" },
  @{ From = "20歳未満はカフェ表示になります"; To = "20歳未満は「飲み」を選べません" },
  @{ From = "20歳未満の方はカフェ表示になります"; To = "20歳未満の方は「飲み」を選べません" },
  @{ From = "未成年の場合はカフェ表示になります"; To = "20歳未満の場合は「飲み」を選べません" },
  @{ From = "カフェ表示になります"; To = "「飲み」は選べません" },
  @{ From = "20歳未満の場合は、飲みはカフェ表示になります"; To = "20歳未満の場合は、「飲み」は選べません" },
  @{ From = "20歳未満の場合は飲みがカフェ表示になります"; To = "20歳未満の場合は「飲み」を選べません" }
)

$files = @()
foreach ($target in $targets) {
  if (Test-Path $target -PathType Leaf) {
    $files += Get-Item $target
  }
  elseif (Test-Path $target -PathType Container) {
    $files += Get-ChildItem -Path $target -Recurse -Include *.ts,*.tsx
  }
}

$updated = 0
foreach ($file in $files | Sort-Object FullName -Unique) {
  $text = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
  $newText = $text
  foreach ($replacement in $replacements) {
    $newText = $newText.Replace($replacement.From, $replacement.To)
  }

  if ($newText -ne $text) {
    [System.IO.File]::WriteAllText($file.FullName, $newText, $encoding)
    Write-Host "Updated: $($file.FullName)"
    $updated += 1
  }
}

if ($updated -eq 0) {
  Write-Host "No matching text was found. If the wording is slightly different, search manually for 'カフェ表示' or '20歳未満'."
} else {
  Write-Host "Done. Updated $updated file(s)."
}

Write-Host "Next run:"
Write-Host "npm run typecheck"
Write-Host "npm run build"
Write-Host "npm run dev"
