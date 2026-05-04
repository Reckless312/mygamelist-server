const express = require('express');
const gamesRoute = require("./api/games");
const loginRoute = require('./api/login');
const loginSteamRoute = require('./api/loginSteam');
const hqRoute = require("./api/hq");
const registerRoute = require("./api/register");
const logoutRoute = require("./api/logout");
const listRoute = require("./api/list");
const usersRoute = require("./api/users");
const favoritesRoute = require("./api/favorites");
const cors = require("cors");
const {connectToDatabase, initializeGameTables} = require("./sequalize/games")
const {initializeUserTable} = require("./sequalize/users")
const cookieParser = require('cookie-parser');
const {initializeListTable} = require("./sequalize/list");
const {initializeFavoritesTable} = require("./sequalize/favorites");

const app = express();
const port = 8080;

const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ["http://localhost:3000", "https://mygamelist-liard.vercel.app"];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}))
app.use(express.json());
app.use(cookieParser());

app.get('/api/ip', (req, res) => {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    const ips = Object.values(interfaces)
        .flat()
        .filter(i => i.family === 'IPv4' && !i.internal)
        .map(i => i.address);
    res.json({ hostname: os.hostname(), ip: ips[0] || 'unknown' });
});

app.use('/api/games', gamesRoute);
app.use('/api/login', loginRoute);
app.use('/api/login/steam', loginSteamRoute);
app.use('/api/hq', hqRoute);
app.use('/api/register', registerRoute);
app.use('/api/logout', logoutRoute);
app.use('/api/list', listRoute);
app.use('/api/favorites', favoritesRoute);
app.use('/api/users', usersRoute);

module.exports = app;

let initialized = false;
app.use(async (req, res, next) => {
    if (!initialized) {
        try {
            await connectToDatabase();
            await initializeUserTable();
            await initializeListTable();
            await initializeGameTables();
            initialized = true;
            console.log("Database initialized ✅");
        } catch (error) {
            console.error("Database init failed ❌", error);
        }
    }
    next();
});

// app.listen(port, async () => {
//     await connectToDatabase();
//     await initializeGameTables();
//     await initializeUserTable();
//     await initializeListTable();
//     await initializeFavoritesTable();

//     console.log(`Server running on port ${port}`);
// });
