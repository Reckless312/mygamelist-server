const {Sequelize, DataTypes} = require("sequelize");
const {users, findUserByUsername} = require("./users");
const {game, findGameById, gameIncludeOptions} = require("./games");
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
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
    const foundGame = await findGameById(gameId);

    if (!user || !foundGame) {
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
        },
        include: [{ model: game, include: gameIncludeOptions }]
    })
}

const updateListItem = async (username, gameId, fields) => {
    const user = await findUserByUsername(username);

    if (!user) {
        return null;
    }

    const [updated] = await list.update(fields, {
        where: {
            userId: user.id,
            gameId: gameId
        }
    })

    if (updated === 0) {
        return null;
    }

    return updated;
}

const deleteGameFromList = async (username, gameId) => {
    const user = await findUserByUsername(username);
    const foundGame = await findGameById(gameId);

    if (!user || !foundGame) {
        return null;
    }

    await list.destroy({
        where: {
            userId: user.id,
            gameId: gameId
        }
    })
}

const getListItem = async (username, gameId) => {
    const user = await findUserByUsername(username);

    if (!user) {
        return null;
    }

    return await list.findOne({
        where: {
            userId: user.id,
            gameId: gameId
        },
        include: [{ model: game, include: gameIncludeOptions }]
    })
}

async function initializeListTable(){
    try{
        await sequelize.sync({ alter: true });
    }
    catch(error){
        console.error(error);
    }
}

module.exports = {
    initializeListTable, addGameToList, getUserList, updateListItem, deleteGameFromList, getListItem
}
