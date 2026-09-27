# One-off: produce logo-full-alpha.png from logo-full.png.
# 1) Chroma-key the baked teal background (#093C3E) with a soft ramp.
# 2) Paste logo-mark-alpha.png over the ring position (aligned by ring bounding
#    box) so the dark disc — nearly the same color as the old background —
#    stays opaque instead of being keyed out.
Add-Type -AssemblyName System.Drawing
$root = 'C:\Users\HP\OneDrive\Desktop\brainplacement\client\public'
$full = [System.Drawing.Bitmap]::FromFile("$root\logo-full.png")
$mark = [System.Drawing.Bitmap]::FromFile("$root\logo-mark-alpha.png")

function RingBBox($bmp) {
  $minX = $bmp.Width; $minY = $bmp.Height; $maxX = -1; $maxY = -1
  for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
      $p = $bmp.GetPixel($x, $y)
      if ($p.A -gt 200) {
        $mx = [Math]::Max($p.R, [Math]::Max($p.G, $p.B))
        $mn = [Math]::Min($p.R, [Math]::Min($p.G, $p.B))
        if (($mx - $mn) -gt 70) {
          if ($x -lt $minX) { $minX = $x }
          if ($x -gt $maxX) { $maxX = $x }
          if ($y -lt $minY) { $minY = $y }
          if ($y -gt $maxY) { $maxY = $y }
        }
      }
    }
  }
  return @($minX, $minY, $maxX, $maxY)
}

$bbF = RingBBox $full
$bbM = RingBBox $mark
"full ring bbox: $($bbF -join ',')  mark ring bbox: $($bbM -join ',')"

# Chroma-key the teal background with smooth alpha edges.
$bgR = 9; $bgG = 60; $bgB = 62
$lo = 28.0; $hi = 85.0
$out = New-Object System.Drawing.Bitmap($full.Width, $full.Height)
$removed = 0
for ($y = 0; $y -lt $full.Height; $y++) {
  for ($x = 0; $x -lt $full.Width; $x++) {
    $p = $full.GetPixel($x, $y)
    $d = [Math]::Sqrt([Math]::Pow($p.R - $bgR, 2) + [Math]::Pow($p.G - $bgG, 2) + [Math]::Pow($p.B - $bgB, 2))
    $a = 255
    if ($d -le $lo) { $a = 0; $removed++ }
    elseif ($d -lt $hi) { $a = [int]((($d - $lo) / ($hi - $lo)) * 255) }
    $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($a, $p.R, $p.G, $p.B))
  }
}
"keyed out $removed px"

# Paste the transparent mark over its original position (alpha-over compositing).
$offX = $bbF[0] - $bbM[0]
$offY = $bbF[1] - $bbM[1]
for ($my = 0; $my -lt $mark.Height; $my++) {
  for ($mx = 0; $mx -lt $mark.Width; $mx++) {
    $p = $mark.GetPixel($mx, $my)
    if ($p.A -le 0) { continue }
    $dx = $mx + $offX; $dy = $my + $offY
    if ($dx -lt 0 -or $dy -lt 0 -or $dx -ge $out.Width -or $dy -ge $out.Height) { continue }
    if ($p.A -ge 255) {
      $out.SetPixel($dx, $dy, $p)
    } else {
      $d0 = $out.GetPixel($dx, $dy)
      $na = $p.A + [int]($d0.A * (255 - $p.A) / 255)
      if ($na -le 0) { $out.SetPixel($dx, $dy, $d0); continue }
      $nr = [int](($p.R * $p.A + $d0.R * $d0.A * (255 - $p.A) / 255) / $na)
      $ng = [int](($p.G * $p.A + $d0.G * $d0.A * (255 - $p.A) / 255) / $na)
      $nb = [int](($p.B * $p.A + $d0.B * $d0.A * (255 - $p.A) / 255) / $na)
      $out.SetPixel($dx, $dy, [System.Drawing.Color]::FromArgb($na, $nr, $ng, $nb))
    }
  }
}

$out.Save("$root\logo-full-alpha.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Verify: corners transparent, disc opaque, text opaque.
$v = [System.Drawing.Bitmap]::FromFile("$root\logo-full-alpha.png")
$cxA = [int](($bbM[0] + $bbM[2]) / 2) + $offX
$cyA = [int](($bbM[1] + $bbM[3]) / 2) + $offY
$disc = $v.GetPixel($cxA, $cyA)
$bright = $null; $best = 0
for ($y = 0; $y -lt $v.Height; $y++) {
  for ($x = [int]($v.Width * 0.55); $x -lt $v.Width; $x++) {
    $p = $v.GetPixel($x, $y)
    if ($p.A -gt 200 -and ($p.R + $p.G + $p.B) -gt $best) { $best = $p.R + $p.G + $p.B; $bright = $p }
  }
}
"corner alpha: $($v.GetPixel(1,1).A)  disc($cxA,$cyA) alpha: $($disc.A) rgb: $($disc.R),$($disc.G),$($disc.B)  text alpha: $($bright.A)"
$v.Dispose(); $out.Dispose(); $full.Dispose(); $mark.Dispose()
"saved $root\logo-full-alpha.png"