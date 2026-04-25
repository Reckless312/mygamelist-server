const {Sequelize, DataTypes} = require("sequelize");
const {Op} = require("@sequelize/core")
const {pg} = require("pg");
const bcrypt = require("bcrypt");

const sequelize = new Sequelize(process.env.NEON_DATABASE_URL || process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectModule: pg,
});

const users = sequelize.define('User', {
    id:
    {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    steamId: {
        type: DataTypes.TEXT,
        allowNull: true,
        unique: true,
    }
}, { timestamps: false })

const sessions = sequelize.define('Session', {
    id:
    {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
    }
}, { timestamps: false })

users.hasMany(sessions, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
});

sessions.belongsTo(users, {
    foreignKey: 'userId',
});

const registerNewUser = async (username, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await findUserByUsername(username);

    if (user) {
        return null;
    }

     return await users.create({
        username: username,
        password: hashedPassword,
    });
}

const findUserBySteamId = async (steamId) => {
    return await users.findOne({ where: { steamId } });
}

const findOrCreateSteamUser = async (steamId, displayName) => {
    const existing = await findUserBySteamId(steamId);

    if (existing) {
        return { user: existing, conflict: false };
    }

    const username = displayName;
    const taken = await findUserByUsername(username);

    if (taken) {
        return { user: null, conflict: true };
    }

    const user = await users.create({ username, steamId, password: null });

    return { user, conflict: false };
}

const findUserByUsername = async (username) => {
    return await users.findOne({
        where: {
            username: username
        }
    })
}

const checkCredentials = async (username, password) => {
    const user = await findUserByUsername(username);

    if (!user) {
        return null;
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        return null;
    }

    return user;
}

const getUserFromSession = async (sessionId) => {
    await sessions.destroy({
        where: {
            expiresAt: {[Op.lt]: new Date()}
        }
    })

    const foundSession = await sessions.findOne({
        where: {
            id: sessionId
        },
        include: [{ model: users }]
    })

    if (!foundSession) {
        return null;
    }

    return foundSession.User;
}

const createNewSession = async (userId) => {
    const createdAt = new Date();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const newSession = await sessions.create({
        userId: userId,
        createdAt: createdAt,
        expiresAt: expiresAt,
    })

    return newSession.id;
}

async function initializeUserTable(){
    try{
        await sequelize.sync();
    }
    catch(error){
        console.error(error);
    }
}

async function destroySession(id) {
    await sessions.destroy({
        where: {id}
    })
}

module.exports = {
    registerNewUser, findUserByUsername, findOrCreateSteamUser, initializeUserTable, checkCredentials, createNewSession, getUserFromSession,
    destroySession, users
}
