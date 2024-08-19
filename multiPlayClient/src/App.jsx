import { Canvas } from "@react-three/fiber";
import { KeyboardControls, Sky } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import { Suspense, useEffect, useRef, useState } from "react";
import { Depot } from "./assets/depot";
import Player from "./components/Player";
import { v4 as uuidv4 } from 'uuid';
import OtherPlayer from "./components/OtherPlayer";
export default function App() {
  // 设置太阳位置的状态变量
  const [sunPosition, setSunPosition] = useState([40, 40, -40]);

  // 用于WebSocket连接的引用
  const socketRef = useRef(null);

  // 存储其他玩家信息的状态变量
  const [otherPlayers, setOtherPlayers] = useState({});

  // 存储当前玩家ID的状态变量
  const [playerId, setPlayerId] = useState(null);

  // 存储当前玩家按键状态的映射
  const [pressingKeyMap, setPressingKeyMap] = useState({
    forward: false,
    backward: false,
    leftward: false,
    rightward: false,
    jump: false,
    run: false,
  });

  // 定义键盘控制的映射关系
  const keyboardMap = [
    { name: "forward", keys: ["ArrowUp", "KeyW"] },
    { name: "backward", keys: ["ArrowDown", "KeyS"] },
    { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
    { name: "rightward", keys: ["ArrowRight", "KeyD"] },
    { name: "jump", keys: ["Space"] },
    { name: "run", keys: ["Shift"] },
  ];

  // 存储其他玩家按键状态的映射
  const [otherPlayersKeyPressingMap, setOtherPlayersPressing] = useState([]);

  useEffect(() => {
    // 生成唯一的5位玩家ID
    const id = uuidv4().replace(/-/g, '').substring(0, 5);
    setPlayerId(id);

    // 建立WebSocket连接
    socketRef.current = new WebSocket('ws://192.168.8.167:8080');

    // 连接成功时的回调
    socketRef.current.onopen = () => {
      console.log('Connected to the server');
      // 向服务器发送注册信息
      socketRef.current.send(JSON.stringify({
        type: 'register_player',
        playerId: id
      }));
    };

    // 接收到消息时的回调
    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'player_connected') {
        // 有新玩家连接时的处理
        console.log('Player connected:', data.playerId);
      } else if (data.type === 'position_update' && data.playerId !== id) {
        // 更新其他玩家的位置和方向
        setOtherPlayers(prevState => ({
          ...prevState,
          [data.playerId]: {
            position: data.position,
            quaternion: data.quaternion,
            timestamp: Date.now() // 添加时间戳
          }
        }));
      } else if (data.type === 'pressing_update' && data.playerId !== id) {
        // 更新其他玩家的按键状态
        setOtherPlayersPressing(prevState => ({
          ...prevState,
          [data.playerId]: {
            keyMapPressing: data.keyMapPressing
          }
        }));
      } else if (data.type === 'player_disconnected') {
        // 处理玩家断开连接
        console.log('Player disconnected:', data.playerId);
        setOtherPlayers(prevState => {
          const { [data.playerId]: removedPlayer, ...remainingPlayers } = prevState;
          return remainingPlayers;
        });
      }
    };

    // 连接错误时的回调
    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // 连接关闭时的回调
    socketRef.current.onclose = (event) => {
      console.log('WebSocket closed:', event.reason || 'No reason provided');
    };

    // 组件卸载时关闭WebSocket连接
    return () => {
      socketRef.current.close();
    };
  }, []);

  return (
    <>
      {/* 创建3D场景的画布 */}
      <Canvas
        shadows
        onPointerDown={(e) => {
          e.target.requestPointerLock(); // 点击画布时请求鼠标指针锁定
        }}
      >
        {/* 环境光 */}
        <ambientLight intensity={0.3} />

        {/* 方向光和阴影设置 */}
        <directionalLight
          castShadow
          shadow-mapSize={[2048, 2048]}
          intensity={10}
          color={"#908669"}
          shadow-bias={-0.00001}
          position={sunPosition}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-top={100}
          shadow-camera-right={100}
          shadow-camera-bottom={-100}
          shadow-camera-left={-100}
          shadow-camera-near={0.5}
          shadow-camera-far={500}
          shadow-radius={2}
          shadow-blurSamples={10}
        />
        <directionalLight />

        {/* 天空设置 */}
        <Sky sunPosition={sunPosition} />

        {/* 懒加载和物理引擎 */}
        <Suspense fallback={null}>
          <Physics>
            {/* 键盘控制的组件 */}
            <KeyboardControls map={keyboardMap} onChange={(key, pressed) => {
              setPressingKeyMap((prev) => ({
                ...prev,
                [key]: pressed
              }));
            }}>
              {/* 玩家组件，处理玩家移动和行为 */}
              <Player socketRef={socketRef} pressingKeyMap={pressingKeyMap} />
            </KeyboardControls>

            {/* 渲染其他玩家 */}
            {Object.keys(otherPlayers).map((id) => (
              <OtherPlayer
                key={id}
                position={otherPlayers[id].position}
                quaternion={otherPlayers[id].quaternion}
                timestamp={otherPlayers[id].timestamp}
                keyPressingMap={otherPlayersKeyPressingMap[id]?.keyMapPressing}
              />
            ))}

            {/* 固定的静态物体，使用三角网格进行碰撞检测 */}
            <RigidBody type="fixed" colliders="trimesh">
              <Depot />
            </RigidBody>
          </Physics>
        </Suspense>
      </Canvas>
    </>
  );
}
