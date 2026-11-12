// A personagem da Jornada. Desenhada com os pés em (0, 0), olhando para a direita, ~52 px de altura.
// Os equipamentos aparecem conforme o nível (ver GEAR em src/lib/journey.ts).
import type { GearKey } from '../../lib/journey.ts';

export function HeroFigure({ gear }: { gear: GearKey[] }) {
  const has = (k: GearKey) => gear.includes(k);
  return (
    <g>
      <ellipse cx="0" cy="1" rx="11" ry="3" fill="#000" opacity="0.28" />
      {has('aura') && <ellipse className="jr-aura" cx="0" cy="-25" rx="21" ry="30" fill="#ffd76a" opacity="0.22" />}
      <g className="jr-bob">
        {has('cape') && <path d="M-5,-30 Q-17,-22 -14,-6 Q-8,-9 -3,-8 Z" fill="#d1495b" />}
        <rect className="jr-leg jr-leg-a" x="-5.5" y="-13" width="4.5" height="13" rx="2" fill="#2b2d42" />
        <rect className="jr-leg jr-leg-b" x="1" y="-13" width="4.5" height="13" rx="2" fill="#3a3d5c" />
        <rect x="-7" y="-31" width="14" height="20" rx="5" fill="#3a86ff" />
        <rect x="-7" y="-17" width="14" height="2.6" fill="#1d4fb8" />
        {has('staff') && (
          <g>
            <line x1="10" y1="-43" x2="10" y2="0" stroke="#a1785c" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="10" cy="-45.5" r="4" fill="#9bf6ff" />
            <circle cx="10" cy="-45.5" r="6.5" fill="#9bf6ff" opacity="0.3" />
          </g>
        )}
        <rect className="jr-arm" x="3" y="-29" width="4.2" height="12" rx="2.1" fill="#f2c9a1" />
        <circle cx="0" cy="-38" r="8" fill="#f2c9a1" />
        {/* cabelo: franja + rabo de cavalo */}
        <path d="M-8.4,-37 A8.4,8.4 0 0 1 8.4,-38.5 Q4,-43 -1,-41.5 Q-5,-40 -5.5,-33 Q-8,-34 -8.4,-37 Z" fill="#6a3fa0" />
        <path d="M-6.5,-42 Q-17,-41 -15,-26 Q-11,-30 -8,-35 Z" fill="#6a3fa0" />
        <circle cx="3.6" cy="-37.5" r="1.15" fill="#2b2d42" />
        <path d="M2.6,-33.6 Q4.4,-32.4 6,-33.8" stroke="#a8674f" strokeWidth="0.9" fill="none" strokeLinecap="round" />
        {has('scarf') && (
          <g fill="#ffcf5c">
            <rect x="-6.5" y="-32" width="13" height="3.8" rx="1.9" />
            <path d="M-5,-30 Q-13,-29 -15,-23 Q-10,-25 -5,-27 Z" />
          </g>
        )}
        {has('crown') && <path d="M-5.5,-45 L-5.5,-51 L-2.7,-48 L0,-52.5 L2.7,-48 L5.5,-51 L5.5,-45 Z" fill="#ffd23f" stroke="#b8860b" strokeWidth="0.6" />}
      </g>
    </g>
  );
}

/** Retrato estático para o painel (HUD). */
export function HeroPortrait({ gear, className = '' }: { gear: GearKey[]; className?: string }) {
  return (
    <svg viewBox="-24 -58 48 62" className={`jr-idle ${className}`} role="img" aria-label="Sua personagem">
      <HeroFigure gear={gear} />
    </svg>
  );
}
