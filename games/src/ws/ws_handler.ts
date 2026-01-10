
import { FastifyRequest, FastifyReply } from "fastify";
import { SocketStream } from '@fastify/websocket';

import { registerNewPlayer } from '../game_manager/games_utiles';
import { ClientMessage  } from '../../../shared/types'


function wsHandler(connection: SocketStream, req: FastifyRequest) {

    // // regardless of what the object actually is.
    // const debugConnection = connection as any;

    // console.log("Constructor Name:", debugConnection.constructor.name);
    
    // // Now this won't cause a compile error
    // if (debugConnection.headers) {
    //     console.log("Headers:", debugConnection.headers);
    // }
    
    // 'connection.socket' is the actual WebSocket object we use to talk
    const socket = connection.socket;

    console.log('🔌 New WebSocket connection established');
    // console.log('🔌 Connection state:', socket.readyState);
    // console.log('🔌 Protocol:', socket.protocol);

    // const playerId: string = req.cookies.playerId as string;
    // if (!playerId) {
    //     console.log(" Need ID !!!");
    // } else {
    //     registerNewPlayer(playerId, socket);
    //     console.log(`create new player ID: ${playerId}`);
    // }

    socket.on('message', (rawData: any) => {
        try {
            // 1. Convert Buffer to String
            const messageString = rawData.toString();
            console.log("📩 Raw received:", messageString);
    
            // 2. Parse JSON
            const parsedMessage = JSON.parse(messageString) as ClientMessage;
    
            // 3. Handle based on type
            switch (parsedMessage.type) {
                case 'CONNECT':
                    console.log(`👤 User ${parsedMessage.payload.username} wants to play ${parsedMessage.payload.game}`);
                    // Handle connection logic...
                    break;
                    
                case 'GAME_INPUT':
                    console.log(`🎮 Move received:`, parsedMessage.payload);
                    // Handle game move...
                    break;
    
                default:
                    console.warn("⚠️ Unknown message type:", parsedMessage);
            }
    
        } catch (error) {
            console.error("❌ Failed to parse message:", error);
            // Optional: Send an error back to client
        }
    });

    // const response = {
    //     message: 'Hello from the server!!',
    // };
    
    // console.log('📤 Sending AUTH_SUCCESS:', response);
    // socket.send(JSON.stringify(response));
    
}

export { wsHandler };