import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { IFCLoader } from "web-ifc-three";

const IfcModel = () => {
  const ifcLoaderRef = useRef();

  useEffect(() => {
    const ifcLoader = new IFCLoader();
    ifcLoader.ifcManager.setWasmPath("https://unpkg.com/web-ifc@0.0.36/",
    true);
    
    IFCLoader.load('/cabinet.ifc', (ifcModel) => {
      ifcLoaderRef.current.add(ifcModel);
    });

    return () => {
      ifcLoader.ifcManager.dispose();
    };
  }, []);

  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
      <OrbitControls />
      <group ref={ifcLoaderRef} />
    </Canvas>
  );
};

export default IfcModel;
