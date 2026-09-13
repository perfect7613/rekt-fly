"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Game, POOLS } from "@/lib/simulation";

export default function World({
  game,
  view,
  onError,
}: {
  game: Game;
  view: "arena" | "specimen";
  onError: (s: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
  }, [view]);
  useEffect(() => {
    const element = host.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      onError(
        "WebGL is unavailable. Enable hardware acceleration to see the 3D arena.",
      );
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#ddd9c9");
    scene.fog = new THREE.Fog("#ddd9c9", 22, 48);
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(11, 11, 14);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 3;
    controls.maxDistance = 26;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.target.set(0, 0, 0);
    scene.add(new THREE.HemisphereLight("#fff9df", "#787463", 2.6));
    const sun = new THREE.DirectionalLight("#fff9e8", 4);
    sun.position.set(-5, 12, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -10;
    sun.shadow.camera.right = 10;
    sun.shadow.camera.top = 10;
    sun.shadow.camera.bottom = -10;
    sun.shadow.normalBias = 0.025;
    scene.add(sun);
    const material = (color: string, roughness = 0.85) =>
      new THREE.MeshStandardMaterial({ color, roughness });
    const mesh = (
      geometry: THREE.BufferGeometry,
      mat: THREE.Material,
      x = 0,
      y = 0,
      z = 0,
    ) => {
      const m = new THREE.Mesh(geometry, mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      scene.add(m);
      return m;
    };
    mesh(
      new THREE.PlaneGeometry(200, 200),
      material("#d9d5c5"),
      0,
      -0.38,
      0,
    ).rotation.x = -Math.PI / 2;
    mesh(
      new THREE.CylinderGeometry(7.4, 7.5, 0.28, 96),
      material("#b8b6a1"),
      0,
      -0.2,
      0,
    );
    mesh(
      new THREE.CylinderGeometry(7.25, 7.25, 0.06, 96),
      material("#cac5ad"),
      0,
      -0.03,
      0,
    );
    const ring = mesh(
      new THREE.TorusGeometry(7.3, 0.035, 8, 120),
      material("#696e52"),
      0,
      0.03,
      0,
    );
    ring.rotation.x = Math.PI / 2;
    const grid = new THREE.GridHelper(13, 26, "#a8a58d", "#b7b39b");
    grid.position.y = 0.005;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.3;
    scene.add(grid);
    // Deterministic, lightweight scenery. No environment or texture service required.
    for (let i = 0; i < 32; i++) {
      const angle = i * 2.39996,
        radius = 5.5 + 0.8 * Math.sin(i * 13);
      const pebble = mesh(
        new THREE.IcosahedronGeometry(0.1 + (i % 3) * 0.05, 0),
        material(i % 2 ? "#aba790" : "#918d78"),
        Math.cos(angle) * radius,
        0.06,
        Math.sin(angle) * radius,
      );
      pebble.scale.set(1.5, 0.7, 1);
    }
    const poolGroups: THREE.Group[] = [];
    POOLS.forEach((pool, index) => {
      const group = new THREE.Group();
      group.position.set(pool.x, 0, pool.z);
      scene.add(group);
      poolGroups.push(group);
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(1.05, 1.1, 0.1, 48),
        material(index === 0 ? "#8b9b70" : index === 1 ? "#bda368" : "#ab7b60"),
      );
      base.receiveShadow = true;
      group.add(base);
      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(1.15, 0.018, 8, 64),
        new THREE.MeshBasicMaterial({ color: pool.color }),
      );
      halo.rotation.x = Math.PI / 2;
      halo.position.y = 0.04;
      group.add(halo);
      for (let j = 0; j < 7; j++) {
        const a = j * 2.4;
        const x = Math.cos(a) * 0.45,
          z = Math.sin(a) * 0.45;
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.014, 0.022, 0.6 + j * 0.06, 5),
          material("#59624a"),
        );
        stem.position.set(x, 0.3, z);
        group.add(stem);
        const leaf = new THREE.Mesh(
          new THREE.SphereGeometry(0.23, 7, 5),
          material(
            index === 0 ? "#a5b776" : index === 1 ? "#bba95a" : "#b57d55",
          ),
        );
        leaf.scale.set(0.7, 0.2, 1.5);
        leaf.rotation.z = (j % 2 ? 1 : -1) * 0.5;
        leaf.position.set(x + 0.08, 0.55 + j * 0.035, z);
        leaf.castShadow = true;
        group.add(leaf);
      }
      const nectar = new THREE.Mesh(
        new THREE.SphereGeometry(0.23, 20, 16),
        new THREE.MeshPhysicalMaterial({
          color: pool.color,
          roughness: 0.15,
          metalness: 0.1,
          transparent: true,
          opacity: 0.85,
        }),
      );
      nectar.position.y = 0.3;
      group.add(nectar);
    });
    const fly = new THREE.Group();
    scene.add(fly);
    let alive = true,
      loaded = false;
    const joints: {
      node: THREE.Object3D;
      base: THREE.Quaternion;
      phase: number;
    }[] = [];
    const disposeObject = (object: THREE.Object3D) =>
      object.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const mats = Array.isArray(obj.material)
            ? obj.material
            : [obj.material];
          mats.forEach((m) => m.dispose());
        }
      });
    new GLTFLoader().load(
      "/models/fly.glb",
      (gltf) => {
        if (!alive) {
          disposeObject(gltf.scene);
          return;
        }
        const model = gltf.scene;
        model.rotation.x = -Math.PI / 2;
        model.scale.setScalar(0.57);
        model.position.y = -0.12;
        fly.add(model);
        loaded = true;
        model.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.castShadow = !node.name.includes("wing");
            node.receiveShadow = true;
          }
          if (/^[lr][fmh]_coxa$/.test(node.name))
            joints.push({
              node,
              base: node.quaternion.clone(),
              phase:
                (node.name[0] === "l" ? 0 : Math.PI) +
                (node.name[1] === "m" ? Math.PI : 0),
            });
        });
      },
      undefined,
      () =>
        onError("The anatomical fly asset could not load. Reload to retry."),
    );
    const marker = new THREE.Mesh(
      new THREE.RingGeometry(0.75, 0.78, 64),
      new THREE.MeshBasicMaterial({
        color: "#40593c",
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65,
      }),
    );
    marker.rotation.x = -Math.PI / 2;
    marker.position.y = 0.015;
    scene.add(marker);
    const resize = () => {
      const w = element.clientWidth,
        h = element.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    let previousView = "arena";
    const axis = new THREE.Vector3(0, 1, 0);
    renderer.setAnimationLoop(() => {
      const s = game.state;
      fly.position.set(
        s.x,
        s.status === "liquidated" ? -0.1 : Math.sin(s.time * 6) * 0.02,
        s.z,
      );
      fly.rotation.y = s.heading;
      marker.position.x = s.x;
      marker.position.z = s.z;
      if (loaded)
        joints.forEach((j) => {
          const swing =
            s.status === "running"
              ? Math.sin(s.time * (s.escape > 0.2 ? 24 : 12) + j.phase) * 0.16
              : 0;
          j.node.quaternion
            .copy(j.base)
            .multiply(new THREE.Quaternion().setFromAxisAngle(axis, swing));
        });
      if (previousView !== viewRef.current) {
        previousView = viewRef.current;
        if (previousView === "specimen") {
          camera.position.set(s.x + 3.8, 3.1, s.z + 4.8);
          controls.target.copy(fly.position).add(new THREE.Vector3(0, 0.5, 0));
        } else {
          camera.position.set(11, 11, 14);
          controls.target.set(0, 0, 0);
        }
      }
      if (viewRef.current === "specimen" && s.status === "running") {
        const delta = new THREE.Vector3(s.x, 0.5, s.z).sub(controls.target);
        camera.position.add(delta);
        controls.target.add(delta);
      }
      controls.update();
      renderer.render(scene, camera);
    });
    return () => {
      alive = false;
      renderer.setAnimationLoop(null);
      observer.disconnect();
      controls.dispose();
      disposeObject(scene);
      grid.geometry.dispose();
      (grid.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [game, onError]);
  return (
    <div
      ref={host}
      className="world-canvas"
      aria-label="Interactive 3D NeuroMechFly arena. Drag to orbit, scroll to zoom."
    />
  );
}
