const {Sequelize, DataTypes} = require("sequelize");
const {pg} = require("pg");
const {users, findUserByUsername} = require("./users");
const {game, findGameById} = require("./games");
const sequelize = new Sequelize("postgres://neondb_owner:npg_vCs9qY1ugHTB@ep-empty-sun-a45epvri-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require", {
    dialect: 'postgres',
    dialectModule: pg,
});

const list = sequelize.define('List', {
    id:
    {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    status: {
        type: DataTypes.ENUM("Currently Playing", "Completed", "On Hold", "Dropped", "Plan To Play"),
        allowNull: false,
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    }
}, { timestamps: false })

list.belongsTo(users, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
});

list.belongsTo(game, {
    foreignKey: 'gameId',
    onDelete: 'CASCADE',
})

const addGameToList = async (username, gameId) => {
    const user = await findUserByUsername(username);
    const game = await findGameById(gameId);

    if (!user || !game) {
        return null;
    }

    await list.create({
        userId: user.id,
        gameId: gameId,
        status: "Plan To Play",
        score: 0,
    })
}

const getUserList = async (username) => {
    const user = await findUserByUsername(username);

    if (!user) {
        return null;
    }

    return await list.findAll({
        where: {
            userId: user.id
        }
    })
}

const changeGameStatus = async (username, gameId, status) => {
    const user = await findUserByUsername(username);
    const game = await findGameById(gameId);

    if (!user || !game) {
        return null;
    }

    await list.update({
        status: status,
    }, {
        where: {
            userId: user.id,
            gameId: gameId
        }
    })
}

const changeGameScore = async (username, gameId, score) => {
    const user = await findUserByUsername(username);
    const game = await findGameById(gameId);

    if (!user || !game) {
        return null;
    }

    await list.update({
        score: score,
    }, {
        where: {
            userId: user.id,
            gameId: gameId
            }
        }
    )
}

const deleteGameFromList = async (username, gameId) => {
    const user = await findUserByUsername(username);
    const game = await findGameById(gameId);

    if (!user || !game) {
        return null;
    }

    await list.destroy({
        where: {
            userId: user.id,
            gameId: gameId
        }
    })
}

const checkIfGameIsInList = async (username, gameId) => {
    const user = await findUserByUsername(username);
    const game = await findGameById(gameId);

    if (!user || !game) {
        return null;
    }

    const foundItem = await list.findOne({
        where: {
            userId: user.id,
            gameId: gameId
        }
    })

    return foundItem != null;
}

const getListItem = async (username, gameId) => {
    const user = await findUserByUsername(username);
    const game = await findGameById(gameId);

    if (!user || !game) {
        return null;
    }

    return await list.findOne({
        where: {
            userId: user.id,
            gameId: gameId
        }
    })
}

async function initializeListTable(){
    try{
        await sequelize.sync();
    }
    catch(error){
        console.error(error);
    }
}

module.exports = {
    initializeListTable, addGameToList, getUserList, changeGameStatus, changeGameScore, deleteGameFromList, checkIfGameIsInList, getListItem
}