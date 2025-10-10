const {Router} = require("express");
const {getUserList, addGameToList, changeGameStatus, changeGameScore, deleteGameFromList, checkIfGameIsInList,
    getListItem
} = require("../sequalize/list");
const {findGameById} = require("../sequalize/games");

const router = Router();

router.route('/')
    .post(async (req, res) => {
        const {username} = req.body;

        if (username === undefined) {
            return res.status(401).json({message: 'No username provided'});
        }

        const list = await getUserList(username);

        if (!list) {
            res.json([]);
            res.status(200);
            return;
        }

        const appendedList = [];

        for (const item of list) {
            const game = await findGameById(item.gameId);

            appendedList.push({game: game, status: item.status, score: item.score});
        }

        res.json(appendedList);
        res.status(200);
    });

router.route('/add')
    .post(async (req, res) => {
        const {username, gameId} = req.body;

        if (username === undefined || gameId === undefined) {
            return res.status(401).json({message: 'No username or gameId provided'});
        }

        const validation = await addGameToList(username, gameId);

        if (validation === null) {
            return res.status(401).json({message: 'User or game not found'});
        }

        res.status(200).json({message: 'Game added successfully'});
    })

router.route('/change-status')
    .post(async (req, res) => {
        const {username, gameId, status} = req.body;

        if (username === undefined || gameId === undefined || status === undefined) {
            return res.status(401).json({message: 'No username, gameId or status provided'});
        }

        const validation = await changeGameStatus(username, gameId, status);

        if (validation === null) {
            return res.status(401).json({message: 'User or game not found'});
        }

        res.status(200).json({message: 'Game status changed successfully'});
    });

router.route('/change-score')
    .post(async (req, res) => {
        const {username, gameId, score} = req.body;

        if (username === undefined || gameId === undefined || score === undefined) {
            return res.status(401).json({message: 'No username, gameId or score provided'});
        }

        const validation = await changeGameScore(username, gameId, score);

        if (validation === null) {
            return res.status(401).json({message: 'User or game not found'});
        }

        res.status(200).json({message: 'Game score changed successfully'});
    })

router.route('/delete')
    .post(async (req, res) => {
        const {username, gameId} = req.body;

        if (username === undefined || gameId === undefined) {
            return res.status(401).json({message: 'No username or gameId provided'});
        }

        const validation = await deleteGameFromList(username, gameId);

        if (validation === null) {
            return res.status(401).json({message: 'User or game not found'});
        }

        res.status(200).json({message: 'Game deleted successfully'});
    })

router.route('/check')
    .post(async (req, res) => {
        const {username, gameId} = req.body;

        if (username === undefined || gameId === undefined) {
            return res.status(401).json({message: 'No username or gameId provided'});
        }

        const isInList = await checkIfGameIsInList(username, gameId);

        if (isInList === null) {
            return res.status(401).json({message: 'User or game not found'});
        }

        res.status(200).json({isInList: isInList});
    })

router.route('/get-one')
    .post(async (req, res) => {
        const {username, gameId} = req.body;

        if (username === undefined || gameId === undefined) {
            return res.status(401).json({message: 'No username or gameId provided'});
        }

        const item = await getListItem(username, gameId);

        if (item === null) {
            return res.status(401).json({message: 'User or game not found'});
        }

        const game = await findGameById(item.gameId);

        res.status(200).json({game: game, status: item.status, score: item.score});
    })

module.exports = router;