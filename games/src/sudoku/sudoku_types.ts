
import { GameState } from "../game_manager/gamesTypes";

interface SudokuPlayer {

    id?: string;							// unique identifier for this player
    name: string;						    // player name
    // ws: WebSocket
}

interface SudokuSession {
    createdAt: number;        // creating time
    
    state: GameState;		// ('waiting' | 'playing' | 'finished')
    sessionId?: string;		// identifies this match
    players: SudokuPlayer[];		// exactly 2 Player objects (1 per player)
}

export { SudokuPlayer, SudokuSession };