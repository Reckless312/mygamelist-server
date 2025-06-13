const {Sequelize, DataTypes} = require("sequelize");
const {Op} = require("@sequelize/core")
const {pg} = require("pg");

const sequelize = new Sequelize("postgres://neondb_owner:npg_hGEUP0L1Vbov@ep-orange-darkness-a2u2vo14-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require", {
    dialect: 'postgres',
    dialectModule: pg,
});

const Game = sequelize.define('GAME', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: false,
        index: true,
    },
    releaseDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    tag: {
        type: DataTypes.TEXT,
        allowNull: false,
    }
});

const GameDescription = sequelize.define('GAME_DESCRIPTION', {
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

const GameImage = sequelize.define('GAME_IMAGE', {
    image: {
        type: DataTypes.TEXT,
        allowNull: false
    },
});

Game.hasMany(GameDescription, {
    foreignKey: 'gameId',
    onDelete: 'CASCADE',
});
GameDescription.belongsTo(Game);

Game.hasMany(GameImage, {
    foreignKey: 'gameId',
    onDelete: 'CASCADE',
});
GameImage.belongsTo(Game);

async function connectToDatabase() {
    try{
        await sequelize.authenticate();
    }
    catch(error){
        console.error(error);
    }
}

async function initializeTables(){
    try{
        await sequelize.sync();
    }
    catch(error){
        console.error(error);
    }
}

async function returnGames(){
    return await Game.findAll({
        include: [{model: GameDescription, attributes: ['description'], limit: 1}, {model: GameImage, attributes: ['image'], limit: 1}]});
}

async function findGameIdByName(name){
    return await Game.findOne({
        where: {
            name: name
        },
        attributes: ['id']
    })
}

async function createNewGame(name, description, image, tag, price, releaseDate){

    await Game.create({
        name: name,
        releaseDate: releaseDate,
        price: price,
        tag: tag
    })

    const addedGame = await findGameIdByName(name);

    await GameImage.create({
        image: image,
        gameId: addedGame.id
    })

    await GameDescription.create({
        description: description,
        gameId: addedGame.id
    })
}

async function findGameById(id){
    return await Game.findOne({
        where: {
            id: id
        },
        include: [{model: GameDescription, attributes: ['description'], limit: 1}, {model: GameImage, attributes: ['image'], limit: 1}]
    })
}

async function deleteGameById(id){
    await Game.destroy({
        where: {id}
    })
}

async function findGameByNameWithDifferentId(name, id){
    return await Game.findOne({
        where: {
            name: name,
            id: {[Op.ne]: id}
        },
        attributes: ['id'],
        include: [{model: GameDescription, attributes: ['description'], limit: 1}, {model: GameImage, attributes: ['image'], limit: 1}]
    })
}

async function updateGame(id, name, description, image, tag, price, releaseDate){
    await Game.update({
        name: name,
        releaseDate: releaseDate,
        tag: tag,
        price: price,
    }, {
        where: {id: id}
    })

    const gameImage = await GameImage.findOne({
        where: {gameId: id}
    })

    const gameDescription = await GameDescription.findOne({
        where: {gameId: id}
    })

    await GameImage.upsert({image: image, id: gameImage.id});
    await GameDescription.upsert({description: description, id: gameDescription.id});
}

async function findGamesByName(name){
    return await Game.findAll({
        where: {
            name: {
                [Op.iLike]: `%${name}%`
            }
        },
        include: [{model: GameDescription, attributes: ['description'], limit: 1}, {model: GameImage, attributes: ['image'], limit: 1}]
    })
}

async function getGamesOrderedByName(){
    return await Game.findAll({
        order: [['name', 'ASC']],
        include: [{model: GameDescription, attributes: ['description'], limit: 1}, {model: GameImage, attributes: ['image'], limit: 1}]})
}

module.exports = {
    connectToDatabase, initializeTables, returnGames, findGameIdByName, createNewGame, findGameById, deleteGameById, findGameByNameWithDifferentId,
    updateGame, findGamesByName, getGamesOrderedByName
}