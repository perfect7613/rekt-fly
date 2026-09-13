"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Game } from "@/lib/simulation";
export default function BrainView({ game }: { game: Game }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = host.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
    camera.position.set(0, 0, 11);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 5;
    controls.maxDistance = 18;
    const brain = new THREE.Group();
    brain.rotation.x = Math.PI * 0.12;
    scene.add(brain);
    const positions = (points: number[][]) =>
      new Float32Array(points.flatMap((p) => [p[0], -p[1], p[2]]));
    const bg = new THREE.BufferGeometry();
    bg.setAttribute(
      "position",
      new THREE.BufferAttribute(positions(game.circuit.context), 3),
    );
    const bgmat = new THREE.PointsMaterial({
      color: "#88968a",
      size: 0.05,
      transparent: true,
      opacity: 0.5,
    });
    brain.add(new THREE.Points(bg, bgmat));
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions(game.circuit.neurons.map((n) => n.pos)),
        3,
      ),
    );
    const colors = new Float32Array(game.circuit.neurons.length * 3);
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.065,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
    });
    brain.add(new THREE.Points(geometry, mat));
    // Only actual recorded edges; display the strongest connections to DNp01.
    const edgePositions = game.circuit.edges
      .filter(
        ([, b, w]) =>
          game.circuit.neurons[b].type === "DNp01" && Math.abs(w) >= 5,
      )
      .flatMap(([a, b]) => [
        game.circuit.neurons[a].pos,
        game.circuit.neurons[b].pos,
      ]);
    const lines = new THREE.BufferGeometry();
    lines.setAttribute(
      "position",
      new THREE.BufferAttribute(positions(edgePositions), 3),
    );
    const lineMat = new THREE.LineBasicMaterial({
      color: "#a6d879",
      transparent: true,
      opacity: 0.22,
    });
    brain.add(new THREE.LineSegments(lines, lineMat));
    const resize = () => {
      renderer.setSize(element.clientWidth, element.clientHeight);
      camera.aspect = element.clientWidth / element.clientHeight;
      camera.position.z = 11 / Math.min(1, camera.aspect);
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    const color = new THREE.Color();
    renderer.setAnimationLoop(() => {
      game.circuit.neurons.forEach((n, i) => {
        const muted =
          game.state.ablation === "both"
            ? n.type !== "DNp01"
            : game.state.ablation === n.type;
        color.set(
          muted
            ? "#58605c"
            : n.type === "DNp01"
              ? "#f3b975"
              : n.type === "LC4"
                ? "#c4ed8b"
                : "#80b9b1",
        );
        color.multiplyScalar(muted ? 0.6 : 0.45 + game.brain.activity[i] * 0.7);
        colors.set([color.r, color.g, color.b], i * 3);
      });
      geometry.attributes.color.needsUpdate = true;
      controls.update();
      renderer.render(scene, camera);
    });
    return () => {
      renderer.setAnimationLoop(null);
      observer.disconnect();
      controls.dispose();
      [geometry, bg, lines].forEach((g) => g.dispose());
      [mat, bgmat, lineMat].forEach((m) => m.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [game]);
  return (
    <div
      className="brain-canvas"
      ref={host}
      aria-label="3D FlyWire neuron positions and escape circuit connections; drag to rotate"
    />
  );
}
