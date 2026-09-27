const R = 44;
const CX = 50;
const CY = 50;

// Segments of 54° with 6° gaps, starting 2° past 12 o'clock, clockwise.
const SEGMENTS = [
  ['#eb5757', 2, 56],    // red
  ['#f2994a', 62, 116],  // orange
  ['#f2c94c', 122, 176], // yellow
  ['#27ae60', 182, 236], // green
  ['#2d9cdb', 242, 296], // blue
  ['#9b51e0', 302, 356]  // purple
];

function arc(a1, a2) {
  const rad = (a) => ((a - 90) * Math.PI) / 180;
  const x1 = CX + R * Math.cos(rad(a1));
  const y1 = CY + R * Math.sin(rad(a1));
  const x2 = CX + R * Math.cos(rad(a2));
  const y2 = CY + R * Math.sin(rad(a2));
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

export default function Logo({ size = 62, label = 'Braintech logo' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={label}>
      <g fill="none" strokeWidth="10">
        {SEGMENTS.map(([color, a1, a2]) => (
          <path key={color} d={arc(a1, a2)} stroke={color} />
        ))}
      </g>

      {/* inner disc */}
      <circle cx={CX} cy={CY} r="36" fill="#14313d" />

      {/* red walking figure */}
      <g stroke="#e02b2b" strokeWidth="4.5" strokeLinecap="round" fill="none">
        <path d="M52 45 C51 51 51 55 50 59" />
        <path d="M50 59 L57 66 L61 73" />
        <path d="M50 59 L44 66 L40 74" />
        <path d="M52 48 L59 53" />
        <path d="M51 48 L44 52" />
      </g>
      <circle cx="53" cy="38" r="5" fill="#e02b2b" />

      {/* clock, upper left */}
      <circle cx="33" cy="29" r="9.5" fill="#ffffff" />
      <g stroke="#14313d" strokeWidth="2" strokeLinecap="round">
        <path d="M33 29 L33 23.5" />
        <path d="M33 29 L37.5 30.5" />
      </g>
    </svg>
  );
}
