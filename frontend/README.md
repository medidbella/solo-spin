# Solo Spin - Frontend

The frontend client for the **Solo Spin** ping-pong gaming platform. This project is built as a high-performance **Single Page Application (SPA)** using **Vanilla TypeScript** and **Vite**, avoiding heavy UI frameworks to ensure maximum performance for real-time gaming.

##  Technologies

- **Core:** [TypeScript](https://www.typescriptlang.org/) (Vanilla, no React/Vue/Angular)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Real-time:** Native WebSockets (`ws` / `wss`)
- **Graphics:** HTML5 Canvas (for game rendering)

##  How It Works (Architecture)

Since this project does not use a framework like React, we implemented a custom lightweight architecture to handle routing, state, and rendering.

### 1. The SPA Engine (No-Reload Navigation)
The application behaves like a native app by preventing browser page reloads.

- **Event Delegation:** In `main.ts`, a global event listener is attached to `document.body`. It intercepts clicks on any `<a>` tag with the `data-link` attribute.
- **History API:** When a link is clicked, `e.preventDefault()` stops the reload, and `history.pushState()` updates the URL bar manually.
- **Router Function:** The `router()` function is called immediately to swap the page content.

### 2. Custom Router (`main.ts`)
The router acts as the central controller for the application:

1.  **Auth Guard:** Before rendering, it checks `redirectBasedOnAuth(path)` to ensure the user is allowed to visit the page (redirecting to `/login` if necessary).
2.  **Connection Management:** If the user navigates to a protected route (like `/home` or `/game`), the router ensures the global WebSocket connection (`gameClient`) is active.
3.  **Rendering:** It uses a `switch` statement to match the URL path.
    - It clears the `#app` container.
    - It injects the new HTML string (returned by page functions like `renderHome()`).
    - It executes specific logic functions (e.g., `setupSearchLogic()`) to attach event listeners to the new DOM elements.

### 3. Singleton Game Client
To maintain the WebSocket connection and game state while the user navigates between menus (e.g., from Lobby -> Game -> Profile), we use the **Singleton Pattern**.

- **File:** `src/game-related/services/game_client.ts`
- **Mechanism:** The `GameClient` class has a private constructor and a static `getInstance()` method.
- **Benefit:** No matter where `gameClient` is imported in the app, it always refers to the *same* instance in memory. This prevents the WebSocket from disconnecting when the view changes.

### 4. Game Rendering Loop
The game does not use the DOM for rendering the ball and paddles.

- **Canvas:** The game renders on an HTML5 `<canvas>` element.
- **Input Loop:** A `setInterval` loop runs at 60FPS (approx `16ms`) to capture keyboard inputs (`W`, `S`, `Up`, `Down`) and send them to the backend via WebSockets.
- **Render Loop:** When the backend sends a `GAME_STATE` update via WebSocket, the `PongRenderer` clears the canvas and redraws the new state.

##  Project Structure

```
src/
├── api_integration/   # API fetch wrappers and type definitions
├── components/        # Reusable UI components (Header, Sidebar) returning HTML strings
├── game-related/      # Core Game Logic
│   ├── renders/       # Canvas rendering logic
│   ├── services/      # GameClient Singleton & WebSocket Handler
│   └── ...
├── pages/             # Page templates (Home, Profile, Login, etc.)
├── utils/             # Helper functions (Auth guards, formatting)
├── main.ts            # Entry point & Router logic
└── style.css          # Global styles & Tailwind directives
```

##  API & WebSocket Integration

- **HTTP Requests:** All API calls use a wrapper `apiFetch` (`src/api_integration/api_fetch.ts`) which handles JWT token attachment and automatic token refreshing on 401 errors.
- **WebSockets:** The app connects to `/ws/games/` relative to the host. It automatically detects `ws://` vs `wss://` based on the current protocol.

##  Key Features

- **Authentication:** JWT-based (Access/Refresh tokens) + 2FA support.
- **OAuth:** Google & GitHub integration.
- **Game Modes:**
  - Local (Same keyboard)
  - Remote (Online multiplayer)
  - Matchmaking (Random queue)
- **Social:**
  - Real-time Chat
  - Friend System (Add, Block, Remove)
  - Live Status Updates
- **Profile:**
  - Match History
  - Statistics & Leaderboard
