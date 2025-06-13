const {Sequelize, DataTypes} = require("sequelize");
const {Op} = require("@sequelize/core")
const {pg} = require("pg");

const sequelize = new Sequelize("postgres://neondb_owner:npg_hGEUP0L1Vbov@ep-orange-darkness-a2u2vo14-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require", {
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
});

const game_images = sequelize.define('Game_Images', {
    image_url: {
        type: DataTypes.TEXT,
        allowNull: false
    },
});

const game_release_date = sequelize.define("Game_Release_Date", {
    releaseDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    }
});

const game_price = sequelize.define("Game_Prices", {
    price: {
        type: DataTypes.FLOAT,
        allowNull: true,
    }
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

game.hasOne(game_release_date, {
    foreignKey: 'gameId',
    onDelete: 'CASCADE',
})

game.hasOne(game_price, {
    foreignKey: 'gameId',
    onDelete: 'CASCADE',
})

game.hasMany(game_tags, {
    foreignKey: 'gameId',
    onDelete: 'CASCADE',
})

game_images.belongsTo(game);
game_release_date.belongsTo(game);
game_price.belongsTo(game);
game_tags.belongsTo(game);

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

async function createNewGame(name, description, banner, image, tag, price, releaseDate){

    await game.create({
        name: name,
        description: description,
        banner_url: banner
    })

    const addedGame = (await findGamesByName(name))[0];

    await createNewImage(image, addedGame.id);

    await game_release_date.create(({
        releaseDate: releaseDate,
        gameId: addedGame.id
    }))

    await game_price.create({
        price: price,
        gameId: addedGame.id
    })

    await game_tags.create({
        tag: tag,
        gameId: addedGame.id
    })
}

async function returnGames(){
    return await game.findAll({
        include: includeOptions()});
}

async function findGameById(id){
    return await game.findOne({
        where: {
            id: id
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
        banner_url: banner
    }, {
        where: {id: id}
    })

    const gameImages = await game_images.findAll({
        where: {gameId: id}
    })

    const gameReleaseDate = await game_release_date.findOne({
        where: {gameId: id}
    })

    const gamePrice = await game_price.findOne({
        where: {gameId: id}
    })

    const gameTags = await game_release_date.findAll({
        where: {gameId: id}
    })

    for (const images in gameImages) {
        await game_images.destroy({
            where: {id: images.id}
        });
    }

    for (const tag in gameTags) {
        await game_tags.destroy({
            where: {id: tag.id}
        });
    }

    await createNewImage(image, id);
    await createNewTags(tag, id);

    await game_release_date.upsert({releaseDate: releaseDate, id: gameReleaseDate.id});
    await game_price.upsert({price: price, id: gamePrice.id});
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

async function getGamesOrderedByName(){
    return await game.findAll({
        order: [['name', 'ASC']],
        include: includeOptions()
    })
}

function includeOptions() {
    return [{model: game_images, attributes: ['image_url']}, {model: game_release_date, attributes: ['releaseDate']},
        {model: game_price, attributes: ['price']}, {model: game_tags, attributes: ['tag']}]
}

async function createNewImage(images, game_id) {
    for (const image_url in images) {
        await game_images.create({
            image_url: image_url,
            gameId: game_id
        })
    }
}

async function createNewTags(tags, game_id) {
    for (const tag in tags) {
        await game_tags.create({
            tag: tag,
            gameId: game_id
        })
    }
}

module.exports = {
    connectToDatabase, initializeTables, returnGames, createNewGame, findGameById,
    deleteGameById, updateGame, findGamesByName, getGamesOrderedByName
}