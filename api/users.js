const { Router } = require('express');
const { getUserList } = require('../sequalize/list');
const { getUserFavorites } = require('../sequalize/favorites');

const router = Router();

router.route('/:username/list').get(async (req, res) => {
    try {
        const list = await getUserList(req.params.username);

        if (!list) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(list.map(item => ({ game: item.Game, status: item.status, score: item.score })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

router.route('/:username/favorites').get(async (req, res) => {
    try {
        const favorites = await getUserFavorites(req.params.username);

        if (!favorites) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(favorites.map(item => item.Game));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
