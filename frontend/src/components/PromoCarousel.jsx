import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./PromoCarousel.module.css";

export default function PromoCarousel({ slides = [], interval = 4000, onDot, onPrev, onNext }) {
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);
  const hovering = useRef(false);

  const safeSlides = useMemo(() => slides.filter(Boolean), [slides]);

  useEffect(() => {
    clearInterval(timer.current);
    if (!safeSlides.length) return;
    timer.current = setInterval(() => {
      if (!hovering.current) setIdx((i) => (i + 1) % safeSlides.length);
    }, interval);
    return () => clearInterval(timer.current);
  }, [safeSlides, interval]);

  if (!safeSlides.length) return null;

  const go = (n) => setIdx(((n % safeSlides.length) + safeSlides.length) % safeSlides.length);

  return (
    <section
      className={styles.hero}
      onMouseEnter={() => (hovering.current = true)}
      onMouseLeave={() => (hovering.current = false)}
    >
      <div className={styles.track} style={{ transform: `translateX(-${idx * 100}%)` }}>
        {safeSlides.map((s, i) => (
          <article key={i} className={styles.slide}>
            <img className={styles.bg} src={s.image} alt={s.title} />
            <div className={styles.overlay} />
            <div className={styles.content}>
              {s.kicker ? <span className={styles.kicker}>{s.kicker}</span> : <span className={styles.kicker}>Destacado</span>}
              <h2 className={styles.title}>{s.title}</h2>
              {s.subtitle ? <p className={styles.subtitle}>{s.subtitle}</p> : null}
              {s.ctaText ? (
                <button className={styles.cta} onClick={s.onClick}>
                  {s.ctaText}
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <button
        className={`${styles.nav} ${styles.prev}`}
        onClick={() => {
          go(idx - 1);
          onPrev?.(idx);
        }}
        aria-label="Anterior"
      >
        ‹
      </button>
      <button
        className={`${styles.nav} ${styles.next}`}
        onClick={() => {
          go(idx + 1);
          onNext?.(idx);
        }}
        aria-label="Siguiente"
      >
        ›
      </button>

      <div className={styles.dots}>
        {safeSlides.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === idx ? styles.active : ""}`}
            onClick={() => {
              go(i);
              onDot?.(i);
            }}
            aria-label={`Ir al slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
