# One-off: crop the founder photo out of the pasted hero screenshot.
# Detects the teal navbar bottom and the white quote-card left edge, then
# saves the photo region as client/public/founder.png.
Add-Type -AssemblyName System.Drawing
$src = 'C:\Users\HP\AppData\Local\Temp\freebuff-desktop-pastes\paste-1790387908998-8332.png'
$dst = 'C:\Users\HP\OneDrive\Desktop\brainplacement\client\public\founder.png'

$bmp = New-Object System.Drawing.Bitmap($src)
$w = $bmp.Width; $h = $bmp.Height
Write-Output ("src: " + $w + "x" + $h)

function IsTeal([System.Drawing.Color]$c) {
  return ([Math]::Abs($c.R - 8) -le 25) -and ([Math]::Abs($c.G - 50) -le 25) -and ([Math]::Abs($c.B - 51) -le 25)
}
function IsWhite([System.Drawing.Color]$c) {
  return ($c.R -ge 245) -and ($c.G -ge 245) -and ($c.B -ge 245)
}

# Teal ends where column x=5 stops being teal for 8 straight pixels.
$tealEnd = 0
$nonTealRun = 0
for ($y = 0; $y -lt $h; $y++) {
  if (IsTeal ($bmp.GetPixel(5, $y))) { $nonTealRun = 0 }
  else {
    $nonTealRun++
    if ($nonTealRun -ge 8) { $tealEnd = $y - 7; break }
  }
}
Write-Output ("tealEnd=" + $tealEnd)

# Card left edge: scan several heights below the sketches, take the rightmost
# white-run start (the card edge is consistent; photo whites are localized).
$cardLeft = $w
foreach ($yy in @(150, 480, 520, 560, 600, 640)) {
  for ($x = 700; $x -lt $w - 40; $x++) {
    $allWhite = $true
    for ($k = 0; $k -lt 40; $k++) {
      if (-not (IsWhite ($bmp.GetPixel($x + $k, $yy)))) { $allWhite = $false; break }
    }
    if ($allWhite) { if ($x -gt ($w - $cardLeft)) { $cardLeft = $w - $x }; break }
  }
}
$cardLeft = $w - $cardLeft
Write-Output ("cardLeft=" + $cardLeft)

$rightEdge = [Math]::Min($w, $cardLeft - 2)
$cropW = $rightEdge
$cropH = $h - $tealEnd
$rect = New-Object System.Drawing.Rectangle(0, $tealEnd, $cropW, $cropH)
$crop = $bmp.Clone($rect, $bmp.PixelFormat)
$crop.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
$crop.Dispose()
$bmp.Dispose()
Write-Output ("saved founder.png " + $cropW + "x" + $cropH)
