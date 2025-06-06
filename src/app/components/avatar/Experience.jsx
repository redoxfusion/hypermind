"use client";
import { useAILawyer } from "@/hooks/useAILawyer";
import {
  CameraControls,
  Environment,
  Float,
  Html,
  Loader,
  useGLTF,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva, button, useControls } from "leva";
import { Suspense, useEffect, useRef, useState } from "react";
import { degToRad } from "three/src/math/MathUtils";
import { MessagesList } from "./MessagesList";
import { Avatar } from "./Avatar";
import { TypingBox } from "./TypingBox";

export const Experience = () => {
  const teacher = useAILawyer((state) => state.teacher);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Typing Box */}
      <div className="z-10 md:justify-center fixed bottom-4 left-4 right-4 flex gap-3 flex-wrap justify-stretch px-4 md:px-8">
        <TypingBox />
      </div>

      <Leva hidden />
      <Loader />

      <Canvas
        camera={{
          position: [0, 0, 0.0001],
        }}
        style={{
          height: "100vh",
          width: "100vw",
          background: "linear-gradient(to right, rgb(255, 255, 255), #2FBFDE)",
        }}
      >
        <CameraManager />

        <Suspense fallback={null}>
          <Float
            speed={0.5}
            floatIntensity={0.2}
            rotationIntensity={0.1}
          >
            <Environment preset="sunset" />
            <ambientLight intensity={0.8} color="pink" />
            <Avatar
              Avatar={Avatar}
              key={Avatar}
              position={isMobile ? [0, -2, -3.5] : [-1, -1.7, -3]}
              scale={isMobile ? 1.2 : 1.5}
              rotation-y={degToRad(isMobile ? 0 : 22)}
            />
          </Float>
        </Suspense>
      </Canvas>
    </>
  );
};

const CameraManager = () => {
  const controls = useRef();
  const loading = useAILawyer((state) => state.loading);
  const currentMessage = useAILawyer((state) => state.currentMessage);

  useEffect(() => {
    if (loading || currentMessage) {
      controls.current?.setPosition(0.05, 0, 0.1, true);
      controls.current?.zoomTo(1.3, true);
    }
  }, [loading, currentMessage]);

  useControls("Helper", {
    getCameraPosition: button(() => {
      const position = controls.current.getPosition();
      const zoom = controls.current.camera.zoom;
      console.log([...position], zoom);
    }),
  });

  return (
    <CameraControls
      ref={controls}
      minZoom={1}
      maxZoom={3}
      polarRotateSpeed={-0.3}
      azimuthRotateSpeed={-0.3}
      mouseButtons={{
        left: 1,
        wheel: 16,
      }}
      touches={{
        one: 32,
        two: 512,
      }}
    />
  );
};

useGLTF.preload("/models/classroom_default.glb");
useGLTF.preload("/models/classroom_alternative.glb");
