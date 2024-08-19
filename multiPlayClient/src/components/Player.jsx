import { Quaternion } from 'three';
import { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";
import Ecctrl from "ecctrl";
import { useFrame } from "@react-three/fiber";

// 玩家组件，用于控制和更新玩家的位置、旋转和按键状态，并通过 WebSocket 与服务器通信
function Player({ socketRef, pressingKeyMap }) {
  const playerRef = useRef(null); // 用于引用玩家的 3D 对象
  const [position, setPosition] = useState([6, 10, 3]); // 初始化玩家位置
  const lastUpdateRef = useRef(Date.now()); // 记录上次更新的位置的时间戳
  const rigidBodyRef = useRef(); // 用于引用刚体组件
  const [isPressing, setIsPressing] = useState(false); // 记录是否有按键被·按下
  const sendWs = ()=>{
    const newPosition = new Vector3();
    const newQuaternion = new Quaternion();
    
    // 获取当前玩家的世界坐标位置和旋转
    playerRef.current.getWorldPosition(newPosition);
    playerRef.current.getWorldQuaternion(newQuaternion);

    // 如果 WebSocket 连接是打开的，发送位置和旋转数据到服务器
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'update_position',
        position: { x: newPosition.x, y: newPosition.y, z: newPosition.z },
        quaternion: { x: newQuaternion.x, y: newQuaternion.y, z: newQuaternion.z, w: newQuaternion.w }
      }));

      // 发送按键状态到服务器
      socketRef.current.send(JSON.stringify({
        type: 'update_pressing',
        keyMapPressing: pressingKeyMap
      }));
    }
  }
  // 在每一帧更新时执行，用于检查是否需要发送位置和按键状态到服务器
  useFrame(() => {
    if (playerRef.current) {
      const now = Date.now();
      const updateInterval = 100; // 设置更新间隔时间为 100 毫秒

      // 如果当前时间与上次更新的时间间隔超过设定的更新间隔
      if (now - lastUpdateRef.current > updateInterval) {
        if(isPressing){ //当其他玩家按下了任何人物控制按键时
          sendWs()
        }
        lastUpdateRef.current = now; // 更新上次发送数据的时间戳
      }
    }
  });

  // 当按键状态 pressingKeyMap 发生变化时更新 isPressing 状态
  useEffect(() => {
    setIsPressing(Object.values(pressingKeyMap).some(value => value));
  }, [pressingKeyMap]);

  // 当 isPressing 状态变化时（即开始或停止按键时）发送玩家位置和按键状态到服务器
  useEffect(() => {
    sendWs()
  }, [isPressing]);
  // 返回玩家控制的 3D 组件
  return (
    <Ecctrl
      ref={rigidBodyRef}
      position={position}
      camInitDis={-0.01}
      camLerpMult={1000}
      camMinDis={-0.01}
      camFollowMult={100}
      turnVelMultiplier={1}
      turnSpeed={100}
      mode="CameraBasedMovement" // 设置为基于摄像机的运动模式
      controllerKeys={{ forward: 12, backward: 13, leftward: 14, rightward: 15, jump: 2 }} // 绑定按键映射
    >
      <group ref={playerRef}></group>
    </Ecctrl>
  );
}

export default Player;
