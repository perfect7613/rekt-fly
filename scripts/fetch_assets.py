"""Download pinned public upstream data/assets; no credentials or runtime scrapers."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import urllib.request, json, hashlib
ROOT=Path(__file__).resolve().parents[1]
CACHE=ROOT/'.cache'
FLY='38c8ec61034cd59bc5ba0de20688d4a3c0000d60'
BRAIN='c976c7a90b2ac5a472c028b5862974217e93573f'
ANN='8587524c1748ce5ef2080822a2fc890fc03bf597'

def fetch(job):
    url,path,digest=job;path.parent.mkdir(parents=True,exist_ok=True)
    if not path.exists():
        with urllib.request.urlopen(url,timeout=120) as response:path.write_bytes(response.read())
    if digest and hashlib.sha256(path.read_bytes()).hexdigest()!=digest:raise ValueError(f'Checksum mismatch: {path.name}')
    return path.name

def main():
    tree=json.load(urllib.request.urlopen(urllib.request.Request(f'https://api.github.com/repos/NeLy-EPFL/flygym/git/trees/{FLY}?recursive=1',headers={'User-Agent':'REKT-FLY'})))
    prefix='src/flygym/assets/model/neuromechfly/'
    paths=[x['path'] for x in tree['tree'] if x['type']=='blob' and (prefix+'meshes/simplified_max2000faces/' in x['path'] or x['path'] in [prefix+'rigging.yaml',prefix+'pose/_manual_specs/neutral.yaml',prefix+'legacy/flygym1_seqikpy_yawpitchroll.xml'])]
    jobs=[]
    for f in paths:
        relative=f.removeprefix(prefix)
        if relative.endswith('/neutral.yaml'):relative='neutral.yaml'
        jobs.append((f'https://raw.githubusercontent.com/NeLy-EPFL/flygym/{FLY}/{f}',CACHE/'flygym'/relative,None))
    jobs += [(f'https://raw.githubusercontent.com/NeLy-EPFL/flygym/{FLY}/LICENSE',CACHE/'flygym/LICENSE',None),
      (f'https://raw.githubusercontent.com/flyconnectome/flywire_annotations/{ANN}/supplemental_files/Supplemental_file1_neuron_annotations.tsv',CACHE/'annotations.tsv','9a4f8b2f843196074431ebd7cd883536afa1be86c8a4ce90970441e8be81d1be'),
      (f'https://raw.githubusercontent.com/eonsystemspbc/drosophila_brain_model_lif/{BRAIN}/Connectivity_783.parquet',CACHE/'Connectivity_783.parquet','efeb23fb99098e9c390f6869969b2a121a2ee92c833cfc45ecb2c1d8e1af0347')]
    results=list(ThreadPoolExecutor(max_workers=6).map(fetch,jobs));print(f'Available: {len(results)} pinned source files.')
if __name__=='__main__':main()
