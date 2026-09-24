import { useCallback, useEffect, useRef, useState } from 'react';
import './Adventure.css';

const W = 800, H = 450;
const SAVE = 'portfolio-os-kramz-adventure-v1';
const zones = [
  { name: 'BOOT SECTOR', color: '#14253d', accent: '#65dcff', label: 'Learn the controls', portal: 'CODE DISTRICT' },
  { name: 'CODE DISTRICT', color: '#1b2042', accent: '#b69aff', label: 'Recover the source files', portal: 'DATA CENTER' },
  { name: 'DATA CENTER', color: '#172b36', accent: '#6de2ac', label: 'Defeat the corruption', portal: 'SYSTEM CORE' },
  { name: 'SYSTEM CORE', color: '#301a38', accent: '#ff719c', label: 'Restore the OS', portal: 'DESKTOP' },
];
const terminals = [
  { x: 170, y: 140, zone: 0, title: 'WELCOME.LOG', body: 'Mark Real builds practical web experiences and keeps learning with every project.' },
  { x: 570, y: 305, zone: 0, title: 'MISSION.TXT', body: 'Explore the sectors, recover four data fragments, then clear the System Core.' },
  { x: 170, y: 140, zone: 1, title: 'SKILLS.DAT', body: 'React, JavaScript, Python, C++, PHP, Supabase and thoughtful UI design.' },
  { x: 580, y: 285, zone: 1, title: 'DEVELOPER.LOG', body: 'From Dumaguete, Mark studies Computer Science and turns ideas into working software.' },
  { x: 175, y: 155, zone: 2, title: 'CMS.EXE', body: 'Church Management System: online requests, records, scheduling and announcements. Built with React and Supabase.' },
  { x: 565, y: 290, zone: 2, title: 'CSO.EXE', body: 'Computer Science Organization: a deployed web project for the student community.' },
];
const pickups = [
  { x: 390, y: 140, zone: 0, id: 'boot', text: 'BOOT KEY' },
  { x: 380, y: 315, zone: 1, id: 'code', text: 'SOURCE FILE' },
  { x: 382, y: 140, zone: 2, id: 'data', text: 'PROJECT FILE' },
  { x: 380, y: 315, zone: 2, id: 'memory', text: 'MEMORY FILE' },
];
const safeLoad = () => {
  try {
    const value = JSON.parse(localStorage.getItem(SAVE));
    if (value && Number.isInteger(value.zone) && value.zone >= 0 && value.zone <= 3 && Array.isArray(value.found)) return value;
  } catch { /* Ignore damaged or unavailable storage. */ }
  return null;
};
const fresh = () => ({ zone: 0, found: [], kills: 0, won: false });
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

