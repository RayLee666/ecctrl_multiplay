const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080, host: "192.168.8.167" }); // 监听所有接口
const clients = new Map();

server.on("connection", (ws) => {
	// 将连接的客户端和一个空的 playerId 关联
	clients.set(ws, { playerId: null });

	ws.on("message", (message) => {
		const data = JSON.parse(message);

		if (data.type === "register_player") {
			// 使用客户端发送的 playerId
			clients.get(ws).playerId = data.playerId;

			// 通知所有客户端有新玩家加入
			broadcast({
				type: "player_connected",
				playerId: data.playerId,
			});
		} else if (data.type === "update_position") {
			if (clients.get(ws).playerId) {
				// 广播位置更新
				broadcast({
					type: "position_update",
					playerId: clients.get(ws).playerId,
					position: data.position,
					quaternion: data.quaternion,
				});
			}
		} else if (data.type === "update_pressing") {
			if (clients.get(ws).playerId) {
				// 广播位置更新
				broadcast({
					type: "pressing_update",
					playerId: clients.get(ws).playerId,
					keyMapPressing: data.keyMapPressing,
				});
			}
		}
	});

	ws.on("close", () => {
		if (clients.get(ws).playerId) {
			// 通知所有客户端有玩家离开
			broadcast({
				type: "player_disconnected",
				playerId: clients.get(ws).playerId,
			});
		}
		clients.delete(ws);
	});
});

function broadcast(message) {
	const messageString = JSON.stringify(message);
	clients.forEach((client, ws) => {
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(messageString);
		}
	});
}

console.log("WebSocket server is running on ws://192.168.8.167:8080");
