const {Sequelize, DataTypes} = require("sequelize");
const {Op} = require("@sequelize/core")
const {pg} = require("pg");

const sequelize = new Sequelize("postgres://neondb_owner:npg_hGEUP0L1Vbov@ep-orange-darkness-a2u2vo14-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require", {
    dialect: 'postgres',
    dialectModule: pg,
});

const user = sequelize.define('User', {
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
})

const registerNewUser = async (username, password) => {
    await user.create({
        username: username,
        password: password,
    });
}

const findUserByUsername = async (username) => {
    return await user.findOne({
        where: {
            username: username
        }
    })
}

const checkCredentials = async (username, password) => {
    return await user.findOne({
        where: {
            username: username,
            password: password
        }
    })
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
    registerNewUser, findUserByUsername, initializeUserTable, checkCredentials
}