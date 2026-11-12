// O avatar do site. Desenhado com os pés em (0, 0), olhando para a direita, ~52 px de altura.
// A aparência (pele, cabelo, roupa, acessório) é escolhida pela pessoa (src/lib/profile.ts);
// os equipamentos aparecem conforme o nível (GEAR em src/lib/journey.ts).
import type { GearKey } from '../../lib/journey.ts';
import { DEFAULT_LOOK, HAIR_COLOR, OUTFIT, SKIN, type AvatarLook } from '../../lib/profile.ts';

function Hair({ style, color }: { style: AvatarLook['hair']; color: string }) {
  const cap = <path d="M-8.4,-37 A8.4,8.4 0 0 1 8.4,-38.5 Q4,-43 -1,-41.5 Q-5,-40 -5.5,-33 Q-8,-34 -8.4,-37 Z" fill={color} />;
  switch (style) {
    case 'curto':
      return (
        <>
          {cap}
          <path d="M-8.3,-40 Q-10.6,-36 -8.6,-31.5 L-5.8,-34 Z" fill={color} />
        </>
      );
    case 'longo':
      return (
        <>
          <path d="M-6.5,-43 Q-13.5,-39 -12.5,-25 Q-9.5,-21.5 -5.5,-25 L-5.5,-37 Z" fill={color} />
          {cap}
        </>
      );
    case 'cacheado':
      return (
        <g fill={color}>
          <circle cx="-9.3" cy="-33.5" r="3" />
          <circle cx="-9.2" cy="-38.6" r="3.8" />
          <circle cx="-6" cy="-43.2" r="4.2" />
          <circle cx="-1" cy="-45.6" r="4.5" />
          <circle cx="4.4" cy="-44.6" r="4" />
          <circle cx="8" cy="-41.4" r="2.9" />
          <circle cx="-3" cy="-41" r="4" />
        </g>
      );
    default:
      return (
        <>
          {cap}
          <path d="M-6.5,-42 Q-17,-41 -15,-26 Q-11,-30 -8,-35 Z" fill={color} />
        </>
      );
  }
}

export function HeroFigure({ gear, look = DEFAULT_LOOK }: { gear: GearKey[]; look?: AvatarLook }) {
  const has = (k: GearKey) => gear.includes(k);
  const skin = SKIN[look.skin];
  return (
    <g>
      <ellipse cx="0" cy="1" rx="11" ry="3" fill="#000" opacity="0.28" />
      {has('aura') && <ellipse className="jr-aura" cx="0" cy="-25" rx="21" ry="30" fill="#ffd76a" opacity="0.22" />}
      <g className="jr-bob">
        {has('cape') && <path d="M-5,-30 Q-17,-22 -14,-6 Q-8,-9 -3,-8 Z" fill="#d1495b" />}
        <rect className="jr-leg jr-leg-a" x="-5.5" y="-13" width="4.5" height="13" rx="2" fill="#2b2d42" />
        <rect className="jr-leg jr-leg-b" x="1" y="-13" width="4.5" height="13" rx="2" fill="#3a3d5c" />
        <rect x="-7" y="-31" width="14" height="20" rx="5" fill={OUTFIT[look.outfit]} />
        <rect x="-7" y="-17" width="14" height="2.6" fill="#000" opacity="0.32" />
        {has('staff') && (
          <g>
            <line x1="10" y1="-43" x2="10" y2="0" stroke="#a1785c" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="10" cy="-45.5" r="4" fill="#9bf6ff" />
            <circle cx="10" cy="-45.5" r="6.5" fill="#9bf6ff" opacity="0.3" />
          </g>
        )}
        <rect className="jr-arm" x="3" y="-29" width="4.2" height="12" rx="2.1" fill={skin} />
        <circle cx="0" cy="-38" r="8" fill={skin} />
        <Hair style={look.hair} color={HAIR_COLOR[look.hairColor]} />
        <circle cx="3.6" cy="-37.5" r="1.15" fill="#1b1b24" />
        <path d="M2.6,-33.6 Q4.4,-32.4 6,-33.8" stroke="#000" strokeOpacity="0.4" strokeWidth="0.9" fill="none" strokeLinecap="round" />
        {look.extra === 'oculos' && (
          <g stroke="#1b1b24" strokeWidth="0.9" fill="none">
            <circle cx="3.9" cy="-37.5" r="2.7" fill="#fff" fillOpacity="0.25" />
            <path d="M1.2,-37.8 L-7.6,-38.8" />
          </g>
        )}
        {look.extra === 'faixa' && <path d="M-8.2,-41 Q0,-45.2 8.2,-40.6 L8.3,-38.4 Q0,-42.8 -8.4,-38.8 Z" fill="#ef4444" />}
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

/** Retrato estático (painéis, cabeçalhos, editor de avatar). */
export function HeroPortrait({ gear, look, className = '', label = 'Seu avatar' }: { gear: GearKey[]; look?: AvatarLook; className?: string; label?: string }) {
  return (
    <svg viewBox="-24 -58 48 62" className={`jr-idle ${className}`} role="img" aria-label={label}>
      <HeroFigure gear={gear} look={look} />
    </svg>
  );
}
