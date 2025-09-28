import type { WebSocketServer } from 'ws';

export default function initSockets(wss: WebSocketServer) {
  wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to ANTA realtime (TS)' }));

    ws.on('message', (msg) => {
      try {
        const data = JSON.parse(msg.toString());
        if (data?.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', time: Date.now() }));
        }
      } catch (e) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message' }));
      }
    });
  });
}
