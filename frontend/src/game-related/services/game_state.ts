// // frontend/src/game-state.ts
// import { HttpPongSetupReq, GameMode, PlayMode } from './gameNetwork';
// // import { HttpPongSetupReq, GameMode, PlayMode } from "@shared/types";

// // 1. Initialize with default values (or nulls)
// const localGameConfig: HttpPongSetupReq = {
//     gameMode: 'local',   // Default
//     playMode: 'random',  // Default
//     friendId: undefined
// };

// // 2. Helper functions to update state
// export const gameSetup = {
//     setGameMode: (mode: GameMode) => {
//         localGameConfig.gameMode = mode;
//         console.log("Current State:", localGameConfig);
//     },

//     setPlayMode: (mode: PlayMode) => {
//         localGameConfig.playMode = mode;
//         console.log("Current State:", localGameConfig);
//     },

//     setFriendId: (id: string) => {
//         localGameConfig.friendId = id;
//     },

//     // 3. Getter for the final payload
//     getPayload: (): HttpPongSetupReq => {
//         return { ...localGameConfig }; // Return a copy, not the reference
//     }
// };