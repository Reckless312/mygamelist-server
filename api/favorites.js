const { Router } = require('express');
const { addFavorite, removeFavorite, getUserFavorites, getFavoriteStatus } = require('../sequalize/favorites');
const { verifySession, verifyGameId } = require('../service/listService');

const router = Router();

router.route('/')
    .get(verifySession, async (req, res) => {
        try {
            const favorites = await getUserFavorites(req.user.username);

            if (!favorites) {
                return res.json([]);
            }

            res.json(favorites.map(item => item.Game));
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    });

router.route('/:gameId')
    .get(verifySession, verifyGameId, async (req, res) => {
        try {
            const isFavorited = await getFavoriteStatus(req.user.username, req.gameId);

            if (isFavorited === null) {
                return res.status(401).json({ message: 'Not authenticated' });
            }

            res.json({ isFavorited });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    })
    .post(verifySession, verifyGameId, async (req, res) => {
        try {
            const result = await addFavorite(req.user.username, req.gameId);

            if (!result.ok) {
                return res.status(result.status).json({ message: result.message });
            }

            res.status(201).json({ message: 'Game added to favorites' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    })
    .delete(verifySession, verifyGameId, async (req, res) => {
        try {
            const deleted = await removeFavorite(req.user.username, req.gameId);

            if (!deleted) {
                return res.status(404).json({ message: 'Game not in favorites' });
            }

            res.status(200).json({ message: 'Game removed from favorites' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    });

module.exports = router;
