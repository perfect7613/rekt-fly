# Third-party notices

## NeuroMechFly / FlyGym

Source: https://github.com/NeLy-EPFL/flygym
Commit: `38c8ec61034cd59bc5ba0de20688d4a3c0000d60`
License: Apache License 2.0, included at `web/public/licenses/NeuroMechFly-Apache-2.0.txt`.

The shipped `fly.glb` is derived from FlyGym's simplified NeuroMechFly meshes, rigging and neutral pose. Changes: STL-to-GLB conversion, mirrored right-side meshes, neutral-pose transforms and custom browser materials. The script in `scripts/prepare_fly.py` records this transformation. Browser locomotion/animation is independently implemented. The optional Modal test downloads and adapts the licensed upstream legacy MJCF at build time; no physics controller source is vendored.

NeuroMechFly v2 publication: https://doi.org/10.1038/s41592-024-02497-y.

## FlyWire FAFB data and annotations

Official terms: https://join.flywire.ai/guidelines — public release CC BY-NC 4.0. Dataset derivatives are not covered by this repository's MIT code license. This is a noncommercial educational prototype.

Annotations: https://github.com/flyconnectome/flywire_annotations at `8587524c1748ce5ef2080822a2fc890fc03bf597`.
Connectivity mirror/derivative: https://github.com/eonsystemspbc/drosophila_brain_model_lif at `c976c7a90b2ac5a472c028b5862974217e93573f`.

Changes: select LC4/LPLC2/DNp01 cells; retain and aggregate their actual signed internal connections; convert positional voxel units for visualization; sample other annotation coordinates for static background context. Source hashes are in `web/public/data/provenance.json`. No synthetic neuron IDs or connections were inserted.

Citations:
- Dorkenwald et al., Neuronal wiring diagram of an adult brain, Nature (2024): https://doi.org/10.1038/s41586-024-07558-y.
- Schlegel et al., Whole-brain annotation and multi-connectome cell typing of Drosophila, Nature (2024): https://doi.org/10.1038/s41586-024-07686-5.
- Zheng et al., A complete electron microscopy volume of the brain of adult Drosophila melanogaster, Cell (2018): https://doi.org/10.1016/j.cell.2018.06.019.

## Neural model

Shiu et al. (2024), A leaky integrate-and-fire computational model based on the connectome of the entire adult Drosophila brain reveals insights into sensorimotor processing: https://doi.org/10.1038/s41586-024-07763-9.

Reference model source inspected: https://github.com/philshiu/Drosophila_brain_model and the MIT Eon fork above. We independently implement a reduced Euler LIF model with cited constants. No numerical equivalence to the complete Brian2 reference is claimed. The game-specific encoder, decoder and protection policy are original.

Other repositories were studied for architecture, not copied or mechanically rewritten into this app. The GPL Eon benchmark suite and repositories with unclear code licensing are not distributed as application source. Research-only local downloads are gitignored.

## Runtime dependencies

Next.js, React, Three.js, Lucide, MuJoCo and Modal retain their upstream licenses. Package versions are recorded in the web lockfile and Python scripts. Google Fonts serves DM Sans and IBM Plex Mono; font loading uses a CSS fallback if unavailable.
