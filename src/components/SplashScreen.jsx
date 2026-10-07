import { useEffect, useState } from "react";

// Chave usada para mostrar a abertura só uma vez por sessão do app
const SPLASH_KEY = "ev:splash-shown";

// Tempo total da animação (ms) e da saída (ms)
const DURATION = 2400;
const EXIT_DURATION = 600;

// Cores fixas (a abertura é sempre escura, independente do tema do site)
const BG = "#1c1512";
const TERRA = "#d4805f";
const TERRA_SOFT = "#e8a98a";
const TEXT_SOFT = "rgba(236, 222, 210, 0.6)";

const TITLE = "Entre Versos";

/**
 * Decide se a abertura deve aparecer:
 * - só quando o site está rodando como app instalado (tela de início);
 * - só uma vez por sessão;
 * - dá para forçar nos testes abrindo o site com ?splash=1 na URL.
 */
export function shouldShowSplash() {
  if (typeof window === "undefined") return false;

  const params = new URLSearchParams(window.location.search);
  if (params.get("splash") === "1") return true;

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
  if (!isStandalone) return false;

  try {
    return !sessionStorage.getItem(SPLASH_KEY);
  } catch {
    return true;
  }
}

export function SplashScreen({ onFinish }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.setItem(SPLASH_KEY, "1");
    } catch {
      // sessionStorage indisponível: segue sem registrar
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const total = reduceMotion ? 800 : DURATION;

    const leaveTimer = setTimeout(() => setLeaving(true), total);
    const finishTimer = setTimeout(onFinish, total + EXIT_DURATION);

    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundColor: BG,
        opacity: leaving ? 0 : 1,
        transform: leaving ? "scale(1.06)" : "scale(1)",
        filter: leaving ? "blur(6px)" : "blur(0)",
        transition: `opacity ${EXIT_DURATION}ms ease, transform ${EXIT_DURATION}ms ease, filter ${EXIT_DURATION}ms ease`,
      }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes ev-pop {
          0% { transform: scale(0.35) rotate(-10deg); opacity: 0; }
          60% { transform: scale(1.1) rotate(3deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes ev-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes ev-ring {
          0% { transform: scale(0.55); opacity: 0.55; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes ev-letter {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ev-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ev-blob-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -30px) scale(1.2); }
        }
        @keyframes ev-blob-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-40px, 30px) scale(1.15); }
        }
        @keyframes ev-bar {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes ev-shimmer {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ev-anim, .ev-anim * { animation-duration: 0.01ms !important; animation-delay: 0ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>

      {/* Manchas de luz ao fundo */}
      <div
        className="ev-anim absolute -top-24 -left-24 w-80 h-80 rounded-full"
        style={{
          background: TERRA,
          opacity: 0.16,
          filter: "blur(80px)",
          animation: "ev-blob-a 6s ease-in-out infinite",
        }}
      />
      <div
        className="ev-anim absolute -bottom-28 -right-24 w-96 h-96 rounded-full"
        style={{
          background: TERRA,
          opacity: 0.12,
          filter: "blur(90px)",
          animation: "ev-blob-b 7s ease-in-out infinite",
        }}
      />

      <div className="ev-anim relative flex flex-col items-center">
        {/* Logo com anéis pulsando */}
        <div className="relative flex items-center justify-center w-44 h-44">
          {[0, 0.7].map((delay) => (
            <span
              key={delay}
              className="absolute inset-0 rounded-full"
              style={{
                border: `2px solid ${TERRA}`,
                opacity: 0,
                animation: `ev-ring 2s ease-out ${0.5 + delay}s infinite`,
              }}
            />
          ))}

          <div
            style={{
              animation: "ev-pop 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) both",
            }}
          >
            <img
              src="/icons/logo.png"
              alt=""
              draggable="false"
              className="w-28 h-auto select-none"
              style={{
                filter: "drop-shadow(0 0 22px rgba(212, 128, 95, 0.4))",
                animation: "ev-float 3s ease-in-out 1s infinite",
              }}
            />
          </div>
        </div>

        {/* Título letra por letra */}
        <h1
          className="mt-6 font-serif text-3xl font-semibold flex"
          style={{ color: TERRA }}
        >
          {TITLE.split("").map((char, i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity: 0,
                animation: `ev-letter 0.5s ease-out ${0.9 + i * 0.05}s forwards`,
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h1>

        <p
          className="mt-2 text-xs tracking-wide"
          style={{
            color: TEXT_SOFT,
            opacity: 0,
            animation: "ev-fade-up 0.6s ease-out 1.6s forwards",
          }}
        >
          Palavras que encontram sentimentos.
        </p>

        {/* Barra de carregamento */}
        <div
          className="mt-10 w-40 h-1.5 rounded-full overflow-hidden relative"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            opacity: 0,
            animation: "ev-fade-up 0.5s ease-out 0.8s forwards",
          }}
        >
          <div
            className="absolute inset-0 rounded-full origin-left"
            style={{
              background: `linear-gradient(90deg, ${TERRA}, ${TERRA_SOFT})`,
              animation: `ev-bar ${DURATION - 900}ms cubic-bezier(0.4, 0, 0.2, 1) 0.9s forwards`,
              transform: "scaleX(0)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
              animation: "ev-shimmer 1.2s ease-in-out 1s infinite",
            }}
          />
        </div>
      </div>
    </div>
  );
}