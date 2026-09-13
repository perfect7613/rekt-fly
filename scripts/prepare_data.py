"""Build a small, attributed v783 induced circuit; never synthesize connections."""
import csv, json, hashlib
from pathlib import Path
from collections import defaultdict
import pyarrow.parquet as pq
import numpy as np

root = Path(__file__).resolve().parents[1]
cache = root / '.cache'
rows = list(csv.DictReader((cache / 'annotations.tsv').open(), delimiter='\t'))
selected = sorted([r for r in rows if r['cell_type'] in ('LC4', 'LPLC2', 'DNp01')], key=lambda r: r['root_id'])
index = {r['root_id']: i for i, r in enumerate(selected)}
counts = defaultdict(int)
for batch in pq.ParquetFile(cache / 'Connectivity_783.parquet').iter_batches(batch_size=200000, columns=['Presynaptic_ID', 'Postsynaptic_ID', 'Excitatory x Connectivity']):
    a = batch.to_pydict()
    for pre, post, weight in zip(a['Presynaptic_ID'], a['Postsynaptic_ID'], a['Excitatory x Connectivity']):
        i, j = index.get(str(pre)), index.get(str(post))
        if i is not None and j is not None:
            counts[i, j] += weight
# Annotation pos_* fields are FAFB voxel coordinates (4 x 4 x 40 nm).
coords = np.array([[float(r['pos_x'])*4, float(r['pos_y'])*4, float(r['pos_z'])*40] for r in rows])
center = np.median(coords, axis=0)
scale = float(np.max(np.ptp(coords, axis=0)))
def pos(r):
    return [round((float(r[k])*unit-center[i])/scale*8, 5) for i,(k,unit) in enumerate(zip(('pos_x','pos_y','pos_z'),(4,4,40)))]
meta = {'dataset':'FlyWire FAFB v783', 'scope':'LC4 + LPLC2 + DNp01 induced subgraph', 'license':'CC BY-NC 4.0', 'source':'https://github.com/eonsystemspbc/drosophila_brain_model_lif', 'annotations':'https://github.com/flyconnectome/flywire_annotations', 'annotationCommit':'8587524c1748ce5ef2080822a2fc890fc03bf597', 'connectivityCommit':'c976c7a90b2ac5a472c028b5862974217e93573f', 'hashes':{f:hashlib.sha256((cache/f).read_bytes()).hexdigest() for f in ['annotations.tsv','Connectivity_783.parquet']}, 'neurons':len(selected), 'edges':len(counts), 'note':'Connectivity is a preprocessed v783 derivative; annotations are a later pinned v783 annotation revision. Rendered background points are sampled annotations, not simulated neurons.'}
output = {'meta':meta,'neurons':[{'id':r['root_id'],'type':r['cell_type'],'side':r['side'],'pos':pos(r)} for r in selected], 'edges':[[i,j,w] for (i,j),w in sorted(counts.items()) if w], 'context':[pos(r) for r in rows[::24]]}
(root/'web/public/data/escape-circuit.json').write_text(json.dumps(output,separators=(',',':')))
(root/'web/public/data/provenance.json').write_text(json.dumps(meta,indent=2))
print(json.dumps(meta,indent=2))
