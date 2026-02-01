
import { PongSessionsRoom } from './pong_types';
import { PongEngine } from './pong_game_engine';
import { FastifyInstance } from 'fastify';


const pongEngine = PongEngine.getInstance();
const pongGameSessionsRoom = PongSessionsRoom.getInstance();

export { pongEngine, pongGameSessionsRoom, addIntervalStopHook };
