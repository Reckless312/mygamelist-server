const {Sequelize, DataTypes} = require("sequelize");
const {Op} = require("@sequelize/core")
const {pg} = require("pg");

const sequelize = new Sequelize(process.env.NEON_DATABASE_URL || process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectModule: pg,
});

const game = sequelize.define('Game', {
    id:
    {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
        index: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    banner_url: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    releaseDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: true,
    }
});

const game_images = sequelize.define('Game_Images', {
    image_url: {
        type: DataTypes.TEXT,
        allowNull: false
    },
});

const game_tags = sequelize.define("Game_Tags", {
    tag: {
        type: DataTypes.TEXT,
        allowNull: false,
    }
});

game.hasMany(game_images, {
    foreignKey: 'gameId',
    onDelete: 'CASCADE',
});

game.hasMany(game_tags, {
    foreignKey: 'gameId',
    onDelete: 'CASCADE',
});

game_images.belongsTo(game, {
    foreignKey: 'gameId',
});
game_tags.belongsTo(game, {
    foreignKey: 'gameId',
});

const acceptedSortingFields = ['name', 'releaseDate', 'price'];

async function connectToDatabase() {
    try{
        await sequelize.authenticate();
    }
    catch(error){
        console.error(error);
    }
}

async function initializeGameTables(){
    try{
        await sequelize.sync();
    }
    catch(error){
        console.error(error);
    }
}

async function createNewGame(name, description, banner, image, tags, price, releaseDate){

    await game.create({
        name: name,
        description: description,
        banner_url: banner,
        releaseDate: releaseDate,
        price: price,
    })

    const addedGame = (await findGamesByName(name))[0];

    await createNewImage(image, addedGame.id);

    await createNewTags(tags, addedGame.id);
}

async function returnGames(startYear = null, endYear = null, sortedColumn = null, sortingOption = null){
    const queryOptions = {
        include: includeOptions(),
        where: {},
        order: []
    }

    const dateOptions = {};

    if (startYear) {
        dateOptions[Op.gte] = new Date(`${startYear}-01-01`);
    }

    if (endYear) {
        dateOptions[Op.lte] = new Date(`${endYear}-12-31`);
    }

    if (startYear || endYear) {
        queryOptions.where.releaseDate = dateOptions;
    }

    if (sortedColumn && sortingOption) {
        queryOptions.order.push([sortedColumn, sortingOption.toUpperCase()]);
    }

    return await game.findAll(queryOptions);
}

async function findGameById(id){
    return await game.findOne({
        where: {
            id: id
        },
        include: includeOptions()
    })
}

async function findGameFromYear(year){
    const start = new Date(`${year}-01-01`);
    const end = new Date(`${year}-12-31`);

    return await game.findAll({
        where: {
            releaseDate: {
                [Op.between]: [start, end]
            }
        },
        include: includeOptions()
    })
}

async function deleteGameById(id){
    await game.destroy({
        where: {id}
    })
}

async function updateGame(id, name, banner, description, image, tag, price, releaseDate){
    await game.update({
        name: name,
        description: description,
        banner_url: banner,
        releaseDate: releaseDate,
        price: price,
    }, {
        where: {id: id}
    })

    const gameImages = await game_images.findAll({
        where: {gameId: id}
    })

    const gameTags = await game_tags.findAll({
        where: {gameId: id}
    })

    await destroyOldImages(gameImages);
    await destroyOldTags(gameTags);

    await createNewImage(image, id);
    await createNewTags(tag, id);
}

async function findGamesByName(name){
    return await game.findAll({
        where: {
            name: {
                [Op.iLike]: `%${name}%`
            }
        },
        include: includeOptions()
    })
}

async function findGameByName(name){
    return await game.findOne({
        where: {
            name: name
        },
    })
}

async function getGamesOrderedByName(){
    return await game.findAll({
        order: [['name', 'ASC']],
        include: includeOptions()
    })
}

const gameIncludeOptions = [{model: game_images, attributes: ['image_url']}, {model: game_tags, attributes: ['tag']}];

function includeOptions() {
    return gameIncludeOptions;
}

async function createNewImage(images, game_id) {
    for (const image_url of images) {
        await game_images.create({
            image_url: image_url,
            gameId: game_id
        })
    }
}

async function createNewTags(tags, game_id) {
    for (const tag of tags) {
        await game_tags.create({
            tag: tag,
            gameId: game_id
        })
    }
}

async function destroyOldImages(images) {
    for (const image of images) {
        await game_images.destroy({
            where: {id: image.id}
        });
    }
}

async function destroyOldTags(tags) {
    for (const tag of tags) {
        await game_tags.destroy({
            where: {id: tag.id}
        });
    }
}

module.exports = {
    game, connectToDatabase, initializeGameTables, returnGames, createNewGame, findGameById,
    deleteGameById, updateGame, findGameByName, findGamesByName, acceptedSortingFields, gameIncludeOptions,
}
