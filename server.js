const express = require('express');
const gamesRoute = require("./api/games");
const loginRoute = require("./api/login");
const hqRoute = require("./api/hq");
const registerRoute = require("./api/register");
const logoutRoute = require("./api/logout");
const listRoute = require("./api/list");
const cors = require("cors");
const {connectToDatabase, initializeGameTables} = require("./sequalize/games")
const {initializeUserTable} = require("./sequalize/users")
const cookieParser = require('cookie-parser');
const {initializeListTable} = require("./sequalize/list");

const app = express();
const port = 8080;

app.use(cors({
    origin: ["http://localhost:3000", "https://mygamelist-liard.vercel.app/"],
    credentials: true,
}))
app.use(express.json());
app.use(cookieParser());

app.use('/api/games', gamesRoute);
app.use('/api/login', loginRoute);
app.use('/api/hq', hqRoute);
app.use('/api/register', registerRoute);
app.use('/api/logout', logoutRoute);
app.use('/api/list', listRoute);

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
//
//     console.log(`Server running on port ${port}`);
// });