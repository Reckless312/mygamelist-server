const {Sequelize, DataTypes} = require("sequelize");
const {Op} = require("@sequelize/core")
const {pg} = require("pg");
const bcrypt = require("bcrypt");

const sequelize = new Sequelize("postgres://neondb_owner:npg_hGEUP0L1Vbov@ep-orange-darkness-a2u2vo14-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require", {
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
        allowNull: false,
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

const registerNewUser = async (username, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await findUserByUsername(username);

    if (user) {
        return null;
    }

    await users.create({
        username: username,
        password: hashedPassword,
    });

    return user;
}

const findUserByUsername = async (username) => {
    return await users.findOne({
        where: {
            username: username
        }
    })
}

const checkCredentials = async (username, password) => {
    const user = await users.findOne({
        where: {
            username: username,
        }
    });

    if (user == null) {
        return null;
    }

    const match = await bcrypt.compare(password, user.password);

    if (match) {
        return user;
    }
    return null;
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
        }
    })

    if (!foundSession) {
        return null;
    }

    return await users.findOne({
        where: {
            id: foundSession.userId
        }
    })
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

module.exports = {
    registerNewUser, findUserByUsername, initializeUserTable, checkCredentials, createNewSession, getUserFromSession
}