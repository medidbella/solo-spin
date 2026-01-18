import Fastify from 'fastify';
import { Server } from 'socket.io';

const fastify = Fastify({ 
  logger: true 
});

// DEVOPS CONFIGURATION:
// These values are controlled by the Docker environment.
// WARNING: Do not hardcode the port to a different value, or Nginx will lose connection.
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0'; // Required for Docker container exposure

// Health check route to verify if the container is running properly
fastify.get('/health', async () => { 
  return { status: 'ok', service: 'chat-service' };
});

const start = async () => {
  try {
    // 1. Initialize the HTTP Server first
    await fastify.listen({ port: PORT, host: HOST });
    fastify.log.info(`Server initialization complete on ${HOST}:${PORT}`);

    // 2. Attach Socket.io to the HTTP server
    // NOTE: This setup uses the same port (3000) for both HTTP and WebSockets
    const io = new Server(fastify.server, {
      // NETWORK CONSTRAINT: 
      // Nginx is configured to proxy requests specifically to '/socket.io/'.
      // Changing this path will break the connection through the gateway.
      path: '/socket.io/',
      
      cors: {
        origin: "*", // Allowed for development flexibility
        methods: ["GET", "POST"]
      }
    });

    // ========================================================
    // DEVELOPER ZONE: Implement Chat Logic Below
    // ========================================================
    
    io.on('connection', (socket) => {
      // Log connection for debugging
      fastify.log.info(`Client connected with Socket ID: ${socket.id}`);

      // TODO: Implement your event listeners here
      // Example: Handling a 'message' event from the client
      socket.on('message', (data) => {
        // Log the received data
        fastify.log.info(`Received payload: ${JSON.stringify(data)}`);
        
        // Example: Broadcast the message to all connected clients
        io.emit('message', data);
      });

      // Cleanup on disconnect
      socket.on('disconnect', () => {
        fastify.log.info(`Client disconnected: ${socket.id}`);
      });
    });
    
    // ========================================================
    // END OF DEVELOPER ZONE
    // ========================================================

  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();