"use client";

import { useEffect, useRef, type ReactElement } from "react";
import * as THREE from "three";

/**
 * HeroThreeAnimation
 *
 * Purpose: Render a lightweight Three.js animation for the landing hero section.
 * Inputs: none.
 * Output: A responsive container that hosts the WebGL canvas.
 * Side effects: Creates an animation loop, resize handling, and disposes all
 * resources when unmounted.
 */
export default function HeroThreeAnimation(): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    // Build the Three.js scene and background color used by the hero card.
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe6fffb);

    // Configure a perspective camera with a small forward offset.
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0.2, 5.2);

    // Create the renderer and mount it inside the component container.
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    /**
     * Keep the canvas synchronized with container dimensions while enforcing
     * a bounded hero-friendly height.
     */
    const setSize = (): void => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(260, Math.min(420, Math.round(window.innerHeight * 0.36)));
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    setSize();

    // Main demo mesh: a stylized torus knot with emissive accent.
    const knotGeometry = new THREE.TorusKnotGeometry(0.8, 0.24, 180, 24);
    const knotMaterial = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0f766e,
      emissiveIntensity: 0.2,
      metalness: 0.35,
      roughness: 0.45,
    });
    const knot = new THREE.Mesh(knotGeometry, knotMaterial);
    scene.add(knot);

    // Secondary wire shell adds depth and motion contrast.
    const shellGeometry = new THREE.IcosahedronGeometry(1.6, 1);
    const shellMaterial = new THREE.MeshBasicMaterial({
      color: 0x14b8a6,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const shell = new THREE.Mesh(shellGeometry, shellMaterial);
    scene.add(shell);

    // Particle points create subtle ambient motion around the core mesh.
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 140;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      const radius = 2.4 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi) * 0.55;
      const z = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;
    }
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x0891b2,
      size: 0.028,
      transparent: true,
      opacity: 0.55,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Lighting setup keeps the object readable without harsh shadows.
    scene.add(new THREE.HemisphereLight(0xffffff, 0x7dd3fc, 0.85));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.05);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    let frameId = 0;
    const startedAt = performance.now();

    /**
     * Run the render loop with gentle rotational and floating movement.
     */
    const tick = (now: number): void => {
      frameId = window.requestAnimationFrame(tick);
      const elapsed = (now - startedAt) * 0.001;

      knot.rotation.x = elapsed * 0.42;
      knot.rotation.y = elapsed * 0.58;
      knot.position.y = Math.sin(elapsed * 1.4) * 0.08;

      shell.rotation.x = elapsed * -0.18;
      shell.rotation.y = elapsed * 0.24;
      particles.rotation.y = elapsed * 0.06;

      renderer.render(scene, camera);
    };
    frameId = window.requestAnimationFrame(tick);

    // Observe host container changes to keep sizing accurate.
    const resizeObserver = new ResizeObserver(() => {
      setSize();
    });
    resizeObserver.observe(container);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      knotGeometry.dispose();
      knotMaterial.dispose();
      shellGeometry.dispose();
      shellMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden rounded-2xl border border-cyan-200/70 bg-cyan-50/70"
      aria-label="Landing page 3D demo animation"
    />
  );
}
