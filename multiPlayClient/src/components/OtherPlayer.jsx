import { Quaternion, Vector3 } from 'three';
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import Pete from "./Pete";
import { EcctrlAnimation, useGame } from 'ecctrl';
function OtherPlayer({ position, quaternion, timestamp,keyPressingMap }) {
  const ref = useRef(null);
  const targetPositionRef = useRef(new Vector3()); // 使用 useRef 代替 state
  const targetQuaternionRef = useRef(new Quaternion());
  const smoothFactor = 0.05; // 插值系数，尝试调整这个值
  const idleAnimation = useGame((state) => state.idle);
  const walkAnimation = useGame((state) => state.walk);
  const runAnimation = useGame((state) => state.run);
  const animationSet = {
      idle: "idle", // 闲置时动画
      walk: "walk", // 行走动画
      run: "run", // 跑步动画
      jump: "jump", // 跳跃动画
      jumpIdle: "jumpIdle", // 跳跃动画
      jumpLand: "land", // 落地动画
      fall: "jumpIdle", // 坠落滞空动画
    };
  useEffect(()=>{
    if(keyPressingMap){

    //当每个键都没按时，播放idle动画
    if(Object.values(keyPressingMap).every(value => value === false)){
     idleAnimation()
    } 
    //当 forward,backward,leftward,rightward任意一个为true时，播放walk动画
    else if(
     (keyPressingMap.forward ||
      keyPressingMap.backward ||
      keyPressingMap.leftward ||
      keyPressingMap.rightward) && !keyPressingMap.run
    ){
      walkAnimation()
    }
    else if((keyPressingMap.forward ||
      keyPressingMap.backward ||
      keyPressingMap.leftward ||
      keyPressingMap.rightward) && keyPressingMap.run){
      runAnimation()
    }
    }
  
  },[keyPressingMap])
  useEffect(() => {
    targetPositionRef.current.set(position.x, position.y, position.z);
    targetQuaternionRef.current.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
  }, [position, quaternion]);

  useFrame(() => {
    if (ref.current) {
      const currentPos = ref.current.position;
      const currentQuat = ref.current.quaternion;

      // 插值平滑位置
      currentPos.lerp(targetPositionRef.current, smoothFactor);

      // 使用 copy 方法复制目标四元数
      currentQuat.slerp(targetQuaternionRef.current, smoothFactor);
    }
  });

  return (
    <EcctrlAnimation animationSet={animationSet} characterURL={'/pete.glb'}>
      <mesh ref={ref}>
        <Pete />
        {/* 用矩形代替模型 */}
        {/* <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="red" /> */}
      </mesh>
     </EcctrlAnimation>
     
  );
}

export default OtherPlayer;
