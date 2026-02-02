import fastify_lib from 'fastify';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const fastify = fastify_lib({
  logger: {
    transport: {
      targets: [
        {
          target: 'pino/file',
          options: { 
            destination: './logs/chat.log',
            mkdir: true 
          }
        },
        {
          target: 'pino-pretty',
          options: { 
            colorize: true, 
            translateTime: "SYS:standard",
            ignore: 'pid,hostname',
            singleLine: true
          }
        }
      ]
    }
  } 
});

const port = Number(process.env.PORT) || 3000;
const host = '0.0.0.0';
const onlineusers = new Map<string, string>();

fastify.get('/health', async () => { return { status: 'ok' }; });

// console.log(`${process.env.INTERNAL_API_SECRET}`)

const start = async () => {
  try {
    await fastify.listen({ port: port, host: host });

    const io = new Server(fastify.server, {
      path: '/socket.io/',
      cors: { origin: "*", credentials: true }
    });

    io.use((socket, next) => {
      try {
        const headercookie = socket.handshake.headers.cookie;
        if (!headercookie) return next(new Error('unauthorized'));
        const cookies = cookie.parse(headercookie);
        const token = cookies.accessToken;
        if (!token) return next(new Error('token missing'));
        const secret = process.env.JWT_SECRET || 'fallback';
        const decoded = jwt.verify(token, secret) as any;
        const userid = decoded.id || decoded.user_id || decoded.sub;
        if (!userid) return next(new Error('id not found'));
        socket.data.user = { id: String(userid), username: decoded.username || `user_${userid}` };
        next();
      } catch (err) { next(new Error('invalid token')); }
    });

    io.on('connection', (socket) => {
      const { id } = socket.data.user;
      onlineusers.set(id, socket.id);
      io.emit('update_user_list', Array.from(onlineusers.keys()));

      socket.on('private_message', async (data) => 
        {
          const targetid = String(data.to);
          const recipientsocketid = onlineusers.get(targetid);
          const backendEndpoint = process.env.NODE_ENV == "deployment" ? "internal" : "api"

          try 
          {
            const response = await fetch(`http://backend:3000/${backendEndpoint}/messages`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'x-internal-secret': process.env.INTERNAL_API_SECRET || 'fallback'
              },
              body: JSON.stringify({
                sender_id: Number(id),
                receiver_id: Number(targetid),
                content: data.content
              })
            });
            if (!response.ok)
            {
              const errData = await response.json() as any;
              console.error(`Message rejected by Backend: ${response.status} - ${errData.message}`);
              return;
            }
            if (recipientsocketid) 
              {
                io.to(recipientsocketid).emit('private_message', {
                  from: Number(id),
                  content: data.content
                });
              }
          } 
          catch (err) 
          {
            console.error("Could not reach backend container:", err); 
          }
        });

      socket.on('disconnect', () => {
        if (onlineusers.get(id) === socket.id) onlineusers.delete(id);
        io.emit('update_user_list', Array.from(onlineusers.keys()));
      });
    });
  } catch (err) { process.exit(1); }
};
start();