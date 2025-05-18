const {Sequelize, DataTypes} = require("sequelize");

const sequelize = new Sequelize("postgres://neondb_owner:npg_hGEUP0L1Vbov@ep-orange-darkness-a2u2vo14-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require", {logging: false});

const User = sequelize.define('User', {
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
    email: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    image: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    role: {
        type: DataTypes.ENUM('User', 'Admin'),
        allowNull: false,
        defaultValue: 'User',
    }
})

async function connectToDatabaseForUsers() {
    try{
        await sequelize.authenticate();
    }
    catch(error){
        console.error(error);
    }
}

async function initializeUserTable(){
    try{
        await sequelize.sync();
    }
    catch(error){
        console.error(error);
    }
}

async function createUser(name, email, image, role) {
    await User.create({
        name: name,
        email: email,
        image: image,
        role: role,
    })
}

async function getUserByName(name){
    return await User.findOne({
        where: {
            name: name
        },
    })
}

async function updateUser(id, name, email, image, role){
    await User.update({
        name: name,
        email: email,
        image: image,
        role: role,
    }, {
        where: {id: id}
    })
}

module.exports = {
    connectToDatabaseForUsers, initializeUserTable, createUser, getUserByName, updateUser
}