# 多人在线 3D 游戏

这是一个基于 React、Three.js（通过 React Three Fiber）和 Rapier 物理引擎构建的多人在线 3D 游戏。该项目通过 WebSocket 实现实时的玩家连接、移动和互动。

## 特性

- **多人支持：** 实时玩家移动和互动，使用 WebSocket 进行通信。
- **3D 环境：** 创建了一个包含太阳光、环境光和物理引擎的 3D 场景。
- **物理引擎：** 使用 Rapier 物理引擎进行碰撞检测和物理模拟。
- **玩家控制：** 通过键盘控制玩家的移动和行为。
- **懒加载：** 使用 React 的 `Suspense` 组件懒加载 3D 模型。

## 运行项目

cd multiPlay
npm i
npm run dev
