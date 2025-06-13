const express = require('express');
const gamesRoute = require("./api/games");
const cors = require("cors");
const {connectToDatabase, initializeTables, generateEntities} = require("./sequalize/games")

const app = express();
const port = 8080;

app.use(cors())

app.use(express.json());

app.use('/api/games', gamesRoute);

module.exports = app;

app.listen(port, async () => {
    await connectToDatabase();
    await initializeTables();

    await generateEntities(0);

    console.log(`Server running on port ${port}`);
});