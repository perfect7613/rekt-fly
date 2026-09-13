# REKT FLY: repository research and runtime decision

Reviewed 2026-09-13 for ETHOnline 2026. User has Next.js/Vercel, MetaMask testnet access, Modal, and approximately $50 in OpenAI credit. The OpenAI credit is separate from Modal compute.

## Recommendation

Build a connectome-driven DeFi survival experiment with a visible brain and body. Use Next.js on Vercel for the interface. Keep the stateful Python brain/body session on Modal when biomechanical physics is enabled. Start with walking/foraging in FlyGym/MuJoCo; reserve flybody's flight policies for a later flight mode. Benchmark CPU and one modest GPU before selecting hardware. No GPU workload has been launched and no performance figures below have been independently reproduced.

The financial-to-sensory mapping and descending-neuron-to-action decoder are our designed interfaces. They must be described as such. A connectome does not inherently understand ETH prices or wallet transactions.

## Projects inspected

### TuragaLab/flybody

- Repository: https://github.com/TuragaLab/flybody
- Inspected commit: `d015e9bfe441bd90ae431bac24c55cb74bdbce26`.
- Examined README, `pyproject.toml`, `flybody/fruitfly/fruitfly.py`, and `flybody/download_data.py`.
- Anatomical fly body in MuJoCo, with dm_control task infrastructure. Walking, flight, and vision-guided flight environments.
- Optional TensorFlow/Acme policy stack; distributed DMPO reinforcement-learning training uses Ray. The body package does not include a FlyWire brain controller by default.
- The data downloader exposes pretrained policies and controller-reuse checkpoints, plus walking and flight imitation datasets: https://doi.org/10.25378/janelia.25309105.
- Reuse: install a pinned upstream package and use its models, assets, and compatible pretrained controllers; implement our own game and high-level bridge. Check the separate supplementary asset terms when selecting downloads.
- Code license: Apache-2.0.
- Best fit: actual flight with wing/body mechanics. More integration work than a simple browser body.

### NeLy-EPFL/flygym / NeuroMechFly

- Repository: https://github.com/NeLy-EPFL/flygym
- Inspected commit: `38c8ec61034cd59bc5ba0de20688d4a3c0000d60`.
- Examined README, `pyproject.toml`, CPU simulation and Warp simulation modules.
- MuJoCo biomechanical simulation with visual/olfactory sensing, contact feedback, leg adhesion, and hierarchical motor-control interfaces.
- Inspected package declares 2.1.0, Python >=3.12,<3.15, MuJoCo >=3.9,<3.10. Its optional Warp extra declares warp-lang >=1.14,<1.15 and mujoco_warp >=3.9,<3.10. Pin a tested dependency set; do not combine these blindly with older bridge projects.
- Upstream advertises CPU and Warp/MJWarp GPU acceleration. Its reported ~2x/~60x real-time throughput is not a measurement of our combined brain, physics, rendering, and networking loop.
- FlyGym 2.x is not backward compatible with 1.x: https://neuromechfly.org/migration/.
- Reuse: model and physics package, sensing interfaces, and locomotion examples. Write a version-specific adapter for our brain outputs.
- Code license: Apache-2.0.
- Best fit: a fly walking between safe and risky food sources in the DeFi arena.

### neilt93/Fly-Brain-AI

