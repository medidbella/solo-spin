
import { GamesPlayer } from './games_types';
import { PongEngine } from '../pong/pong_game_engine';

const pongEngine = PongEngine.getInstance();

const onlinePlayersRooom = new Map<string, GamesPlayer>(); // online players (can be playing or not, but they are online in our website)

const availablePlayersRoom = new Map<string, GamesPlayer>(); // // Available Players (not playing, and ready to play it an pong game invite comes)

const playingPlayersRoom = new Map<string, GamesPlayer>(); // playing players (playing, not available to play)

export { pongEngine, onlinePlayersRooom, availablePlayersRoom, playingPlayersRoom };
