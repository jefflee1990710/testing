import type { Metadata } from "next";
import type { ReactElement } from "react";
import AboutThreeAnimation from "@/src/components/AboutThreeAnimation";

export const metadata: Metadata = {
  title: "About | VC4S Starter Template",
  description: "About this starter template, with a Three.js WebGL demo.",
};

/**
 * About page with a Three.js 3D animation demo (client-side canvas).
 */
export default function AboutPage(): ReactElement {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          About
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600">
          This page includes a small{" "}
          <a
            href="https://threejs.org/"
            className="font-medium text-blue-600 underline-offset-2 hover:underline"
            rel="noreferrer"
            target="_blank"
          >
            Three.js
          </a>{" "}
          scene: a torus knot with a wireframe shell, animated in the browser
          with WebGL.
        </p>
        <div className="mt-8">
          <AboutThreeAnimation />
        </div>
      </div>
    </main>
  );
}