- Repository: https://github.com/neilt93/Fly-Brain-AI
- Inspected commit: `64bdbaf7bcf6b663d0fbf21d886517ec5c06fafb`.
- Examined README, `plastic-fly/bridge/README_RELEASE.md`, `brain_runner.py`, `descending_decoder.py`, `flygym_adapter.py`, and requirements.
- Whole-brain path: sensory encoder -> Brian2 LIF FlyWire brain -> descending decoder -> locomotion controller -> FlyGym 1.2.1 / MuJoCo.
- The documented bridge uses a central pattern generator and preprogrammed stepping to turn forward/turn/rhythm/stance commands into joint angles. An optional premotor layer adds feedback and smoothing.
- The repository also contains VNC models, including a BANC firing-rate path. These are distinct implementations and datasets, not interchangeable descriptions of the whole-brain LIF path.
- Unity is a visualization frontend; it is not required for the Python brain-body loop.
- README says no GPU required and approximately 8 GB RAM for building the Brian2 network. This does not establish interactive end-to-end performance.
- Reuse: architectural separation and independently implemented interfaces. Do not port the entire project by renaming functions.
- Licensing needs clarification for direct code reuse: root README says MIT; bridge README says "MIT (suggested)"; the inspected root tree did not provide a standard LICENSE file.

### eonsystemspbc/fly-brain

- Repository: https://github.com/eonsystemspbc/fly-brain
- Examined README, tree, `code/run_pytorch.py`, and committed benchmark summaries.
- A neural simulation/benchmark suite, not a complete embodied game.
- Backends include Brian2 CPU, Brian2CUDA, PyTorch sparse tensors, NEST GPU, GeNN, and an optional Brian2GeNN environment.
- Its documented PyTorch backend uses sparse CSR weights and batched trials. Brian2 CPU is its numerical reference. Some backends compile generated C++/CUDA and have additional setup costs.
- Upstream's tested hardware includes an RTX 4070; GPU benefit depends on activity, batch size, timestep, and implementation. Batched benchmark throughput is not single-session interactive latency.
- Reuse: sparse representation, separate setup/simulation timing, and CPU-versus-GPU validation methodology.
- Main code license: GPL-2.0-or-later, with separately licensed MIT materials from the Shiu model. Retain the applicable license if integrating code.

### Shiu reference brain model

- Primary repository: https://github.com/philshiu/Drosophila_brain_model
- Also inspected the MIT implementation at https://github.com/eonsystemspbc/drosophila_brain_model_lif, `model.py`.
- LIF point neurons, resting/reset potential -52 mV, threshold -45 mV, membrane constant 20 ms, synaptic decay 5 ms, refractory interval 2.2 ms, synaptic delay 1.8 ms, and reference synaptic gain 0.275 mV.
- These are computational modeling choices, not a full biophysical recreation of every cell.
- Reuse: published model as the reference for an original implementation or import the licensed package with attribution. Validate numerical behavior before claiming equivalence.
- Paper: https://doi.org/10.1038/s41586-024-07763-9.

### vaibhavkedarisetti/fruit-fly-lab

- Repository: https://github.com/vaibhavkedarisetti/fruit-fly-lab
- Inspected commit: `26672e06427c12c61536ce1bd93dae7442944681`.
- Examined README, DATA_SOURCES, LIF engine, sensory encoders, descending decoder, and browser export format.
- Full FlyWire v783 graph, event-driven sparse CPU engine using NumPy/SciPy; browser implementation uses a Web Worker and binary data assets. Original Python server uses FastAPI/WebSockets.
- Body is kinematic, not a MuJoCo biomechanical body. No GPU backend is implemented in the inspected version.
- README reports approximately 1 ms wall time per 0.1 ms neural simulation step for Python: roughly ten times slower than biological time. A live-looking visualization does not establish biological real-time speed.
- Its useful experiment is LC4/LPLC2 stimulation and silencing with a Giant Fibre/DNp01 readout. Upstream experiment results have not been reproduced here.
- Reuse: ablation experiment design, provenance UI ideas, worker boundary and compact data approach. No standard code license was found in the inspected tree, so do not vendor its implementation without clarifying terms.
- The data license statement in this repository differs from FlyWire's official guideline. Use the dataset's authoritative terms, not a downstream README.

### Additional discovery

