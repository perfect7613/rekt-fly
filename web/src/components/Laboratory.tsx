"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Activity,
  Plus,
  Minus,
  Download,
  FlaskConical,
  ExternalLink,
  X,
  Bug,
  CircleHelp,
  ChevronDown,
  Zap,
  Check,
  Eye,
} from "lucide-react";
import {
  Game,
  POOLS,
  type Circuit,
  type Ablation,
  type GameState,
} from "@/lib/simulation";
import World from "./World";
import BrainView from "./BrainView";
import Challenge from "./Challenge";
import { FirstSteps, ReadingNeurons } from "./Learn";
const time = (n: number) =>
  `${Math.floor(n / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(n % 60)
    .toString()
    .padStart(2, "0")}`;
const money = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 0 });
function Chart({ values }: { values: number[] }) {
  const points = values
    .map(
      (v, i) =>
        `${(i / Math.max(1, values.length - 1)) * 400},${62 - ((v - 1200) / 850) * 55}`,
    )
    .join(" ");
  return (
    <svg
      className="price-chart"
      viewBox="0 0 400 68"
      preserveAspectRatio="none"
      role="img"
      aria-label="Simulated ETH price history"
    >
      <path
        d="M0 60 H400 M0 30 H400"
        stroke="currentColor"
        opacity=".09"
        strokeDasharray="3 4"
      />
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
export default function Laboratory() {
  const [game, setGame] = useState<Game | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [view, setView] = useState<"arena" | "specimen">("arena");
  const [modal, setModal] = useState<"guide" | "sources" | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const openModal = (value: "guide" | "sources") => {
    opener.current = document.activeElement as HTMLElement;
    setModal(value);
  };
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const reportError = useCallback((message: string) => setError(message), []);
  useEffect(() => {
    const abort = new AbortController();
    fetch("/data/escape-circuit.json", { signal: abort.signal })
      .then((r) => {
        if (!r.ok) throw new Error("Dataset request failed");
        return r.json();
      })
      .then((c: Circuit) => {
        const g = new Game(c);
        setGame(g);
        setState({ ...g.state });
      })
      .catch((e) => {
        if (e.name !== "AbortError")
          setError("Could not load the real circuit dataset. Reload to retry.");
      });
    return () => abort.abort();
  }, []);
  useEffect(() => {
    if (!game) return;
    const id = setInterval(() => {
      if (document.hidden) return;
      for (let i = 0; i < game.state.speed; i++) game.tick();
      setState({ ...game.state });
    }, 100);
    return () => clearInterval(id);
  }, [game]);
  const mutate = (fn: (g: Game) => void) => {
    if (!game) return;
    fn(game);
    setState({ ...game.state });
  };
  const toggle = () =>
    mutate((g) => {
      if (g.state.status === "survived" || g.state.status === "liquidated")
        g.reset();
      g.state.status = g.state.status === "running" ? "paused" : "running";
      if (g.state.time === 0)
        g.log("Market running. Visual neurons are receiving threat input.");
    });
  const exportRun = () => {
    if (!game) return;
    const blob = new Blob(
      [
        JSON.stringify(
          {
            version: 1,
            scope: game.circuit.meta,
            state: game.state,
            notice:
              "Local educational practice run; not an onchain result or a validated biological experiment.",
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rekt-fly-seed-${game.state.seed}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  useEffect(() => {
    if (!modal) return;
    const previous = opener.current;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModal(null);
      if (event.key !== "Tab") return;
      const items = Array.from(
        document.querySelectorAll<HTMLElement>(".modal button, .modal a"),
      );
      const first = items[0],
        last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      previous?.focus();
    };
  }, [modal]);
  const s = state;
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="REKT FLY home">
          <span className="brand-icon">
            <Bug size={22} />
          </span>{" "}
          REKT<span className="brand-light">FLY</span>
          <span className="version">LAB / 001</span>
        </Link>
        <nav>
          <span className="nav-active">Experiment</span>
          <a href="#testnet">Sepolia ↗</a>
          <button onClick={() => openModal("sources")}>
            Sources <ArrowUpRight size={13} />
          </button>
          <button onClick={() => openModal("guide")}>
            How to play <CircleHelp size={14} />
          </button>
        </nav>
        <div className="testnet">
          <span /> VIRTUAL ASSETS ONLY
        </div>
      </header>
      <main>
        <section className="intro">
          <div>
            <div className="eyebrow">
              <span className="tiny-cross">✳</span> AN EXPERIMENT IN BIOLOGICAL
              FINANCE
            </div>
            <h1>
              A small brain.
              <br className="mobile-break" /> A volatile world.
            </h1>
            <p>
              A fruit fly’s escape circuit meets DeFi. Can you keep its position
              alive?
            </p>
          </div>
          <div className="experiment-tag">
            <span>EXPERIMENT 001</span>
            <strong>Liquidation survival</strong>
            <small>
              03:00 duration <i /> Seed 42 <i /> FAFB v783
            </small>
          </div>
        </section>
        <FirstSteps
          ready={!!game}
          onStart={() => {
            mutate((g) => {
              g.reset();
              g.state.ablation = "none";
              g.state.autopilot = true;
              g.state.scenario = "storm";
              g.state.speed = 1;
              g.state.status = "running";
              g.log(
                "Guided practice: watch health and the neural pilot. Pause to read the signals.",
              );
            });
            document
              .getElementById("practice")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />
        {error && (
          <div className="error" role="alert">
            {error}
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}
        <section className="lab-grid" id="practice">
          <div className="arena-panel">
            <div className="panel-heading">
              <div>
                <span className="status-dot" /> LIVE ENVIRONMENT{" "}
                <span className="subtle">/ D. melanogaster</span>
              </div>
              <div className="view-switch">
                <button
                  className={view === "arena" ? "selected" : ""}
                  onClick={() => setView("arena")}
                >
                  Arena
                </button>
                <button
                  className={view === "specimen" ? "selected" : ""}
                  onClick={() => setView("specimen")}
                >
                  Specimen <Maximize2 size={11} />
                </button>
              </div>
            </div>
            <div className="arena">
              {game ? (
                <World game={game} view={view} onError={reportError} />
              ) : (
                <div className="loading">
                  <FlaskConical size={28} />
                  <span>Preparing the specimen…</span>
                  <small>Loading real FlyWire connectivity</small>
                </div>
              )}
              <div className="arena-meta">
                <span>HABITAT 01</span>
                <strong>THE YIELD GARDEN</strong>
                <small>Drag to orbit · Scroll to explore</small>
              </div>
              <div
                className={`behavior ${s && s.escape > 0.2 ? "escaping" : ""}`}
              >
                <span />
                {s?.status === "liquidated"
                  ? "SPECIMEN LIQUIDATED"
                  : s && s.escape > 0.2
                    ? "ESCAPE RESPONSE"
                    : "FORAGING CIRCUIT ENVIRONMENT"}
              </div>
              {s && ["survived", "liquidated"].includes(s.status) && (
                <div className="result-card">
                  <span>EXPERIMENT COMPLETE</span>
                  <h2>
                    {s.status === "survived" ? "Still buzzing." : "REKT."}
                  </h2>
                  <p>
                    {s.status === "survived"
                      ? `Survived with ${s.interventions} interventions.`
                      : "The position stayed below a health factor of 1 for five seconds."}
                  </p>
                  <button className="primary" onClick={toggle}>
                    <RotateCcw size={15} /> Replay same seed
                  </button>
                </div>
              )}
              {s && s.hf < 1 && s.status === "running" && (
                <div className="liquidation-alert" role="alert">
                  Liquidation in {Math.max(0, s.countdown).toFixed(1)}s — add
                  collateral or repay debt
                </div>
              )}
              <div className="pool-labels">
                {POOLS.map((p, i) => (
                  <button
                    key={p.name}
                    onClick={() =>
                      mutate((g) => {
                        g.state.target = i;
                        g.log(`Foraging target: ${p.name}.`);
                      })
                    }
                    className={s?.target === i ? "active" : ""}
                  >
                    <span style={{ background: p.color }} />
                    <div>
                      <strong>{p.name}</strong>
                      <small>Scenery · click to explore</small>
                    </div>
                    <ArrowUpRight size={13} />
                  </button>
                ))}
              </div>
              <div className="scale-marker">
                <span /> MODEL: mm{" "}
                <small>ANATOMICAL MESH · KINEMATIC BODY</small>
              </div>
            </div>
            <div className="transport">
              <button
                className="play-button"
                onClick={toggle}
                disabled={!game}
                aria-label={
                  s?.status === "running"
                    ? "Pause experiment"
                    : "Start experiment"
                }
              >
                {s?.status === "running" ? (
                  <Pause size={17} fill="currentColor" />
                ) : (
                  <Play size={17} fill="currentColor" />
                )}
              </button>
              <div className="time">
                <strong>{time(s?.time ?? 0)}</strong>
                <span>/ 03:00</span>
              </div>
              <div className="timeline">
                <span style={{ width: `${((s?.time ?? 0) / 180) * 100}%` }} />
              </div>
              <button
                className="icon-button"
                title="Reset same seed"
                aria-label="Reset same seed"
                onClick={() => mutate((g) => g.reset())}
              >
                <RotateCcw size={15} />
              </button>
              <button
                className="speed"
                onClick={() =>
                  mutate((g) => (g.state.speed = g.state.speed === 1 ? 4 : 1))
                }
              >
                {s?.speed ?? 1}×
              </button>
              <span className="transport-divider" />
              <button className="export" onClick={exportRun} disabled={!game}>
                {copied ? <Check size={14} /> : <Download size={14} />}
                <span>Export run</span>
              </button>
            </div>
          </div>
          <aside className="brain-panel">
            <div className="brain-heading">
              <span>
                <Activity size={15} /> THE BRAIN
              </span>
              <button
                aria-label="About the brain dataset"
                onClick={() => openModal("sources")}
              >
                <ArrowUpRight size={17} />
              </button>
            </div>
            <div className="brain-title">
              <h2>Wired to survive.</h2>
              <p>Real neurons. A simplified escape model.</p>
            </div>
            {game ? (
              <BrainView game={game} />
            ) : (
              <div className="brain-canvas" />
            )}
            <div className="brain-legend">
              <span>
                <i className="lc4" />
                Sensor A
              </span>
              <span>
                <i className="lplc2" />
                Sensor B
              </span>
              <span>
                <i className="dn" />
                Escape alarm
              </span>
            </div>
            <div className="brain-stats">
              <div>
                <strong>{game?.circuit.meta.neurons ?? "—"}</strong>
                <span>SIMULATED NEURONS</span>
              </div>
              <div>
                <strong>{game ? money(game.circuit.meta.edges) : "—"}</strong>
                <span>REAL CONNECTIONS</span>
              </div>
            </div>
            <div className="activity-bars">
              {(["LC4", "LPLC2", "DNp01"] as const).map((type, i) => (
                <div key={type}>
                  <div>
                    <span>
                      {
                        ["Threat sensor A", "Threat sensor B", "Escape alarm"][
                          i
                        ]
                      }
                    </span>
                    <small>
                      <b>{Math.round(s?.rates[type] ?? 0)} Hz</b>
                    </small>
                  </div>
                  <div className="bar">
                    <span
                      style={{
                        width: `${Math.min(100, (s?.rates[type] ?? 0) / 2)}%`,
                        background: ["#c4ed8b", "#80b9b1", "#f3b975"][i],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="neural-path">
              <span>MARKET THREAT</span>
              <ArrowRight size={12} />
              <span>SENSORS</span>
              <ArrowRight size={12} />
              <span>ALARM</span>
            </div>
            <p className="brain-footnote">
              Hz = average spikes / simulated second / neuron
              <br />
              <a href="#read-brain">How to read these signals →</a>
              <br />
              316-cell subgraph · Background: anatomy only
              <br />
              20 ms neural time / 100 ms game time
            </p>
          </aside>
        </section>
        <section className="metrics">
          <div className="metric price-metric">
            <div className="metric-label">
              SIMULATED ETH <span className="chip">vUSD</span>
            </div>
            <div className="metric-value">
              ${money(s?.price ?? 2000)}{" "}
              <small
                className={(s?.price ?? 2000) < 2000 ? "negative" : "positive"}
              >
                <ArrowDownRight size={14} />
                {(((s?.price ?? 2000) / 2000 - 1) * 100).toFixed(1)}%
              </small>
            </div>
            <Chart values={s?.prices ?? [2000]} />
          </div>
          <div className="metric">
            <div className="metric-label">
              POSITION HEALTH <CircleHelp size={13} />
            </div>
            <div
              className={`metric-value ${s && s.hf < 1.1 ? "negative" : ""}`}
            >
              {(s?.hf ?? 1.11).toFixed(2)}
              <span className="health-state">
                {s && s.hf < 1
                  ? "CRITICAL"
                  : s && s.hf < 1.18
                    ? "AT RISK"
                    : "STABLE"}
              </span>
            </div>
            <div className="health-gauge">
              <span
                style={{
                  width: `${Math.min(100, (((s?.hf ?? 1.11) - 0.7) / 1.3) * 100)}%`,
                }}
              />
            </div>
            <small>Liquidation below 1.00 · 5s practice grace</small>
          </div>
          <div className="metric">
            <div className="metric-label">
              EMERGENCY RESERVE <span>◈</span>
            </div>
            <div className="metric-value">
              {(s?.reserveETH ?? 5).toFixed(2)}{" "}
              <span className="unit">vETH</span>
            </div>
            <small>
              + {money(s?.reserveUSD ?? 2000)} vUSD available to repay
            </small>
          </div>
          <div className="metric">
            <div className="metric-label">
              CAPITAL USED <ArrowUpRight size={14} />
            </div>
            <div className="metric-value">
              ${money(s?.spent ?? 0)} <span className="unit">virtual</span>
            </div>
            <small>
              {s?.interventions ?? 0} interventions · Keep the loan open
            </small>
          </div>
        </section>
        <section className="controls-grid">
          <div className="control-panel">
            <div className="section-label">
              01 <span>PROTECT THE POSITION</span>
              <span className="right-label">
                {(s?.collateral ?? 5).toFixed(2)} vETH /{" "}
                {money(s?.debt ?? 7000)} vUSD debt
              </span>
            </div>
            <div className="action-buttons">
              <button
                onClick={() => mutate((g) => g.action("deposit"))}
                disabled={s?.status !== "running" || s.reserveETH < 0.5}
              >
                <Plus size={16} />
                <span>
                  Add collateral<small>0.50 vETH from reserve</small>
                </span>
              </button>
              <button
                onClick={() => mutate((g) => g.action("repay"))}
                disabled={
                  s?.status !== "running" || s.reserveUSD <= 0 || s.debt <= 0
                }
              >
                <Minus size={16} />
                <span>
                  Repay debt<small>Up to 350 vUSD</small>
                </span>
              </button>
            </div>
            <div className="pilot">
              <div>
                <Zap size={16} />
                <span>
                  Neural pilot
                  <small>The escape alarm can trigger protection</small>
                </span>
              </div>
              <button
                role="switch"
                aria-checked={s?.autopilot ?? true}
                aria-label="Neural pilot"
                className={`toggle ${s?.autopilot ? "on" : ""}`}
                onClick={() =>
                  mutate((g) => (g.state.autopilot = !g.state.autopilot))
                }
              >
                <span />
              </button>
            </div>
          </div>
          <div className="control-panel">
            <div className="section-label">
              02 <span>CHANGE THE CONDITIONS</span>
              <FlaskConical size={14} />
            </div>
            <div className="condition-row">
              <label htmlFor="scenario">Market scenario</label>
              <div className="select-wrap">
                <select
                  id="scenario"
                  value={s?.scenario ?? "storm"}
                  disabled={s?.status === "running"}
                  onChange={(e) =>
                    mutate((g) => {
                      g.state.scenario = e.target
                        .value as GameState["scenario"];
                      g.reset();
                    })
                  }
                >
                  <option value="storm">Slow bleed</option>
                  <option value="wick">Flash wick</option>
                  <option value="calm">Quiet market</option>
                </select>
                <ChevronDown size={12} />
              </div>
              <button
                className="shock"
                onClick={() => mutate((g) => g.crash())}
                disabled={s?.status !== "running"}
              >
                Inject −8% <ArrowDownRight size={13} />
              </button>
            </div>
            <div className="ablation-row">
              <div>
                <Eye size={15} />
                <span>
                  Block sensor signals
                  <small>Does the alarm still reach the pilot?</small>
                </span>
              </div>
              <select
                aria-label="Circuit ablation"
                value={s?.ablation ?? "none"}
                onChange={(e) =>
                  mutate((g) => {
                    g.state.ablation = e.target.value as Ablation;
                    g.log(
                      `Ablation: ${e.target.value}. Previously queued signals may persist briefly.`,
                    );
                  })
                }
              >
                <option value="none">Intact</option>
                <option value="LC4">Sensor A output off</option>
                <option value="LPLC2">Sensor B output off</option>
                <option value="both">Both off</option>
              </select>
            </div>
          </div>
        </section>
        <section className="event-log">
          <div className="section-label">
            03 <span>OBSERVATION LOG</span>
            <span className="right-label">LATEST EVENTS</span>
          </div>
          <div className="log-rows" aria-live="polite">
            {(s?.events ?? []).slice(0, 3).map((e, i) => (
              <div key={`${e.time}-${i}`}>
                <time>{time(e.time)}</time>
                <i className={e.kind} />
                <span>{e.text}</span>
                {i === 0 && <small>LATEST</small>}
              </div>
            ))}
          </div>
        </section>
        <ReadingNeurons state={s} />
        <section className="decision-panel">
          <div className="section-label">
            WHY THE FLY ACTS <span>A PUBLIC, INSPECTABLE RULE</span>
          </div>
          <div className="challenge-steps">
            <p>
              <b>01 · Encode danger</b>Falling price lowers health factor:
              collateral × price × 0.78 ÷ debt. Below 1.22, threat input
              increases. Current HF: {(s?.hf ?? 1.11).toFixed(2)}.
            </p>
            <p>
              <b>02 · Sound the alarm</b>The two threat sensors receive danger
              input. Their connections carry it to the escape alarm. Current
              alarm activity: {(s?.rates.DNp01 ?? 0).toFixed(1)} Hz.
            </p>
            <p>
              <b>03 · Apply the rule</b>With pilot on, escape alarm activity
              above 10 Hz and health below 1.18 trigger 0.50 vETH collateral, or
              up to 350 vUSD repayment if collateral runs out. Actions have a
              four-second cooldown.
            </p>
          </div>
          <p className="protection-explanation">
            <b>Try a controlled comparison:</b> run the storm with an intact
            circuit, reset the same seed, silence both visual outputs, and
            replay. Compare survival and capital used. This tests a designed
            game controller, not a fly’s ability to trade.
          </p>
        </section>
        <Challenge />
        <footer>
          <span>
            <Bug size={15} /> A little biology. A little market chaos.
          </span>
          <button onClick={() => openModal("sources")}>
            Built on open science <ArrowUpRight size={13} />
          </button>
          <span>
            ETHONLINE 2026 <i /> LOCAL PRACTICE MODE
          </span>
        </footer>
      </main>
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={
              modal === "guide" ? "Field guide" : "Research and sources"
            }
            onClick={(e) => e.stopPropagation()}
          >
            <button
              autoFocus
              className="close"
              onClick={() => setModal(null)}
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>
            <div className="eyebrow">REKT FLY / FIELD NOTES</div>
            <h2>
              {modal === "guide"
                ? "Keep a little life alive."
                : "Open science, visible limits."}
            </h2>
            {modal === "guide" ? (
              <>
                <p>
                  <b>DeFi</b> means financial services run by blockchain
                  programs called smart contracts. This game explores one idea:
                  borrowing against a deposit.
                </p>
                <ol>
                  <li>
                    <b>Your loan:</b> you owe 7,000 virtual dollars (vUSD). You
                    locked 5 virtual ETH (vETH) as collateral—a security
                    deposit. “Virtual” means pretend game units.
                  </li>
                  <li>
                    <b>The danger:</b> when ETH gets cheaper, your deposit is
                    worth less, but your loan stays the same. Health factor
                    compares the allowed collateral value with the debt. At the
                    starting price: 5 × 2,000 × 0.78 ÷ 7,000 = 1.11.
                  </li>
                  <li>
                    <b>Your two moves:</b> Add collateral moves spare ETH into
                    the deposit. Repay debt uses spare dollars to reduce what
                    you owe. Both improve health; both use limited reserves.
                    Lower capital used is better only if the loan survives.
                  </li>
                  <li>
                    <b>Liquidation:</b> a lender can seize collateral to cover
                    an unsafe loan. In our practice game, health below 1.00 for
                    five seconds ends the round. Real protocols have different
                    rules and need not give that grace period.
                  </li>
                  <li>
                    <b>Your first run:</b> start guided practice and leave
                    Neural pilot on. Watch its actions in the log. Pause anytime
                    to read the neural graph. Reset restarts the same market; 4×
                    runs it faster.
                  </li>
                  <li>
                    <b>Your next run:</b> turn the pilot off and try protecting
                    the loan yourself. Or reset and block both visual outputs to
                    see how the simulated escape pathway affects the pilot.
                  </li>
                </ol>
                <p>
                  <b>The fly and garden:</b> the fly moves toward an escape
                  location when its output neurons fire. The garden locations
                  are scenery, not investments; clicking them does not earn
                  interest or move your collateral.
                </p>
                <p>
                  <b>Optional Sepolia section:</b> this connects to a separate,
                  real test network through MetaMask. Testnet ETH pays
                  transaction fees (“gas”); vETH/vUSD are free challenge tokens.
                  Practice buttons never spend from your wallet.
                </p>
                <p>
                  <a
                    href="https://ethereum.org/defi/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read Ethereum’s introduction to DeFi ↗
                  </a>
                </p>
              </>
            ) : (
              <>
                <p>
                  The visible fly uses{" "}
                  <a
                    href="https://github.com/NeLy-EPFL/flygym"
                    target="_blank"
                    rel="noreferrer"
                  >
                    NeuroMechFly meshes ↗
                  </a>{" "}
                  under Apache-2.0, converted to GLB with a neutral pose. Its
                  browser gait is a designed animation, not MuJoCo physics.
                </p>
                <p>
                  The brain simulates{" "}
                  <strong>104 LC4 + 210 LPLC2 + 2 DNp01 neurons</strong> with
                  10,711 recorded connections from a pinned FlyWire v783
                  derivative. Dim background points show sampled anatomical
                  positions and are not simulated.
                </p>
                <p>
                  The original reduced LIF implementation uses published Shiu
                  model parameters. Sensory encoding, body movement and
                  protection rules are designed for the game. This is not a
                  validated whole-brain emulation.
                </p>
                <div className="source-links">
                  <a href="/data/provenance.json" target="_blank">
                    Dataset provenance <ExternalLink size={13} />
                  </a>
                  <a
                    href="https://doi.org/10.1038/s41586-024-07763-9"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Shiu et al. model <ExternalLink size={13} />
                  </a>
                  <a
                    href="/licenses/NeuroMechFly-Apache-2.0.txt"
                    target="_blank"
                  >
                    Mesh license <ExternalLink size={13} />
                  </a>
                  <a
                    href="https://join.flywire.ai/guidelines"
                    target="_blank"
                    rel="noreferrer"
                  >
                    FlyWire data terms <ExternalLink size={13} />
                  </a>
                </div>
                <p>
                  Local practice mode is not the official Chainlink challenge.
                  The separate Sepolia panel supports explicit wallet actions.
                  CRE confidential execution and verified onchain scores are not
                  implemented.
                </p>
              </>
            )}
            <button className="primary" onClick={() => setModal(null)}>
              Back to the experiment <ArrowRight size={15} />
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
