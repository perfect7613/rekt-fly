"""A bounded CPU smoke benchmark of the upstream tethered articulated body.
Not the browser gait, not a trained walking controller, not a full brain benchmark.
Run: modal run simulation/benchmark.py (after python scripts/fetch_assets.py).
"""
from pathlib import Path
import modal

ROOT=Path(__file__).resolve().parents[1]
image=(modal.Image.debian_slim(python_version='3.12')
       .pip_install('mujoco==3.13.0','numpy==2.5.3')
       .add_local_dir(ROOT/'.cache/flygym',remote_path='/assets'))
app=modal.App('rekt-fly-physics-check',image=image)

@app.function(cpu=2,memory=2048,timeout=120,max_containers=1)
def benchmark():
    import time,xml.etree.ElementTree as ET
    import mujoco,numpy as np
    root=ET.parse('/assets/legacy/flygym1_seqikpy_yawpitchroll.xml').getroot()
    simple={'Thorax':'c_thorax','Head':'c_head','Rostrum':'c_rostrum','Haustellum':'c_haustellum','A1A2':'c_abdomen12','A3':'c_abdomen3','A4':'c_abdomen4','A5':'c_abdomen5','A6':'c_abdomen6'}
    parts={'Coxa':'coxa','Femur':'trochanterfemur','Tibia':'tibia','Eye':'eye','Wing':'wing','Haltere':'haltere','Pedicel':'pedicel','Funiculus':'funiculus','Arista':'arista'}
    for elem in root.findall('./asset/mesh'):
        name=elem.attrib['name'].removeprefix('mesh_')
        if name in simple:part=simple[name]
        else:
            side=name[0];rest=name[1:]
            leg=rest[0].lower() if len(rest)>1 and rest[0] in 'FMH' and rest[1].isupper() else ''
            if leg:rest=rest[1:]
            part='l'+leg+'_'+parts.get(rest,rest.lower())
            # Source files are the LEFT mesh; mirror only right-hand anatomy.
            elem.set('scale','1000 -1000 1000' if side=='R' else '1000 1000 1000')
        elem.set('file',f'/assets/meshes/simplified_max2000faces/{part}.stl')
    # Benchmark the upstream attached body, without inventing a locomotion policy.
    start=time.perf_counter();model=mujoco.MjModel.from_xml_string(ET.tostring(root,encoding='unicode'));data=mujoco.MjData(model);load=time.perf_counter()-start
    start=time.perf_counter()
    for _ in range(2000):mujoco.mj_step(model,data)
    elapsed=time.perf_counter()-start
    if not np.isfinite(data.qpos).all():raise RuntimeError('Non-finite body state')
    if int(data.warning.number.sum())>0:raise RuntimeError('MuJoCo numerical warnings; benchmark invalid')
    return {'scope':'NeuroMechFly tethered articulated body; no brain, gait controller, rendering or network loop','mujoco':mujoco.__version__,'bodies':model.nbody,'degrees_of_freedom':model.nv,'steps':2000,'simulated_seconds':float(data.time),'wall_seconds':elapsed,'load_seconds':load,'simulation_to_wall_ratio':float(data.time)/elapsed,'finite_state':True}

@app.local_entrypoint()
def main():
    import json
    result=benchmark.remote();print(json.dumps(result,indent=2))
    (ROOT/'docs/physics-benchmark.json').write_text(json.dumps(result,indent=2)+'\n')
