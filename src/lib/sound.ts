// Sons do site, sintetizados com Web Audio (sem arquivos). Preferência por navegador, ligada por padrão.
const KEY = 'cses-roadmap:sound';

export function soundOn() {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
}
export function setSoundOn(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {}
}

let ctx: AudioContext | null = null;

/** Devolve o contexto só se o navegador deixar tocar agora (precisa de um gesto do usuário na página). */
async function audio(): Promise<AudioContext | null> {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  try {
    ctx ??= new AC();
    if (ctx.state === 'suspended') await Promise.race([ctx.resume(), new Promise((r) => setTimeout(r, 300))]);
    return ctx.state === 'running' ? ctx : null;
  } catch {
    return null;
  }
}

function note(ac: AudioContext, freq: number, at: number, dur: number, type: OscillatorType, peak: number) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(peak, at + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(at);
  osc.stop(at + dur + 0.02);
}

/** Fanfarra curta de subida de nível: arpejo de dó maior + acorde. `gear` acrescenta um brilho agudo. */
export async function playLevelUp(gear = false) {
  if (!soundOn()) return;
  const ac = await audio();
  if (!ac) return;
  const t = ac.currentTime + 0.03;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => note(ac, f, t + i * 0.1, 0.22, 'triangle', 0.14));
  [523.25, 659.25, 783.99, 1046.5].forEach((f) => note(ac, f, t + 0.42, 0.9, 'sine', 0.07));
  if (gear) [1318.5, 1568, 2093].forEach((f, i) => note(ac, f, t + 0.75 + i * 0.07, 0.35, 'sine', 0.06));
}
