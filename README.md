# REKT FLY

[Live app](https://rekt-fly.vercel.app) · [GitHub](https://github.com/perfect7613/rekt-fly)

A 3D DeFi survival experiment for ETHOnline 2026. A real, reduced FlyWire escape circuit responds to market danger while a NeuroMechFly anatomical model explores a small arena.

## Run

```bash
npm --prefix web ci
npm run dev
```

Open http://localhost:3000. The practice game needs no API keys or paid services. The optional onchain panel uses MetaMask on Ethereum Sepolia (chain ID 11155111).

```bash
npm test
npm run lint
npm run build
```

For Vercel, use **web** as the project root. This is a standard Next.js App Router app.

## Play

1. Press play. The practice storm lasts three minutes; 4× speed is available.
2. Watch health factor: collateral × simulated ETH price × 0.78 / debt.
3. Add 0.50 vETH collateral or repay up to 350 vUSD. Reserves are finite.
4. Neural pilot uses simulated DNp01 firing as the input to an explicit game protection rule.
5. Reset, silence both visual outputs, and replay the same seed to compare.
6. Drag either 3D view to orbit. Select **Specimen** for a close-up. Export saves a JSON snapshot, event log and price history.

The arena's food-pool yields are illustrative labels, not accruing DeFi positions. Pool selection controls a designed foraging target. The fly's escape target is controlled by the neural readout. The browser gait and navigation are kinematic, not a full physics simulation.

## What is real, what is modeled

| Component | Implemented scope |
|---|---|
| Fly anatomy | Apache-2.0 NeuroMechFly STL meshes, original rigging and neutral pose, converted to GLB |
| Neural wiring | 316 actual v783 neurons: 104 LC4, 210 LPLC2, 2 DNp01; 10,711 recorded connections |
| Background brain cloud | Sampled anatomical annotation coordinates; these background cells are not simulated |
| Neural dynamics | Original reduced LIF implementation with published Shiu parameters, explicit 0.1 ms Euler timestep and delayed signed synapses |
| Time mapping | 20 ms neural time for each 100 ms of game time; not real-time whole-brain emulation |
| Body animation | Original kinematic browser animation; not inferred leg torques from the connectome |
| Financial actions | Local practice plus a separate MetaMask interface to the official Sepolia challenge: position reads, registration, collateral deposits and debt repayment |
| Modal | Verified bounded CPU articulation benchmark; not connected to the live browser body |
| Chainlink/CRE | Planned integration, not implemented; this build is not yet an eligible completed Chainlink challenge submission |

FlyWire FAFB lacks the full ventral nerve cord leg/wing motor system. A designed locomotion controller is needed before integrating closed-loop MuJoCo movement. We do not claim validated biological behavior, consciousness, financial alpha, or whole-brain equivalence.

The practice game includes a five-second liquidation grace period and custom capital limits. It does not reproduce the official Chainlink challenge contract exactly. The practice policy is public and is not confidential execution.

## Small codebase (YAGNI)

```text
web/src/lib/simulation.ts       Reduced LIF model + deterministic practice game
web/src/components/World.tsx    Three.js arena, anatomical model and orbit camera
web/src/components/BrainView.tsx Sampled anatomy + live circuit activity
web/src/components/Laboratory.tsx Controls, telemetry, guide and export
web/public/data/                Committed browser data + provenance
web/public/models/              Committed GLB + provenance
scripts/                        Reproducible asset/data preparation
simulation/benchmark.py         Bounded Modal CPU physics smoke test
tests/simulation.test.ts        Circuit, accounting and replay tests
```

Direct Three.js avoids adding a second scene framework. React renders controls at 10 Hz; Three.js renders independently. There is no global-state library, auth layer, ORM, queue, agent framework, token contract or paid LLM dependency.

## Rebuild the assets

The small final assets are committed. Rebuilding is only necessary when changing the dataset/mesh pipeline. The downloads are roughly 140 MB, plus mesh assets. They are public, pinned and kept out of git.

```bash
python3 -m venv .venv
.venv/bin/pip install -r scripts/requirements.txt
python3 scripts/fetch_assets.py
.venv/bin/python scripts/prepare_data.py
.venv/bin/python scripts/prepare_fly.py
```

The fetcher verifies SHA-256 hashes for the annotation and connectivity sources. `web/public/data/provenance.json` records those hashes, commits and transformations. The connectivity is a preprocessed v783 derivative from the MIT reference-model repository; the later v783 annotations come from a separately pinned annotation repository. This is not an independently reconstructed canonical Codex export.

## Modal physics check

With the existing authenticated Modal CLI and downloaded assets:

```bash
modal run simulation/benchmark.py
```

Runs one bounded, CPU-only, 2,000-step invocation. It stops when finished; it does not deploy an endpoint or hold a GPU warm. Results are written to `docs/physics-benchmark.json`. The tested model is an attached/tethered articulated fly, without a locomotion controller or brain. It verifies runtime/model loading, finite state and absence of numerical warnings. Its timing must not be advertised as interactive full-body game throughput.

## Verification from this build

- Production Next.js build and ESLint passed.
- Nine tests cover onchain token-unit math and minimal protection amounts, plus real data integrity, silence without stimulus, intact versus ablated escape output, reserve accounting, deterministic reset, terminal states, and a complete intact-versus-ablated practice storm.
- Full practice storm, seed 42: intact neural pilot survived at 180s with six interventions; both visual outputs silenced liquidated at 64.5s with zero interventions. This is a game/model result, not a wet-lab claim.
- Browser checked: anatomical close-up, 3D scene, start/pause, manual collateral and repayment, and 390px responsive layout.
- Modal CPU benchmark: 56 bodies, 87 degrees of freedom, 2,000 steps, finite state and no numerical warnings. See the JSON for measured timing and its scope.

## Sepolia setup

1. Open the app in MetaMask's browser or a desktop browser with MetaMask installed.
2. Click **Connect MetaMask** in the Sepolia section; approve the switch to Ethereum Sepolia.
3. Obtain a small amount of free Sepolia ETH for gas through the [ETHGlobal faucet](https://ethglobal.com/faucet). Do not send mainnet funds.
4. **Join & mint virtual tokens** creates a position in the [official lending contract](https://sepolia.etherscan.io/address/0x88574e7Cc0027afd04951daa09B64d4441931ba1). Registration depends on the organizer's gate.
5. Once the scenario is active, deposit 0.50 vETH or repay up to 350 vUSD. The UI shows how much would reach health factor 1.20. Each action is simulated before signing; token approvals are limited to the action amount. Confirm approval and action separately.

The app verifies token addresses and decimals, clears state on wallet changes, reads a consistent block, and reports transaction receipts. It never requests a seed phrase or private key. The neural pilot does not sign transactions. Read failures and organizer gating disable unavailable operations; the browser UI does not bypass contract rules.

## Hackathon status

The [judging criteria](https://ethglobal.com/events/ethonline2026/info/details) are technicality, originality, practicality, usability and wow factor. The demo path is: show the anatomical fly, explain the danger-to-escape rule, compare intact/ablated runs with the same seed, then demonstrate a real Sepolia position and explain the collateral-versus-repayment tradeoff. A 2–4 minute human-narrated video is required for submission.

The [Chainlink confidential track](https://ethglobal.com/events/ethonline2026/prizes/chainlink) requires meaningful confidential CRE execution and successful simulation/deployment evidence. **That integration is not implemented**, and this repo should not be presented as satisfying it. Full MuJoCo locomotion is also unfinished; the optional CPU benchmark only validates articulated-model loading and stepping.

## New work, reuse and AI assistance

The application UI, Three.js scene, reduced neural simulator, game policy, wallet integration, conversion scripts and tests were developed for this prototype with OpenAI Codex assistance. AI assistance covers `web/src`, `scripts`, `simulation`, `tests`, configuration and documentation. The project owner supplied the concept, event selection, platform constraints, product direction and reuse requirements. This disclosure does not claim eligibility; the event requires meaningful participant involvement and judges assess that contribution.

Reused material is limited to the attributed anatomical assets, published connectivity/annotations, mathematical references and package dependencies. No formal spec-generation framework was used. Research scratch files and duplicate scaffold documents are omitted from the working tree; the actual development history is retained.

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Original application code is MIT; the fly model is Apache-2.0 and FlyWire data retains CC BY-NC 4.0 terms. Required notices and machine-readable provenance are intentionally retained.
