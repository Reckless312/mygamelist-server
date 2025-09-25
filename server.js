const express = require('express');
const gamesRoute = require("./api/games");
const loginRoute = require("./api/login");
const hqRoute = require("./api/hq");
const cors = require("cors");
const {connectToDatabase, initializeGameTables} = require("./sequalize/games")
const {initializeUserTable} = require("./sequalize/users")
const cookieParser = require('cookie-parser');

const app = express();
const port = 8080;

app.use(cors())
app.use(express.json());
app.use(cookieParser());

app.use('/api/games', gamesRoute);
app.use('/api/login', loginRoute);
app.use('/api/hq', hqRoute);

module.exports = app;

app.listen(port, async () => {
    await connectToDatabase();
    await initializeGameTables();
    await initializeUserTable();

    console.log(`Server running on port ${port}`);
});