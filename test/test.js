const path = "/games/sucdoku";
switch (true) {
    case path === '/':
        console.log(path);
        break;
    case path === '/signup':
        console.log(path);
        break;
    case path === '/logipathn':
        console.log(path);
        break;
    case path === '/home':
        console.log(path);
        break;
    case path.startsWith("/games/pong/"):
        console.log("pong-game-related");
        break;
    case path.startsWith("/games/sudoku"):
        console.log("pong-game-related");
        break;
    default:
        console.log("Default");
}
