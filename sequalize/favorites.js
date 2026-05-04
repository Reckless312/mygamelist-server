const { Sequelize, DataTypes } = require('sequelize');
const { users, findUserByUsername } = require('./users');
const { game, findGameById, gameIncludeOptions } = require('./games');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
});

const favorite = sequelize.define('Favorite', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
}, {
    timestamps: false,
    indexes: [{ unique: true, fields: ['userId', 'gameId'] }],
});

favorite.belongsTo(users, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
});

favorite.belongsTo(game, {
    foreignKey: 'gameId',
    onDelete: 'CASCADE',
});

const addFavorite = async (username, gameId) => {
    const user = await findUserByUsername(username);
    const foundGame = await findGameById(gameId);

    if (!user || !foundGame) {
        return { ok: false, status: 404, message: 'Game not found' };
    }

    try {
        await favorite.create({ userId: user.id, gameId });
        return { ok: true };
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return { ok: false, status: 409, message: 'Game already in favorites' };
        }
        throw error;
    }
};

const removeFavorite = async (username, gameId) => {
    const user = await findUserByUsername(username);

    if (!user) {
        return null;
    }

    const deleted = await favorite.destroy({
        where: { userId: user.id, gameId },
    });

    return deleted;
};

const getUserFavorites = async (username) => {
    const user = await findUserByUsername(username);

    if (!user) {
        return null;
    }

    return await favorite.findAll({
        where: { userId: user.id },
        include: [{ model: game, include: gameIncludeOptions }],
    });
};

const getFavoriteStatus = async (username, gameId) => {
    const user = await findUserByUsername(username);

    if (!user) {
        return null;
    }

    const entry = await favorite.findOne({
        where: { userId: user.id, gameId },
    });

    return entry !== null;
};

async function initializeFavoritesTable() {
    try {
        await sequelize.sync({ alter: true });
    } catch (error) {
        console.error(error);
    }
}

module.exports = { addFavorite, removeFavorite, getUserFavorites, getFavoriteStatus, initializeFavoritesTable };
