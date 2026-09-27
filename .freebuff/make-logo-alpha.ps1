# One-off: make the background outside the logo's ring circle transparent.
# Detects the ring bounds by scanning for non-background pixels, then alpha-masks
# everything outside the enclosing circle. Interior (disc, gaps) is preserved.
Add-Type -AssemblyName System.Drawing
$src = 'C:\Users\HP\OneDrive\Desktop\brainplacement\client\public\logo-mark.png'
$dst = 'C:\Users\HP\OneDrive\Desktop\brainplacement\client\public\logo-mark-alpha.png'

$bmp = New-Object System.Drawing.Bitmap($src)
$w = $bmp.Width; $h = $bmp.Height
$c0 = $bmp.GetPixel(2, 2)
$tol = 30

function IsBg([System.Drawing.Color]$c) {
  return (
    ([Math]::Abs($c.R - $c0.R) -le $tol) -and
    ([Math]::Abs($c.G - $c0.G) -le $tol) -and
    ([Math]::Abs($c.B - $c0.B) -le $tol)
  )
}

# Bounding box of non-background pixels (the ring).
$minX = $w; $maxX = -1; $minY = $h; $maxY = -1
for ($y = 0; $y -lt $h; $y++) {
  for ($x = 0; $x -lt $w; $x++) {
    if (-not (IsBg ($bmp.GetPixel($x, $y)))) {
      if ($x -lt $minX) { $minX = $x }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
}
Write-Output ("bounds: x " + $minX + ".." + $maxX + "  y " + $minY + ".." + $maxY)

# Enclosing circle of that box, with a small feather margin.
$cxF = ($minX + $maxX) / 2.0
$cyF = ($minY + $maxY) / 2.0
$rF  = [Math]::Max(($maxX - $minX), ($maxY - $minY)) / 2.0 + 2.5

$removed = 0
for ($y = 0; $y -lt $h; $y++) {
  for ($x = 0; $x -lt $w; $x++) {
    $dx = $x - $cxF; $dy = $y - $cyF
    if ([Math]::Sqrt($dx * $dx + $dy * $dy) -gt $rF) {
      $c = $bmp.GetPixel($x, $y)
      $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, $c.R, $c.G, $c.B))
      $removed++
    }
  }
}

$bmp.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Output ("removed=" + $removed + " of " + ($w * $h))
