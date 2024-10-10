import { WebSocketServer } from 'ws';

const server = new WebSocketServer({ port: 3001 });

let clients = {};

server.on('connection', (ws) => {
  const userId = Date.now();
  clients[userId] = ws;
  ws.send(JSON.stringify({ context: 'user', uuid: userId }));

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.context === 'message') {
      const { from, content } = data;
      for (const client of Object.values(clients)) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ context: 'message', from, text: content }));
        }
      }
    }
  });

  ws.on('close', () => {
    delete clients[userId];
  });
});

console.log('WebSocket server is running on ws://localhost:3001');

// "dev": "nodemon ./bin/www",