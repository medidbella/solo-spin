
import { Player, PlayerState, GameSession } from './types'

export const defaultPlayerState: PlayerState = 'INIT';

const localGamesRoom = new Map<string, GameSession>();

const remoteGamesRoom = new Map<string, GameSession>();

// online players
const onlinePlayersRooom = new Map<string, Player>();

// Available Players
const availablePlayersRoom = new Map<string, Player>();

// playing players
const playingPlayersRoom = new Map<string, Player>();

export { onlinePlayersRooom, availablePlayersRoom, playingPlayersRoom, localGamesRoom, remoteGamesRoom };