const express = require('express');
const gamesRoute = require("./api/games");
const filesRoute = require("./api/files");
const actionRoute = require("./api/actions");
const cors = require("cors");
const {connectToDatabase, initializeTables, generateEntities} = require("./sequalize/games")
const {connectToDatabaseForUsers, initializeUserTable} = require("./sequalize/users");

const allowedOrigins = ['http://localhost:3000', 'https://www.google.com', 'http://localhost:8080', "https://nodejs-serverless-function-express-gamma-one.vercel.app", "https://my-game-list-sand.vercel.app/"];
const app = express();
const port = 8080;

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

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