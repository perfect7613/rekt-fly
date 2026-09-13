"use client";
import { useState } from "react";
import type { GameState } from "@/lib/simulation";

export function FirstSteps({
  onStart,
  ready,
}: {
  onStart: () => void;
  ready: boolean;
}) {
  const [price, setPrice] = useState(2000);
  const hf = (5 * price * 0.78) / 7000;
  return (
    <section className="learn-intro" aria-label="Beginner introduction">
      <div className="learn-welcome">
        <span className="eyebrow">NEW HERE? START WITH THIS</span>
        <h2>
          Protect a loan.
          <br />
          Watch a fly’s alarm system.
        </h2>
        <p>
          You start with a pretend loan of <b>7,000 dollars</b>, backed by{" "}
          <b>5 ETH</b>. Your goal: survive three minutes of falling prices while
          using as little extra money as possible.
        </p>
        <button className="lesson-start" disabled={!ready} onClick={onStart}>
          Start a guided practice →
        </button>
        <small>No wallet needed. No real money in practice.</small>
      </div>
      <div className="loan-lesson">
        <h3>Why does a falling price matter?</h3>
        <p>
          <b>Collateral</b> is the security deposit backing a loan. Its price
          can fall even though your <b>debt</b>—what you owe—stays the same.
        </p>
        <label htmlFor="lesson-price">
          Try moving the ETH price <strong>${price.toLocaleString()}</strong>
        </label>
        <input
          id="lesson-price"
          type="range"
          min="1400"
          max="2400"
          step="20"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
        <div className="lesson-equation">
          <span>
            5 ETH × ${price.toLocaleString()}
            <small>Deposit value</small>
          </span>
          <span>
            × 78% ÷ $7,000<small>Safety rule ÷ loan</small>
          </span>
          <strong className={hf < 1 ? "lesson-danger" : ""}>
            {hf.toFixed(2)}
            <small>Health factor</small>
          </strong>
        </div>
        <p className="lesson-result">
          {hf < 1
            ? "Below 1.00: the practice loan is in danger. Add collateral or repay debt."
            : "Above 1.00: there is a safety buffer. A bigger number means more room for price drops."}
        </p>
        <small>
          This slider is a separate example; it does not change your game. The
          78% rule is specific to this challenge.
        </small>
      </div>
    </section>
  );
}

