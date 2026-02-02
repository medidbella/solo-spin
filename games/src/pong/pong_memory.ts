
import { PongSessionsRoom } from './pong_session';
import { PongEngine } from './pong_game_engine';

const pongEngine = PongEngine.getInstance();
const pongGameSessionsRoom = PongSessionsRoom.getInstance();

export { pongEngine, pongGameSessionsRoom };