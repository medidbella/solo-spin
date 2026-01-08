
import { Player, PlayerState, GameSession } from './types'

import { WebSocket } from 'ws';

export const defaultPlayerState: PlayerState = 'INIT';

const localGamesRoom = new Map<string, GameSession>(); // for local game session

const remoteGamesRoom = new Map<string, GameSession>(); // for remote game session

const onlinePlayersRooom = new Map<string, Player>(); // online players (can be playing or not, but they are online in our website)

const availablePlayersRoom = new Map<string, Player>(); // // Available Players (not playing, and ready to play it an pong game invite comes)

const playingPlayersRoom = new Map<string, Player>(); // playing players (playing, not available to play)

// export let merorySocketRoom = new Map <string, WebSocket>();

export { onlinePlayersRooom, availablePlayersRoom, playingPlayersRoom, localGamesRoom, remoteGamesRoom };