export function ReadingNeurons({ state }: { state: GameState | null }) {
  const points = state?.neuralHistory ?? [];
  const max = Math.max(50, ...points.flatMap((p) => [p.LC4, p.LPLC2, p.DNp01]));
  return (
    <section className="reading-neurons" id="read-brain">
      <div className="section-label">
        READ THE SIGNAL <span>AN ALARM CIRCUIT, EXPLAINED</span>
      </div>
      <h2>Sense danger. Sound the alarm. Protect the loan.</h2>
      <p>
        Think of this as a tiny alarm system. Two groups of cells sense danger,
        then another group sends an escape signal. You do not need to remember
        the scientific names to play.
      </p>
      <div className="neuron-cards">
        <article>
          <span className="neuron-code lc4-text">GREEN · THREAT SENSOR A</span>
          <h3>“Something is approaching.”</h3>
          <p>
            One input channel to the alarm. In the game, more danger makes these
            simulated cells fire more often.
          </p>
          <details>
            <summary>Scientific name: LC4</summary>
            <p>
              104 lobula columnar type 4 cells. In real flies, this pathway
              carries information about the expansion speed of an approaching
              object.
            </p>
          </details>
        </article>
        <article>
          <span className="neuron-code lplc2-text">TEAL · THREAT SENSOR B</span>
          <h3>“This looks like a threat.”</h3>
          <p>
            A second input channel. It receives the same game-danger signal, but
            connects through its own recorded biological wiring.
          </p>
          <details>
            <summary>Scientific name: LPLC2</summary>
            <p>
              210 lobula plate / lobula columnar type 2 cells. In real flies,
              they detect outward expansion and contribute information about an
              approaching object’s apparent size.
            </p>
          </details>
        </article>
        <article>
          <span className="neuron-code dn-text">ORANGE · ESCAPE ALARM</span>
          <h3>“Time to get away!”</h3>
          <p>
            The output signal. If it is strong enough and the loan needs
            protection, our pilot rule can add collateral or repay debt.
          </p>
          <details>
            <summary>Scientific name: DNp01</summary>
            <p>
              Two giant-fiber descending neurons. They receive visual input and
              help trigger a rapid escape takeoff in flies, sending signals
              toward body motor circuits.
            </p>
          </details>
        </article>
      </div>
      <p className="protection-explanation">
        <b>An alarm, not a dopamine hit.</b> Dopamine is a chemical messenger;
        this app does not simulate dopamine or reward feelings. The phrases
        above are friendly labels, not thoughts the fly is having. We substitute
        market danger for visual input and apply a designed financial rule to
        the simulated escape signal.
      </p>
      <div className="signal-reader">
        <div>
          <h3>Read activity over time</h3>
          <p>
            <b>
              Hz = spikes per second of simulated neural time, averaged per
              neuron.
            </b>{" "}
            A group at 50 Hz averages one spike per cell in a 20 ms sampling
            window. The graph keeps the latest 10 game seconds. Pause the game
            to inspect it.
          </p>
          <p>
            Green and teal rising mean the threat sensors are responding. Orange
            rising means the escape alarm is firing. A brief burst is normal;
            one snapshot cannot show the whole pattern.
          </p>
        </div>
        <div className="trace-box">
          <div className="trace-legend">
            <span className="lc4-text">Sensor A</span>
            <span className="lplc2-text">Sensor B</span>
            <span className="dn-text">Alarm</span>
            <span>0–{Math.ceil(max)} Hz</span>
          </div>
          <svg
            viewBox="0 0 440 120"
            role="img"
            aria-label="Recent simulated population firing rates; green threat sensor A, teal threat sensor B, orange escape alarm"
          >
            <path
              d="M0 110H440 M0 60H440 M0 10H440"
              stroke="#d2d8cb"
              strokeDasharray="3 4"
            />
            {(["LC4", "LPLC2", "DNp01"] as const).map((key, i) => (
              <polyline
                key={key}
                points={points
                  .map(
                    (p, j) => `${(j / 99) * 440},${110 - (p[key] / max) * 100}`,
                  )
                  .join(" ")}
                fill="none"
                stroke={["#52752a", "#287e78", "#b46526"][i]}
                strokeWidth="2"
              />
            ))}
            <line
              x1="0"
              x2="440"
              y1={110 - (10 / max) * 100}
              y2={110 - (10 / max) * 100}
              stroke="#b46526"
              strokeDasharray="5 4"
            />
          </svg>
          <small>
            Older → newer · Scale adjusts to the visible peak · Dashed: 10 Hz
            output threshold
          </small>
          {points.length === 0 && (
            <p>Start practice to record the first signals.</p>
          )}
        </div>
      </div>
      <details>
        <summary>
          How to read the 3D brain, bars and silencing experiment
        </summary>
        <ul>
          <li>
            <b>Colored dots:</b> positions of simulated cells. Green = sensor A,
            teal = sensor B, orange = escape alarm. Brightness highlights recent
            simulated spikes; it is not a measurement from a living fly.
          </li>
          <li>
            <b>Dim background dots:</b> anatomical context only. These cells are
            not running in the model. Lines show a selected set of stronger
            recorded connections into the escape alarm, not moving spikes or
            every connection.
          </li>
          <li>
            <b>Bars:</b> latest average firing rate. Full bar means 200 Hz or
            higher; the number gives the actual rate. These are neither
            percentages nor prediction confidence.
          </li>
          <li>
            <b>Both outputs off:</b> blocks signals leaving both threat sensors.
            Those cells can still fire from input, so their meters need not
            become zero. Their dots are gray to indicate the block. The escape
            alarm should lose its driven response after pending signals clear.
          </li>
          <li>
            <b>Compare fairly:</b> reset, choose Intact or Both off, and replay
            the same scenario with the same pilot setting. Avoid manual actions
            when comparing. Seed 42 repeats the model’s random input.
          </li>
          <li>
            <b>Time:</b> each 0.1 second of game time advances 0.02 seconds of
            neural time. This is a reduced simulation, not a recording of a
            whole fly brain.
          </li>
        </ul>
      </details>
      <p className="lesson-citations">
        Biology:{" "}
        <a
          href="https://pubmed.ncbi.nlm.nih.gov/30827912/"
          target="_blank"
          rel="noreferrer"
        >
          Ache et al., 2019 ↗
        </a>{" "}
        ·{" "}
        <a
          href="https://www.nature.com/articles/nature24626"
          target="_blank"
          rel="noreferrer"
        >
          Klapoetke et al., 2017 ↗
        </a>
      </p>
    </section>
  );
}
