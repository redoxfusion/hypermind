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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState("bored");

  // Check for mobile screen
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Animation control based on talking state
  const isTalking = useAILawyer((state) => state.currentMessage);
  useEffect(() => {
    if (isTalking) {
      setCurrentAnimation("talking");
    } else if (currentAnimation === "talking") {
      setCurrentAnimation("bored");
    }
  }, [isTalking, currentAnimation]);

  const animations = [
    "bored",
    "hip_hop_dancing",
    "talking",
    "salsa_dancing",
    "dwarf_idle",
    "standing_arguing",
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const selectAnimation = (animation) => {
    if (animation !== "talking") {
      setCurrentAnimation(animation);
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Typing Box */}
      <div className="z-10 md:justify-center fixed mt-5 left-4 right-4 flex gap-3 flex-wrap justify-stretch px-4 md:px-8">
        <TypingBox />
      </div>

      {/* Circular Menu */}
      <div className="fixed bottom-8 right-8 z-20">
        <button
          onClick={toggleMenu}
          className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg hover:bg-blue-600 transition"
        >
          ☰
        </button>
        {isMenuOpen && (
          <div className="absolute bottom-20 right-0 flex flex-col gap-2">
            {animations.map((animation) => (
              <button
                key={animation}
                onClick={() => selectAnimation(animation)}
                className="w-12 h-12 bg-gray-800 rounded-full text-white text-sm flex items-center justify-center hover:bg-gray-700 transition"
                title={animation.replace(/_/g, " ")}
              >
                {animation.charAt(0).toUpperCase()}
              </button>
            ))}
          </div>
        )}
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
              animation={currentAnimation}
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
      controls.current?.setPosition(0, 0, 0.0001, true);
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
