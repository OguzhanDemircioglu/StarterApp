/**
 * Yumuşak giriş animasyonu (airpod animation web referansı): öğe yukarıdan, bulanık ve saydam başlayıp yerine oturur.
 * Seçiciye uyan öğeler ekrana girdikleri anda görünür; aynı anda girenler sırayla (120 ms arayla) gelir.
 * Stiller theme.css'tedir (.mk-reveal / .mk-in). Dönen fonksiyon izlemeyi bırakır.
 */
export function revealOnScroll(root: ParentNode, selector: string): () => void {
  const all = Array.from(root.querySelectorAll<HTMLElement>(selector));
  // İç içe eşleşmede yalnız dıştaki canlanır; aksi halde bulanıklık iki kez uygulanır.
  const targets = all.filter((el) => !all.some((other) => other !== el && other.contains(el)));
  if (!targets.length) {
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries
        .filter((e) => e.isIntersecting)
        .forEach((e, i) => {
          const el = e.target as HTMLElement;
          el.style.setProperty('--mk-delay', `${Math.min(i, 6) * 120}ms`);
          el.classList.add('mk-in');
          observer.unobserve(el);
        });
    },
    { rootMargin: '0px 0px -8% 0px' },
  );

  for (const el of targets) {
    // Aynı öğe yeniden izlenirse (sayfa geçişi) animasyon baştan oynar.
    el.classList.remove('mk-in');
    el.classList.add('mk-reveal');
    observer.observe(el);
  }
  return () => observer.disconnect();
}
