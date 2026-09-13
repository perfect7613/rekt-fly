"""Convert Apache-2.0 NeuroMechFly meshes to a browser GLB with original rigging."""
from pathlib import Path
import json, math, shutil
import numpy as np
import trimesh
import yaml
root=Path(__file__).resolve().parents[1]
base=root/'.cache/flygym'
rig=yaml.safe_load((base/'rigging.yaml').read_text())
pose=yaml.safe_load((base/'neutral.yaml').read_text())['joint_angles']
parents={'c_thorax':'world','c_head':'c_thorax','c_rostrum':'c_head','c_haustellum':'c_rostrum','c_abdomen12':'c_thorax','c_abdomen3':'c_abdomen12','c_abdomen4':'c_abdomen3','c_abdomen5':'c_abdomen4','c_abdomen6':'c_abdomen5'}
for side in 'lr':
 for part,parent in [('eye','c_head'),('pedicel','c_head'),('funiculus',side+'_pedicel'),('arista',side+'_funiculus'),('wing','c_thorax'),('haltere','c_thorax')]:parents[side+'_'+part]=parent
 for leg in 'fmh':
  prev='c_thorax'
  for part in ['coxa','trochanterfemur','tibia','tarsus1','tarsus2','tarsus3','tarsus4','tarsus5']:
   name=side+leg+'_'+part;parents[name]=prev;prev=name
scene=trimesh.Scene()
for name,parent in parents.items():
 spec=rig[name];left='l'+name[1:] if name.startswith('r') else name
 path=base/'meshes/simplified_max2000faces'/f'{left}.stl'
 mesh=trimesh.load(path,force='mesh');mesh.apply_scale(1000)
 if name.startswith('r'):mesh.apply_transform(np.diag([1,-1,1,1]))
 color=[118,80,38,255]
 if 'eye' in name:color=[151,39,24,255]
 elif 'wing' in name:color=[185,210,210,110]
 elif 'abdomen' in name:color=[72,53,31,255] if name[-1] in '246' else [143,100,44,255]
 elif 'tarsus' in name:color=[67,47,26,255]
 mesh.visual=trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(baseColorFactor=color,roughnessFactor=.65,metallicFactor=.08,alphaMode='BLEND' if 'wing' in name else 'OPAQUE',doubleSided=True))
 transform=trimesh.transformations.quaternion_matrix(spec['quat']);transform[:3,3]=spec['pos']
 refname=left;refparent=('l'+parent[1:]) if parent.startswith('r') else parent
 angles=[math.radians(pose.get(f'{refparent}-{refname}-{axis}',0)) for axis in ['roll','pitch','yaw']]
 if name.startswith('r'):angles[0]*=-1;angles[2]*=-1
 transform=transform @ trimesh.transformations.euler_matrix(*angles,axes='sxyz')
 scene.graph.update(frame_to=name,frame_from=parent,matrix=transform)
 scene.add_geometry(mesh,node_name=name+'_mesh',geom_name=name,parent_node_name=name)
out=root/'web/public/models/fly.glb';out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(scene.export(file_type='glb'))
shutil.copy(base/'LICENSE',root/'web/public/licenses/NeuroMechFly-Apache-2.0.txt')
(root/'web/public/models/provenance.json').write_text(json.dumps({'source':'https://github.com/NeLy-EPFL/flygym','commit':'38c8ec61034cd59bc5ba0de20688d4a3c0000d60','license':'Apache-2.0','changes':'STL to GLB; mirrored right body parts; neutral pose applied; browser materials added. Kinematic animation is original and is not validated biomechanics.'},indent=2))
print('GLB bytes',out.stat().st_size,'bounds',scene.bounds)
