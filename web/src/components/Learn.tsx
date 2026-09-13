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
      <h2>Three neuron types. One escape pathway.</h2>
      <p>
        A neuron is a cell that sends brief electrical pulses called{" "}
        <b>spikes</b>. A <b>synapse</b> is a connection through which one neuron
        influences another. These type names describe groups of cells in a fruit
        fly’s visual system.
      </p>
      <div className="neuron-cards">
        <article>
          <span className="neuron-code lc4-text">LC4 · 104 cells</span>
          <h3>How fast is it growing?</h3>
          <p>
            <b>Lobula columnar type 4.</b> In flies, this visual pathway carries
            information about the angular expansion speed of an approaching
            object—imagine a ball rushing toward your face.
          </p>
        </article>
        <article>
          <span className="neuron-code lplc2-text">LPLC2 · 210 cells</span>
          <h3>Is something looming?</h3>
          <p>
            <b>Lobula plate / lobula columnar type 2.</b> These visual neurons
            detect outward expansion. They contribute information about an
            approaching object’s apparent size to the escape pathway.
          </p>
        </article>
        <article>
          <span className="neuron-code dn-text">DNp01 · 2 cells</span>
          <h3>Send the escape signal.</h3>
          <p>
            The <b>giant-fiber descending neurons</b> receive visual input and
            help trigger a rapid escape takeoff. “Descending” means the signal
            travels from the brain toward body motor circuits.
          </p>
        </article>
      </div>
      <p className="protection-explanation">
        <b>What our game changes:</b> there is no camera image or approaching
        object. We feed the same designed market-danger signal into LC4 and
        LPLC2. Their biological names do not mean the app separately measures
        market speed and size. DNp01 activity triggers our public financial
        rule; the fly does not understand loans or money.
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
            LC4 and LPLC2 rising means the model is responding to input. DNp01
            rising means activity reached the escape output. A brief burst is
            normal; one snapshot cannot show the whole pattern.
          </p>
        </div>
        <div className="trace-box">
          <div className="trace-legend">
            <span className="lc4-text">LC4</span>
            <span className="lplc2-text">LPLC2</span>
            <span className="dn-text">DNp01</span>
            <span>0–{Math.ceil(max)} Hz</span>
          </div>
          <svg
            viewBox="0 0 440 120"
            role="img"
            aria-label="Recent simulated population firing rates; green LC4, teal LPLC2, orange DNp01"
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
            <b>Colored dots:</b> positions of simulated cells. Green = LC4, teal
            = LPLC2, orange = DNp01. Brightness highlights recent simulated
            spikes; it is not a measurement from a living fly.
          </li>
          <li>
            <b>Dim background dots:</b> anatomical context only. These cells are
            not running in the model. Lines show a selected set of stronger
            recorded connections into DNp01, not moving spikes or every
            connection.
          </li>
          <li>
            <b>Bars:</b> latest average firing rate. Full bar means 200 Hz or
            higher; the number gives the actual rate. These are neither
            percentages nor prediction confidence.
          </li>
          <li>
            <b>Both outputs off:</b> blocks signals leaving LC4/LPLC2. Those
            cells can still fire from input, so their meters need not become
            zero. Their dots are gray to indicate the block. DNp01 should lose
            its driven response after pending signals clear.
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
