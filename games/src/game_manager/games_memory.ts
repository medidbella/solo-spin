
import { GamesPlayer } from './games_types';

const onlinePlayersRooom = new Map<string, GamesPlayer>();

const availablePlayersRoom = new Map<string, GamesPlayer>();

const playingPlayersRoom = new Map<string, GamesPlayer>();

export { onlinePlayersRooom, availablePlayersRoom, playingPlayersRoom };
