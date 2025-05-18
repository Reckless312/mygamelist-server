require('dotenv').config({ path: '../.env' });

const {Pool} = require('pg');

let pool = createOriginalPool();

const getPool = () => pool;

const setPool = (newPool) => {
    pool = newPool;
};

function createOriginalPool() {
    return new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl:{rejectUnauthorized: false},
    });
}

module.exports = {
    getPool,
    setPool,
    createOriginalPool,
}