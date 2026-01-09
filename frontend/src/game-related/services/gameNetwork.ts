
// frontend/src/services/gameNetwork.ts

class GameNetwork {
    private socket: WebSocket | null = null;

    connect() {
        const url = 'ws://localhost:3002/ws/games/';
        console.log(`🔌 Attempting to connect to ${url}...`);
        
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            console.log('✅ Connection established!');
        };

        this.socket.onerror = (error) => {
            console.error('❌ WebSocket error:', error);
        };
        
        // Add onmessage here later...
    }
    
    // We will add methods here later to send data, like:
    // sendMove(x: number) { ... }
}

// 🌟 THE KEY STEP: Export a SINGLE instance 🌟
export const gameSocket = new GameNetwork();