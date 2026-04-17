const {Router} = require('express');
const {getUserList, addGameToList, updateListItem, deleteGameFromList, getListItem} = require('../sequalize/list');
const listService = require('../service/listService');
const {verifySession, verifyGameId} = require('../service/listService');

const router = Router();

router.route('/')
    .get(verifySession, async (req, res) => {
        try {
            const list = await getUserList(req.user.username);

            if (!list) {
                return res.json([]);
            }

            res.json(list.map(item => ({ game: item.Game, status: item.status, score: item.score })));
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })
    .post(verifySession, async (req, res) => {
        try {
            const gameIdValidation = listService.validateGameId(req.body.gameId);

            if (!gameIdValidation.ok) {
                return res.status(400).json({ message: gameIdValidation.message });
            }

            const result = await addGameToList(req.user.username, gameIdValidation.id);

            if (result === null) {
                return res.status(404).json({ message: 'Game not found' });
            }

            res.status(200).json({ message: 'Game added successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })

router.route('/:gameId')
    .get(verifySession, verifyGameId, async (req, res) => {
        try {
            const item = await getListItem(req.user.username, req.gameId);

            if (!item) {
                return res.json({ isInList: false });
            }

            res.json({ isInList: true, game: item.Game, status: item.status, score: item.score });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })
    .patch(verifySession, verifyGameId, async (req, res) => {
        try {
            const {status, score} = req.body;

            if (status === undefined && score === undefined) {
                return res.status(400).json({ message: 'Provide status or score to update' });
            }

            if (status !== undefined && !listService.validateStatus(status)) {
                return res.status(400).json({ message: 'Invalid status value' });
            }

            if (score !== undefined && !listService.validateScore(score)) {
                return res.status(400).json({ message: 'Score must be a number between 0 and 10' });
            }

            const updateFields = {};

            if (status !== undefined) {
                updateFields.status = status;
            }

            if (score !== undefined) {
                updateFields.score = score;
            }

            const result = await updateListItem(req.user.username, req.gameId, updateFields);

            if (result === null) {
                return res.status(404).json({ message: 'List item not found' });
            }

            res.status(200).json({ message: 'List item updated successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })
    .delete(verifySession, verifyGameId, async (req, res) => {
        try {
            const result = await deleteGameFromList(req.user.username, req.gameId);

            if (result === null) {
                return res.status(404).json({ message: 'Game not found in list' });
            }

            res.status(200).json({ message: 'Game removed from list' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })

module.exports = router;
