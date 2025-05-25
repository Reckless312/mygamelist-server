const express = require('express');
const gamesRoute = require("./api/games");
const filesRoute = require("./api/files");
const actionRoute = require("./api/actions");
const cors = require("cors");
const {connectToDatabase, initializeTables, generateEntities} = require("./sequalize/games")
const {connectToDatabaseForUsers, initializeUserTable} = require("./sequalize/users");

const app = express();
const port = 8080;

app.use(cors())

app.use(express.json());

app.use('/api/games', gamesRoute);
app.use('/', filesRoute);
app.use('/actions', actionRoute);

module.exports = app;

app.listen(port, async () => {
    await connectToDatabase();
    await initializeTables();

    await connectToDatabaseForUsers();
    await initializeUserTable();

    await generateEntities(0);

    console.log(`Server running on port ${port}`);
});