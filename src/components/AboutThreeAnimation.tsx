"use client";

import { useEffect, useRef, type ReactElement } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const KEYBOARD_ROTATE_STEP = 0.055;
const KEYBOARD_DOLLY_FACTOR = 0.92;

/**
 * AboutThreeAnimation
 *
 * Purpose: Mount a self-contained Three.js scene (torus knot + wireframe shell)
 * for the About page demo. Runs only in the browser after hydration.
 * Camera is driven by OrbitControls (mouse + keyboard).
 *
 * Inputs: none (props interface reserved for future options).
 * Output: A div that hosts the WebGL canvas and short control hints.
 * Side effects: Creates WebGL context, OrbitControls, animation frame, observers,
 * and listeners; cleans up on unmount.
 */
export default function AboutThreeAnimation(): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0.35, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const canvas = renderer.domElement;
    canvas.tabIndex = 0;
    canvas.setAttribute(
      "aria-label",
      "Interactive 3D view: click or focus to use mouse and keyboard controls",
    );
    canvas.className =
      "block w-full cursor-grab touch-none outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:cursor-grabbing";

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.85;
    controls.zoomSpeed = 0.9;
    controls.panSpeed = 0.75;
    controls.minDistance = 2;
    controls.maxDistance = 14;
    controls.maxPolarAngle = Math.PI * 0.92;
    controls.update();
    controls.saveState();

    controls.listenToKeyEvents(canvas);

    /**
     * Extra keys (WASD orbit, R reset, +/- zoom) when the canvas has focus.
     * OrbitControls already handles arrows (pan) and Ctrl/Meta/Shift+arrows (rotate).
     */
    const onSupplementalKeyDown = (event: KeyboardEvent): void => {
      if (document.activeElement !== canvas) {
        return;
      }
      if (event.ctrlKey || event.metaKey) {
        return;
      }

      switch (event.code) {
        case "KeyR":
          controls.reset();
          event.preventDefault();
          return;
        case "KeyW":
          controls.rotateUp(KEYBOARD_ROTATE_STEP);
          event.preventDefault();
          return;
        case "KeyS":
          controls.rotateUp(-KEYBOARD_ROTATE_STEP);
          event.preventDefault();
          return;
        case "KeyA":
          controls.rotateLeft(KEYBOARD_ROTATE_STEP);
          event.preventDefault();
          return;
        case "KeyD":
          controls.rotateLeft(-KEYBOARD_ROTATE_STEP);
          event.preventDefault();
          return;
        case "Equal":
        case "NumpadAdd":
          if (event.code === "NumpadAdd" || event.shiftKey) {
            controls.dollyIn(KEYBOARD_DOLLY_FACTOR);
            event.preventDefault();
          }
          return;
        case "Minus":
        case "NumpadSubtract":
          controls.dollyOut(KEYBOARD_DOLLY_FACTOR);
          event.preventDefault();
          return;
        default:
      }
    };
    canvas.addEventListener("keydown", onSupplementalKeyDown);

    /**
     * Clicking the padded container focuses the canvas so keyboard works without tabbing.
     */
    const onContainerPointerDown = (): void => {
      canvas.focus({ preventScroll: true });
    };
    container.addEventListener("pointerdown", onContainerPointerDown);

    /**
     * Sync canvas size to container width and a bounded height.
     */
    const setSize = (): void => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(320, Math.min(480, Math.round(window.innerHeight * 0.42)));
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    setSize();

    const solidGeometry = new THREE.TorusKnotGeometry(0.52, 0.16, 120, 16);
    const solidMaterial = new THREE.MeshStandardMaterial({
      color: 0x4f46e5,
      metalness: 0.4,
      roughness: 0.35,
    });
    const solidKnot = new THREE.Mesh(solidGeometry, solidMaterial);
    scene.add(solidKnot);

    const wireGeometry = new THREE.TorusKnotGeometry(0.56, 0.18, 72, 12);
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.32,
    });
    const wireKnot = new THREE.Mesh(wireGeometry, wireMaterial);
    scene.add(wireKnot);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x64748b, 0.9));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.05);
    keyLight.position.set(4.5, 6, 5);
    scene.add(keyLight);

    let frameId = 0;
    const start = performance.now();
    let lastFrameTime = performance.now();

    /**
     * Render loop: mesh motion plus damped OrbitControls.
     */
    const tick = (now: number): void => {
      frameId = window.requestAnimationFrame(tick);
      const deltaSeconds = (now - lastFrameTime) / 1000;
      lastFrameTime = now;
      const elapsed = (now - start) * 0.001;

      solidKnot.rotation.x = elapsed * 0.38;
      solidKnot.rotation.y = elapsed * 0.52;
      wireKnot.rotation.x = elapsed * -0.22;
      wireKnot.rotation.y = elapsed * 0.44;

      const bob = Math.sin(elapsed * 1.15) * 0.1;
      solidKnot.position.y = bob;
      wireKnot.position.y = bob;

      controls.update(deltaSeconds);
      renderer.render(scene, camera);
    };
    frameId = window.requestAnimationFrame(tick);

    const resizeObserver = new ResizeObserver(() => {
      setSize();
    });
    resizeObserver.observe(container);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      canvas.removeEventListener("keydown", onSupplementalKeyDown);
      container.removeEventListener("pointerdown", onContainerPointerDown);
      controls.dispose();
      solidGeometry.dispose();
      wireGeometry.dispose();
      solidMaterial.dispose();
      wireMaterial.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="w-full overflow-hidden rounded-xl border border-gray-200 bg-slate-100 shadow-sm"
        aria-label="Three.js canvas container"
      />
      <p className="px-0.5 text-xs leading-relaxed text-gray-500">
        <span className="font-medium text-gray-600">Mouse:</span> drag to orbit, wheel to
        zoom, right-drag or Ctrl/⌘/Shift+left-drag to pan.{" "}
        <span className="font-medium text-gray-600">Keyboard</span> (click the scene
        first): <kbd className="rounded border border-gray-300 bg-white px-1">W</kbd>
        <kbd className="rounded border border-gray-300 bg-white px-1">A</kbd>
        <kbd className="rounded border border-gray-300 bg-white px-1">S</kbd>
        <kbd className="rounded border border-gray-300 bg-white px-1">D</kbd> orbit; arrows
        pan; <kbd className="rounded border border-gray-300 bg-white px-1">Ctrl</kbd>/
        <kbd className="rounded border border-gray-300 bg-white px-1">⌘</kbd>/
        <kbd className="rounded border border-gray-300 bg-white px-1">Shift</kbd>
        +arrows rotate; <kbd className="rounded border border-gray-300 bg-white px-1">
          Shift+=
        </kbd>{" "}
        or numpad <kbd className="rounded border border-gray-300 bg-white px-1">+</kbd>/
        <kbd className="rounded border border-gray-300 bg-white px-1">−</kbd> zoom;{" "}
        <kbd className="rounded border border-gray-300 bg-white px-1">R</kbd> reset view.
      </p>
    </div>
  );
}
