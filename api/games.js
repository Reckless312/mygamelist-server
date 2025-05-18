const {Router} = require("express");
const {z} = require("zod");
const {returnGames, findGameIdByName, createNewGame, findGameById, deleteGameById,
    findGameByNameWithDifferentId, updateGame, findGamesByName, getGamesOrderedByAttribute, getMaximumId} = require('../sequalize/games');

const gameSchema = z.object({
    name: z.string().min(3),
    description: z.string().min(10),
    image: z.string().url(),
    releaseDate: z.string().date(),
    price: z.number().nonnegative().max(100),
    tag: z.string().min(3),
});

const router = Router();

let lastIdGet = 0;

router.route('/')
    .get(async (req, res) => {
        try {
            const {games, id} = await returnGames(lastIdGet);
            lastIdGet = id;

            if (lastIdGet > await getMaximumId()) {
                lastIdGet = 0;
            }

            res.json(games);
        } catch (error) {
            res.status(500).json({message: 'Error happened while retrieving games'});
        }
    })
    .post(async (req, res) => {
        try {

            if (req.body === undefined || req.body?.name === undefined || req.body?.description === undefined || req.body?.image === undefined || req.body?.releaseDate === undefined || req.body?.price === undefined || req.body?.tag === undefined)
            {
                return res.status(404).json({ message: 'Missing required fields' });
            }

            const validation = gameSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({ message: 'Validation for input failed!' });
            }

            const { name, description, image, releaseDate, price, tag } = req.body;

            const existing = await findGameIdByName(name);

            if (existing) {
                return res.status(401).json({ message: 'Game already found with same critical information' });
            }

            await createNewGame(name, description, image, tag, price, releaseDate);

            res.status(200).json({ message: 'Game created successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error happened while creating game' });
        }
    }).delete(async (req, res) => {
    try {
        if (req.body === undefined)
        {
            return res.status(400).json({ message: 'Game id required' });
        }

        const { id } = req.body;

        const existing = await findGameById(id);

        if (existing.rowCount === 0) {
            return res.status(401).json({ message: 'Game id not found!' });
        }

        await deleteGameById(id);

        res.json({ message: 'Game deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error happened while deleting game' });
    }
})
    .patch(async (req, res) => {
        try {
            const validation = gameSchema.passthrough().safeParse(req.body);

            if (!validation.success) {
                return res.status(400).json({ message: 'Validation for input failed!' });
            }

            if (req.body === undefined || req.body?.id === undefined || req.body?.name === undefined || req.body?.description === undefined || req.body?.image === undefined || req.body?.releaseDate === undefined || req.body?.price === undefined || req.body?.tag === undefined)
            {
                return res.status(401).json({ message: 'Missing required fields' });
            }

            const {id, name, description, image, releaseDate, price, tag } = req.body;

            const existing = findGameById(id);

            if (!existing) {
                return res.status(402).json({ message: 'Game id not found!' });
            }

            const nameCheck = await findGameByNameWithDifferentId(name, id);

            if (nameCheck) {
                return res.status(403).json({ message: 'Game already found with same critical information' });
            }

            await updateGame(id, name, description, image, tag, price, releaseDate);

            res.json({ message: 'Game updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error happened while updating the game' });
        }
    });

router.route('/filter')
    .post(async (req, res) => {
        try {
            if (req.body === undefined || req.body?.name === undefined) {
                return res.status(404).json({ message: 'Missing required fields' });
            }

            const { name } = req.body;

            const result = await findGamesByName(name);

            res.json(result);
        } catch (error) {
            res.status(500).json({ message: 'Error happened while filtering games' });
        }
    });

router.route('/sort')
    .get(async (req, res) => {
        try {
            const result = await getGamesOrderedByAttribute();
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: 'Error happened while retrieving games' });
        }
    })

router.route('/filter/id')
    .post(async (req, res) => {
        try {
            if (req.body === undefined || req.body?.id === undefined) {
                return res.status(404).json({ message: 'Missing required fields' });
            }

            const { id } = req.body;

            const result = await findGameById(id);

            res.json(result);
        } catch (error) {
            res.status(500).json({ message: 'Error happened while filtering games' });
        }
    })

module.exports = router;