// utils/scramble.ts — efecto "Text Scramble / Decrypt" sin dependencias externas.
// Anima únicamente NODOS DE TEXTO (los elementos anidados y sus colores de
// acento quedan intactos), con resolución progresiva de izquierda a derecha
// vía requestAnimationFrame y disparo único por IntersectionObserver.

const GLYPHS = '!<>-_\\/[]{}—=+*^?#_~01';
const MIN_MS = 350;
const MAX_MS = 500;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Nodos de texto con contenido visible, en orden de documento. */
function textNodesOf(el: Element): Text[] {
  const out: Text[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const t = node as Text;
    if (t.nodeValue && /\S/.test(t.nodeValue)) out.push(t);
  }
  return out;
}

/** Descifra un nodo de texto en `duration` ms, de izquierda a derecha. */
function scrambleNode(node: Text, duration: number): void {
  const original = node.nodeValue ?? '';
  const chars = Array.from(original);
  const n = chars.length;
  if (n === 0) return;
  const t0 = performance.now();

  const tick = (now: number): void => {
    const p = Math.min((now - t0) / duration, 1);
    let pending = false;
    let out = '';
    for (let i = 0; i < n; i++) {
      const c = chars[i];
      if (c === ' ' || c === '\n' || c === '\t' || c === '\u00a0') {
        out += c;
        continue;
      }
      const threshold = n === 1 ? 1 : i / (n - 1);
      if (p >= threshold) {
        out += c;
      } else {
        out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        pending = true;
      }
    }
    node.nodeValue = out;
    if (pending) {
      requestAnimationFrame(tick);
    } else {
      node.nodeValue = original; // restauración exacta, sin artefactos
    }
  };

  requestAnimationFrame(tick);
}

function decryptElement(el: HTMLElement): void {
  if (el.dataset.scrambled === 'done') return;
  el.dataset.scrambled = 'done';
  const nodes = textNodesOf(el);
  if (nodes.length === 0) return;
  if (prefersReducedMotion()) return; // texto base intacto
  const longest = nodes.reduce(
    (m, t) => Math.max(m, Array.from(t.nodeValue ?? '').length),
    0
  );
  const duration = Math.min(MAX_MS, Math.max(MIN_MS, longest * 9));
  nodes.forEach((t) => scrambleNode(t, duration));
}

/**
 * Observa los `[data-scramble]` del scope y los descifra una sola vez al
 * entrar al viewport (threshold 0.2). Sin IO o con reduced-motion, el texto
 * permanece latente e intacto.
 */
export function initScramble(scope: ParentNode = document): void {
  if (typeof window === 'undefined') return;
  const targets = Array.from(scope.querySelectorAll<HTMLElement>('[data-scramble]'));
  if (targets.length === 0) return;
  if (typeof IntersectionObserver === 'undefined' || prefersReducedMotion()) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          io.unobserve(entry.target);
          decryptElement(entry.target as HTMLElement);
        }
      }
    },
    { threshold: 0.2 }
  );
  targets.forEach((t) => io.observe(t));
}