export default function Adventure({ active = true, onOpenWindow }) {
  const canvas = useRef(null);
  const keys = useRef(new Set());
  const state = useRef(null);
  const raf = useRef(0);
  const audio = useRef(null);
  const [screen, setScreen] = useState('title');
  const [hud, setHud] = useState({ hp: 5, zone: 0, found: 0, kills: 0, boss: 12 });
  const [dialog, setDialog] = useState(null);
  const [saved, setSaved] = useState(() => safeLoad());

  const beep = useCallback((frequency = 440, length = .08, type = 'square') => {
    try {
      if (!audio.current) audio.current = new (window.AudioContext || window.webkitAudioContext)();
      const context = audio.current, osc = context.createOscillator(), gain = context.createGain();
      osc.type = type; osc.frequency.setValueAtTime(frequency, context.currentTime);
      gain.gain.setValueAtTime(.035, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + length);
      osc.connect(gain).connect(context.destination); osc.start(); osc.stop(context.currentTime + length);
    } catch { /* Sound is optional. */ }
  }, []);

  const sync = useCallback((s) => {
    setHud({ hp: s.hp, zone: s.zone, found: s.found.length, kills: s.kills, boss: s.boss.hp });
    try { localStorage.setItem(SAVE, JSON.stringify({ zone: s.zone, found: s.found, kills: s.kills, won: s.won })); } catch { /* Private browsing may disallow storage. */ }
  }, []);

  const start = (resume = false) => {
    const record = resume ? safeLoad() || fresh() : fresh();
    const zone = record.won ? 0 : record.zone;
    state.current = {
      zone, found: [...record.found], kills: record.kills, won: record.won,
      hp: 5, player: { x: 80, y: 225, facing: 1, step: 0 },
      enemies: [], particles: [], shots: [], boss: { x: 625, y: 220, hp: 12, phase: 0 },
      invulnerable: 0, attack: 0, dash: 0, tick: 0, message: 'WASD / ARROWS TO MOVE · E TO INTERACT',
      messageUntil: 200, last: performance.now(),
    };
    spawn(state.current);
    sync(state.current);
    setDialog(null); setScreen('playing'); beep(520);
  };

  const spawn = (s) => {
    s.enemies = s.zone === 0 ? [] : Array.from({ length: s.zone === 3 ? 2 : 3 }, (_, i) => ({
      x: 300 + i * 130, y: 100 + (i % 2) * 245, hp: s.zone === 3 ? 3 : 2, seed: i * 2.1,
    }));
  };

  const notice = (s, text, duration = 140) => { s.message = text; s.messageUntil = s.tick + duration; };
  const burst = (s, x, y, color, count = 12) => {
    for (let i = 0; i < count; i++) s.particles.push({ x, y, vx: (Math.random() - .5) * 7, vy: (Math.random() - .5) * 7, life: 32, color });
  };

  const interact = () => {
    const s = state.current;
    if (!s || screen !== 'playing' || dialog) return;
    const terminal = terminals.find(t => t.zone === s.zone && distance(t, s.player) < 73);
    if (terminal) { setDialog(terminal); beep(630); return; }
    if (s.player.x > 680 && Math.abs(s.player.y - 225) < 90) {
      if (s.zone === 0 && !s.found.includes('boot')) { notice(s, 'RECOVER THE BOOT KEY FIRST'); beep(140); return; }
      if (s.zone === 2 && s.found.length < 4) { notice(s, 'RECOVER ALL FOUR DATA FRAGMENTS'); beep(140); return; }
      if (s.zone === 3) { notice(s, 'DEFEAT THE CORE GUARDIAN'); return; }
      s.zone += 1; s.player.x = 85; s.player.y = 225; s.hp = Math.min(5, s.hp + 2);
      s.shots = []; s.particles = []; spawn(s); sync(s); notice(s, `ENTERING ${zones[s.zone].name}`); beep(740, .18);
    }
  };

  const attack = () => {
    const s = state.current;
    if (!s || screen !== 'playing' || dialog || s.attack > 0) return;
    s.attack = 20; beep(180, .09, 'sawtooth');
    const point = { x: s.player.x + s.player.facing * 36, y: s.player.y };
    burst(s, point.x, point.y, '#7aeaff', 5);
    s.enemies = s.enemies.filter(e => {
      if (distance(e, point) > 48) return true;
      e.hp -= 1; burst(s, e.x, e.y, '#ff779d');
      if (e.hp <= 0) { s.kills++; sync(s); return false; }
      return true;
    });
    if (s.zone === 3 && distance(point, s.boss) < 75 && s.boss.hp > 0) {
      s.boss.hp--; burst(s, s.boss.x, s.boss.y, '#ff90ca', 18); sync(s);
      if (s.boss.hp <= 0) {
        s.won = true; sync(s); setScreen('victory'); beep(880, .4); return;
      }
    }
  };

  useEffect(() => {
    if (!active || screen !== 'playing') { keys.current.clear(); return undefined; }
    const down = (e) => {
      if (dialog) { if (e.key === 'Escape' || e.key.toLowerCase() === 'e') setDialog(null); return; }
      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 'a', 's', 'd', 'shift', 'e', 'escape'].includes(key)) e.preventDefault();
      keys.current.add(key);
      if (!e.repeat && key === 'e') interact();
      if (!e.repeat && (key === ' ' || key === 'j')) attack();
      if (!e.repeat && key === 'escape') setScreen('paused');
    };
    const up = e => keys.current.delete(e.key.toLowerCase());
    const blur = () => keys.current.clear();
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', blur);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', blur); keys.current.clear(); };
  }, [active, screen, dialog]);

  useEffect(() => {
    if (!active || screen !== 'playing') return undefined;
    const ctx = canvas.current?.getContext('2d');
    if (!ctx) return undefined;
    const frame = (time) => {
      const s = state.current;
      if (!s) return;
      const dt = Math.min(2, (time - s.last) / 16.67 || 1); s.last = time; s.tick += dt;
      if (!dialog) update(s, dt);
      draw(ctx, s);
      raf.current = requestAnimationFrame(frame);
    };
    raf.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf.current);
  }, [active, screen, dialog]);

  const update = (s, dt) => {
    const k = keys.current, p = s.player;
    const dx = Number(k.has('d') || k.has('arrowright')) - Number(k.has('a') || k.has('arrowleft'));
    const dy = Number(k.has('s') || k.has('arrowdown')) - Number(k.has('w') || k.has('arrowup'));
    const move = Math.hypot(dx, dy) || 1, speed = k.has('shift') ? 5.2 : 3.1;
    p.x = clamp(p.x + dx / move * speed * dt, 30, 760);
    p.y = clamp(p.y + dy / move * speed * dt, 65, 407);
    if (dx) p.facing = dx;
    if (dx || dy) p.step += dt * (k.has('shift') ? .35 : .22);
    s.invulnerable = Math.max(0, s.invulnerable - dt);
    s.attack = Math.max(0, s.attack - dt);
    for (const item of pickups) {
      if (item.zone !== s.zone || s.found.includes(item.id) || distance(item, p) > 30) continue;
      s.found.push(item.id); burst(s, item.x, item.y, '#ffe395', 25); beep(930, .18);
      notice(s, `RECOVERED: ${item.text}  (${s.found.length}/4)`); sync(s);
    }
    for (const e of s.enemies) {
      e.seed += .035 * dt;
      const d = distance(e, p);
      if (d < 260 && d > 20) { e.x += (p.x - e.x) / d * .85 * dt; e.y += (p.y - e.y) / d * .85 * dt; }
      if (d < 32) hurt(s);
    }
    if (s.zone === 3 && s.boss.hp > 0) {
      const b = s.boss;
      b.phase += dt;
      b.y = 225 + Math.sin(b.phase * .025) * 86;
      if (b.phase % 65 < dt * 1.2) {
        const d = distance(b, p) || 1;
        s.shots.push({ x: b.x, y: b.y, vx: (p.x - b.x) / d * 3.2, vy: (p.y - b.y) / d * 3.2 });
      }
      if (distance(b, p) < 70) hurt(s);
    }
    s.shots = s.shots.filter(shot => {
      shot.x += shot.vx * dt; shot.y += shot.vy * dt;
      if (distance(shot, p) < 19) { hurt(s); burst(s, shot.x, shot.y, '#ff8bac', 7); return false; }
      return shot.x > 0 && shot.x < W && shot.y > 0 && shot.y < H;
    });
    s.particles = s.particles.filter(particle => {
      particle.x += particle.vx * dt; particle.y += particle.vy * dt;
      particle.vx *= .96; particle.vy *= .96; particle.life -= dt;
      return particle.life > 0;
    });
  };

  const hurt = (s) => {
    if (s.invulnerable > 0) return;
    s.hp--; s.invulnerable = 65; burst(s, s.player.x, s.player.y, '#ff668b'); beep(110, .22, 'sawtooth');
    sync(s);
    if (s.hp <= 0) setScreen('gameover');
  };

  const draw = (c, s) => {
    const zone = zones[s.zone], t = s.tick;
    c.fillStyle = zone.color; c.fillRect(0, 0, W, H);
    c.strokeStyle = `${zone.accent}1e`; c.lineWidth = 1;
    for (let x = 0; x < W; x += 40) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
    for (let y = 0; y < H; y += 40) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    for (let i = 0; i < 24; i++) {
      const x = (i * 137 + 48) % W, y = (i * 83 + 32) % H;
      c.fillStyle = `${zone.accent}55`; c.fillRect(x, y + Math.sin(t * .018 + i) * 5, 2, 2);
    }
    c.fillStyle = '#0c1729'; c.fillRect(0, 0, W, 45); c.fillRect(0, 420, W, 30);
    c.fillStyle = zone.accent; c.font = 'bold 15px monospace'; c.fillText(`// ${zone.name}`, 22, 28);
    c.font = '12px monospace'; c.fillStyle = '#d7edff'; c.fillText(zone.label.toUpperCase(), 270, 28);
    c.fillStyle = '#162c3b'; c.fillRect(718, 169, 62, 113);
    c.strokeStyle = zone.accent; c.lineWidth = 3; c.strokeRect(718, 169, 62, 113);
    c.fillStyle = zone.accent; c.font = 'bold 11px monospace'; c.fillText('EXIT', 734, 164);
    c.fillText('>>', 738, 232);
    for (const terminal of terminals.filter(item => item.zone === s.zone)) {
      const glow = Math.sin(t * .07) * 3;
      c.fillStyle = '#091522'; c.fillRect(terminal.x - 23, terminal.y - 22, 46, 42);
      c.strokeStyle = zone.accent; c.lineWidth = 2; c.strokeRect(terminal.x - 23, terminal.y - 22, 46, 35);
      c.fillStyle = zone.accent; c.fillRect(terminal.x - 16, terminal.y - 14, 32, 19);
      c.fillStyle = '#132039'; c.font = 'bold 15px monospace'; c.fillText('>_', terminal.x - 12, terminal.y + 1);
      c.fillStyle = '#9db6cd'; c.font = '10px monospace'; c.fillText(terminal.title, terminal.x - 36, terminal.y + 36);
      if (distance(terminal, s.player) < 73) { c.fillStyle = '#ffe395'; c.fillText('[ E ] READ', terminal.x - 32, terminal.y - 35 + glow); }
    }
    for (const item of pickups.filter(v => v.zone === s.zone && !s.found.includes(v.id))) {
      const y = item.y + Math.sin(t * .06) * 6;
      c.save(); c.translate(item.x, y); c.rotate(Math.PI / 4);
      c.fillStyle = '#ffe395'; c.shadowBlur = 20; c.shadowColor = '#ffe395'; c.fillRect(-10, -10, 20, 20); c.restore();
      c.fillStyle = '#fff0b6'; c.font = '10px monospace'; c.fillText(item.text, item.x - 34, item.y + 32);
    }
    for (const e of s.enemies) {
      c.fillStyle = '#ff719c'; c.shadowColor = '#ff719c'; c.shadowBlur = 12;
      c.fillRect(e.x - 13, e.y - 11 + Math.sin(e.seed) * 3, 26, 23);
      c.shadowBlur = 0; c.fillStyle = '#371c3a'; c.fillRect(e.x - 8, e.y - 4, 5, 5); c.fillRect(e.x + 4, e.y - 4, 5, 5);
      c.fillStyle = '#ffb5c9'; c.font = '10px monospace'; c.fillText('bug.exe', e.x - 23, e.y + 28);
    }
    if (s.zone === 3 && s.boss.hp > 0) {
      const b = s.boss; c.save(); c.translate(b.x, b.y); c.rotate(Math.sin(t * .025) * .1);
      c.shadowBlur = 28; c.shadowColor = '#ff508f'; c.fillStyle = '#a93d75'; c.fillRect(-35, -36, 70, 72);
      c.shadowBlur = 0; c.fillStyle = '#ffe0ed'; c.fillRect(-19, -10, 12, 10); c.fillRect(9, -10, 12, 10);
      c.fillStyle = '#201129'; c.fillRect(-15, 11, 32, 6); c.restore();
      c.fillStyle = '#ffb6cd'; c.font = 'bold 12px monospace'; c.fillText('DEADLINE.EXE', b.x - 50, b.y - 52);
      c.fillStyle = '#54273e'; c.fillRect(272, 52, 256, 9); c.fillStyle = '#ff719c'; c.fillRect(272, 52, 256 * b.hp / 12, 9);
    }
    for (const shot of s.shots) { c.fillStyle = '#ff8bad'; c.beginPath(); c.arc(shot.x, shot.y, 7, 0, Math.PI * 2); c.fill(); }
    for (const bit of s.particles) { c.globalAlpha = Math.min(1, bit.life / 20); c.fillStyle = bit.color; c.fillRect(bit.x, bit.y, 4, 4); } c.globalAlpha = 1;
    const p = s.player;
    if (s.invulnerable <= 0 || Math.floor(t / 5) % 2 === 0) {
      c.save(); c.translate(p.x, p.y + Math.sin(p.step) * 2);
      c.fillStyle = '#091522'; c.fillRect(-17, 17, 35, 7);
      c.fillStyle = '#73d7ff'; c.fillRect(-12, -16, 24, 30);
      c.fillStyle = '#e4f8ff'; c.fillRect(-10, -31, 20, 17);
      c.fillStyle = '#234f82'; c.fillRect(p.facing > 0 ? 3 : -8, -23, 5, 5);
      c.fillStyle = '#263a65'; c.fillRect(-11, 14, 9, 10); c.fillRect(3, 14, 9, 10);
      if (s.attack > 8) { c.strokeStyle = '#b1f4ff'; c.lineWidth = 5; c.beginPath(); c.arc(p.facing * 19, 0, 26, -.9, 1.1); c.stroke(); }
      c.restore();
    }
    c.fillStyle = '#dbeeff'; c.font = '11px monospace';
    c.fillText(s.messageUntil > t ? s.message : 'EXPLORE · COLLECT · RESTORE', 20, 441);
    c.fillText('KRAMZ.EXE  //  v1.0', 620, 441);
  };

  return <div className="adventure" tabIndex={0}>
    <div className="adventure-hud"><span>♥ {Array.from({ length: 5 }, (_, i) => i < hud.hp ? '♥' : '♡').join(' ')}</span><span>FRAGMENTS {hud.found}/4</span><span>BUGS {hud.kills}</span><button onClick={() => setScreen(screen === 'playing' ? 'paused' : 'playing')} disabled={!state.current || screen === 'title' || screen === 'victory' || screen === 'gameover'}>{screen === 'paused' ? 'RESUME' : 'PAUSE'}</button></div>
    <div className="adventure-stage">
      <canvas ref={canvas} width={W} height={H} aria-label="Kramz adventure game world" />
      {(screen === 'title' || screen === 'paused' || screen === 'victory' || screen === 'gameover') && <div className="adventure-overlay">
        <div className="adventure-card">
          <div className="adventure-sigil">◆</div>
          <small>PORTFOLIO OS // SYSTEM ADVENTURE</small>
          <h2>{screen === 'victory' ? 'SYSTEM RESTORED' : screen === 'gameover' ? 'SYSTEM CRASHED' : screen === 'paused' ? 'GAME PAUSED' : 'KRAMZ.EXE'}</h2>
          <p>{screen === 'victory' ? 'You recovered the fragments and defeated Deadline.exe. The portfolio is yours to explore.' : screen === 'gameover' ? 'The corruption caught you. Reboot and try again.' : 'Explore Mark’s world, collect project data, fight bugs, and restore the system core.'}</p>
          <div className="adventure-actions">
            {screen === 'title' && saved && <button onClick={() => start(true)}>CONTINUE</button>}
            {screen === 'paused' && <button onClick={() => setScreen('playing')}>RESUME</button>}
            {(screen === 'title' || screen === 'gameover' || screen === 'victory') && <button onClick={() => start(false)}>{screen === 'title' ? 'NEW GAME' : 'RESTART'}</button>}
            {screen === 'victory' && <button onClick={() => onOpenWindow?.('projects')}>VIEW PROJECTS ↗</button>}
          </div>
        </div>
      </div>}
      {dialog && screen === 'playing' && <div className="adventure-dialog"><small>DATA TERMINAL // {dialog.title}</small><p>{dialog.body}</p><button onClick={() => setDialog(null)}>CLOSE [ E ]</button></div>}
    </div>
    <div className="adventure-controls"><span>MOVE <b>WASD / ARROWS</b></span><span>SPRINT <b>SHIFT</b></span><span>ATTACK <b>SPACE / J</b></span><span>READ / EXIT <b>E</b></span><span>PAUSE <b>ESC</b></span></div>
    <div className="adventure-touch"><button onPointerDown={() => keys.current.add('arrowleft')} onPointerUp={() => keys.current.delete('arrowleft')}>←</button><button onPointerDown={() => keys.current.add('arrowup')} onPointerUp={() => keys.current.delete('arrowup')}>↑</button><button onPointerDown={() => keys.current.add('arrowdown')} onPointerUp={() => keys.current.delete('arrowdown')}>↓</button><button onPointerDown={() => keys.current.add('arrowright')} onPointerUp={() => keys.current.delete('arrowright')}>→</button><button onClick={attack}>ATTACK</button><button onClick={interact}>USE</button></div>
  </div>;
}
