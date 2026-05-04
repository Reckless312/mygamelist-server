const {Sequelize, DataTypes} = require("sequelize");
const {Op} = require("@sequelize/core")

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
});

const game = sequelize.define('Game', {
    id:
    {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
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
    },
    developer: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, { timestamps: false });

const game_images = sequelize.define('Game_Images', {
    image_url: {
        type: DataTypes.TEXT,
        allowNull: false
    },
}, { timestamps: false });

const tag = sequelize.define('Tag', {
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    }
}, { timestamps: false });

const game_tags = sequelize.define('Game_Tags', {}, { timestamps: false });

game.hasMany(game_images, {
    foreignKey: 'gameId',
    onDelete: 'CASCADE',
});

game_images.belongsTo(game, {
    foreignKey: 'gameId',
});

game.belongsToMany(tag, { through: game_tags, foreignKey: 'gameId' });
tag.belongsToMany(game, { through: game_tags, foreignKey: 'tagId' });

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
        await sequelize.sync({ alter: true });
    }
    catch(error){
        console.error(error);
    }
}

async function createNewGame(name, description, banner, image, tags, price, releaseDate, developer){

    const addedGame = await game.create({
        name: name,
        description: description,
        banner_url: banner,
        releaseDate: releaseDate,
        price: price,
        developer: developer,
    });

    await createNewImage(image, addedGame.id);
    await setTags(tags, addedGame);

    return findGameById(addedGame.id);
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

async function updateGame(id, name, banner, description, image, tags, price, releaseDate, developer){
    await game.update({
        name: name,
        description: description,
        banner_url: banner,
        releaseDate: releaseDate,
        price: price,
        developer: developer,
    }, {
        where: {id: id}
    });

    const gameImages = await game_images.findAll({ where: { gameId: id } });
    await destroyOldImages(gameImages);
    await createNewImage(image, id);

    const gameInstance = await game.findByPk(id);
    await setTags(tags, gameInstance);
}

async function findGamesByName(name){
    return await game.findAll({
        where: {
            name: {
                [Op.like]: `%${name}%`
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

const gameIncludeOptions = [
    { model: game_images, attributes: ['id', 'image_url'] },
    { model: tag, attributes: ['id', 'name'], through: { attributes: [] } },
];

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

async function setTags(tagNames, gameInstance) {
    const tagRecords = await Promise.all(
        tagNames.map(name => tag.findOrCreate({ where: { name } }).then(([t]) => t))
    );
    await gameInstance.setTags(tagRecords);
}

async function destroyOldImages(images) {
    for (const image of images) {
        await game_images.destroy({
            where: {id: image.id}
        });
    }
}


module.exports = {
    game, connectToDatabase, initializeGameTables, returnGames, createNewGame, findGameById,
    deleteGameById, updateGame, findGameByName, findGamesByName, acceptedSortingFields, gameIncludeOptions,
}
