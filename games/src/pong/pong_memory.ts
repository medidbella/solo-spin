
import { PongPlayer, PlayerState, PongSession } from './pong_types'

// import { WebSocket } from 'ws';

// export const defaultPlayerState: PlayerState = 'INIT';

const localPongGamesRoom = new Map<string, PongSession>(); // for local game session
const remotePongGamesRoom = new Map<string, PongSession>(); // for remote game session

export { localPongGamesRoom, remotePongGamesRoom };
