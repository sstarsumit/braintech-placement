# One-off: crop each partner logo out of the pasted strip screenshot.
# Finds the heading/logo split by row occupancy, then segments logo columns.
Add-Type -AssemblyName System.Drawing
$src = 'C:\Users\HP\AppData\Local\Temp\freebuff-desktop-pastes\paste-1790387818971-8332.png'
$outDir = 'C:\Users\HP\OneDrive\Desktop\brainplacement\client\public\partners'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$bmp = New-Object System.Drawing.Bitmap($src)
$w = $bmp.Width; $h = $bmp.Height
Write-Output ("src: " + $w + "x" + $h)
$maxX = $w - 45  # ignore right edge (floating WhatsApp/call buttons)

function IsInk([System.Drawing.Color]$c) {
  return (($c.R -lt 235) -or ($c.G -lt 235) -or ($c.B -lt 235))
}

# Row occupancy
$rows = New-Object 'bool[]' $h
for ($y = 0; $y -lt $h; $y++) {
  for ($x = 0; $x -le $maxX; $x++) {
    if (IsInk ($bmp.GetPixel($x, $y))) { $rows[$y] = $true; break }
  }
}

# Content bottom, then longest empty band above it = title/logo gap
$contentBottom = -1
for ($y = $h - 1; $y -ge 0; $y--) { if ($rows[$y]) { $contentBottom = $y; break } }
$bestStart = -1; $bestLen = 0; $curStart = -1
for ($y = 0; $y -lt $contentBottom; $y++) {
  if (-not $rows[$y]) {
    if ($curStart -lt 0) { $curStart = $y }
    if (($y - $curStart + 1) -gt $bestLen) { $bestLen = $y - $curStart + 1; $bestStart = $curStart }
  } else { $curStart = -1 }
}
$logosTop = 0
if ($bestLen -ge 8) { $logosTop = $bestStart + $bestLen }
Write-Output ("logosTop=" + $logosTop + " contentBottom=" + $contentBottom)

# Title color = darkest pixel above the gap
$darkest = 255; $tc = $bmp.GetPixel(0, 0)
for ($y = 0; $y -lt $logosTop; $y++) {
  for ($x = 0; $x -le $maxX; $x++) {
    $c = $bmp.GetPixel($x, $y)
    $lum = [int](0.3 * $c.R + 0.59 * $c.G + 0.11 * $c.B)
    if ($lum -lt $darkest) { $darkest = $lum; $tc = $c }
  }
}
Write-Output ("title color: rgb(" + $tc.R + "," + $tc.G + "," + $tc.B + ")")

# Column occupancy below the gap
$cols = New-Object 'bool[]' $w
for ($x = 0; $x -le $maxX; $x++) {
  for ($y = $logosTop; $y -le $contentBottom; $y++) {
    if (IsInk ($bmp.GetPixel($x, $y))) { $cols[$x] = $true; break }
  }
}

# Runs separated by gaps >= 14px
$gap = 14
$runs = @()
$start = -1; $lastX = -100
for ($x = 0; $x -le $maxX; $x++) {
  if ($cols[$x]) {
    if ($start -lt 0) { $start = $x }
    $lastX = $x
  } elseif ($start -ge 0 -and ($x - $lastX) -ge $gap) {
    $runs += ,@($start, $lastX); $start = -1
  }
}
if ($start -ge 0) { $runs += ,@($start, $lastX) }
Write-Output ("segments: " + $runs.Count)

$i = 0
foreach ($r in $runs) {
  if (($r[1] - $r[0]) -lt 8) { continue }
  $minY = $h; $maxY = -1
  for ($x = $r[0]; $x -le $r[1]; $x++) {
    for ($y = $logosTop; $y -le $contentBottom; $y++) {
      if (IsInk ($bmp.GetPixel($x, $y))) {
        if ($y -lt $minY) { $minY = $y }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }
  if ($maxY -lt 0) { continue }
  $x1 = [Math]::Max(0, $r[0] - 6); $x2 = [Math]::Min($maxX, $r[1] + 6)
  $y1 = [Math]::Max($logosTop, $minY - 6); $y2 = [Math]::Min($contentBottom, $maxY + 6)
  $cw = $x2 - $x1 + 1; $ch = $y2 - $y1 + 1
  $rect = New-Object System.Drawing.Rectangle($x1, $y1, $cw, $ch)
  $crop = $bmp.Clone($rect, $bmp.PixelFormat)
  $i++
  $name = "partner-{0:d2}.png" -f $i
  $crop.Save((Join-Path $outDir $name), [System.Drawing.Imaging.ImageFormat]::Png)
  $crop.Dispose()
  Write-Output ($name + ": " + $cw + "x" + $ch)
}
$bmp.Dispose()