- https://github.com/Tharusha101/flybrain: vectorized sparse LIF and embodiment experiments; README/metadata inspected.
- https://github.com/dylankainth/flybrain: fly-connectome drone-control experiments; README/metadata inspected. Hardware drone integration is outside this game.
- https://flybrain.app/: browser demonstration found; this pass did not establish a public licensed source repository. Do not assume its marketing claims prove the absence of designed behavior rules.

This is a targeted survey of the relevant projects, not an exhaustive inventory of every fly simulation repository.

## Runtime architecture

```text
Next.js / Vercel
  game controls, wallet, local scene rendering, sampled neural activity
       | sensory/game inputs and session commands
       v
Modal Python session (WebSocket)
  input validation and bounded session duration
  sensory encoder -> sparse LIF brain -> descending decoder
                             ^                    |
                             |                    v
                       body observations <- locomotion controller
                                               |
                                          MuJoCo / FlyGym
       |
       +-> joint poses, body transform, neural telemetry, replay events

Separate Sepolia integration / confidential CRE workflow
  virtual lending position and authorized protection transactions
```

Keep brain and body together to avoid a network round-trip at every physics step. Stream compact poses and selected neural telemetry to the browser; target 20-30 updates/s and interpolate rendering, subject to measurement. Rendering pixels on the server is optional for recordings or validation, not the default interactive transport.

Use a Modal Volume for immutable, versioned connectome data and replay artifacts. Load data when the container starts. Keep mutable session state scoped to a connection; handle disconnects and reconnects explicitly. A WebSocket is a long-running invocation, not permanent storage.

Modal supports WebSockets through its ASGI/server integrations: https://modal.com/docs/guide/webhooks#websockets. Warm-container settings reduce startup waits but incur resource charges: https://modal.com/docs/guide/cold-start. Available GPU options: https://modal.com/docs/guide/gpu.

Initial hardware candidate: CPU for one MuJoCo body and the reference brain; compare a single L4 or A10 for accelerated brain work. This is a benchmark plan, not a claim that either GPU meets the final latency target. Use Warp physics if measured workloads justify it, especially multiple simultaneous bodies/experiments.

## Data and scientific boundaries

Use one named FlyWire release with checksums, root IDs, neuron classifications, signed connectivity, and coordinates. The full v783 dataset has 139,255 neurons and 3,732,460 connections according to Codex. A selected subgraph must be visibly labeled with its actual counts.

FAFB brain data does not contain the full leg/wing motor system in the ventral nerve cord. A designed locomotion controller or a separately sourced VNC model is needed between descending neurons and body actuation. Mixing FAFB, BANC, and MANC without explicit mappings would be misleading.

Official dataset terms and citations: https://join.flywire.ai/guidelines (public release: CC BY-NC 4.0). Independent annotations: https://github.com/flyconnectome/flywire_annotations. Original connectivity archive: https://zenodo.org/records/10676866. The Codex download portal currently asks for sign-in.

Rewriting source line by line does not remove its license obligations. Our original game/adapter code should remain distinguishable from imported packages, reused assets, and dataset derivatives.

## Services and next verification

No OpenAI call is needed for neural simulation or physics. An optional post-round explanation can be added later; an LLM must not impersonate the connectome controller.

Needed for the eventual integrated demo: Modal access, FlyWire data access or the public archive, Sepolia gas, and a reliable RPC. For the specific Chainlink challenge, confidential CRE access and successful workflow evidence are separate requirements: https://ethglobal.com/events/ethonline2026/prizes/chainlink.

Before promising an interactive whole-brain physics demo, measure brain-step latency, physics latency, total wall time per simulated second, startup/data-loading time, session isolation, and intact-versus-ablated behavior on identical seeded inputs. Keep scientific verification separate from the DeFi scoring rules.

Updated build status: the first 3D browser practice game and reduced circuit are implemented; source checksums, circuit tests, and a bounded Modal CPU articulation benchmark are complete. See the root README for implemented scope. Live brain-to-MuJoCo coupling, onchain/CRE integration, and deployment remain outstanding.
