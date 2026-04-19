const { Router } = require('express');
const { getUserList } = require('../sequalize/list');

const router = Router();

router.route('/:username/list').get(async (req, res) => {
    try {
        const list = await getUserList(req.params.username);

        if (!list) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(list.map(item => ({ game: item.Game, status: item.status, score: item.score })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
