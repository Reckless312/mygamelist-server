const {Router} = require("express");
const {z} = require("zod");
const {returnGames, createNewGame, findGameById, deleteGameById,
    updateGame, findGameByName, findGamesByName, getGamesOrderedByName, findGameFromYear, acceptedSortingFields
} = require('../sequalize/games');
const {isValidYear} = require("../utils/gamesApiValidation");

const gameSchema = z.object({
    name: z.string().min(3),
    description: z.string().min(10),
    banner_url: z.string().url(),
    images: z.array(z.string().url()),
    releaseDate: z.string().date(),
    price: z.number().nonnegative().max(100),
    tags: z.array(z.string().min(3)),
});

const router = Router();

router.route('/')
    .get(async (req, res) => {
        try {
            const {startYear, endYear, sort} = req.query;

            if (startYear && !isValidYear(startYear)) {
                return res.status(400).json({message: 'Invalid start year format'});
            }

            if (endYear && !isValidYear(endYear)) {
                return res.status(400).json({message: 'Invalid end year format'});
            }

            const [field, order] = sort ? sort.split(':') : [];

            if (field && !acceptedSortingFields.includes(field)) {
                return res.status(400).json({message: 'Invalid sort field'});
            }

            if (order && !['asc', 'desc'].includes(order.toLowerCase())) {
                return res.status(400).json({message: 'Invalid sort order'});
            }

            const games = await returnGames(startYear, endYear, field, order);
            res.json(games);
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    })
    .post(async (req, res) => {
        try {
            if (await validateClientInput(Validation.DEFAULT_POST, req.body) === false) {
                return res.status(404).json({ message: 'Validation failed for the given data!' });
            }

            const { name, description, image, releaseDate, price, tag } = req.body;

            await createNewGame(name, description, image, tag, price, releaseDate);

            res.status(200).json({ message: 'Game created successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error happened while creating game' });
        }
    }).delete(async (req, res) => {
    try {
        if (await validateClientInput(Validation.DEFAULT_POST, req.body) === false) {
            return res.status(404).json({ message: 'Validation failed for the given data!' });
        }

        const { id } = req.body;

        await deleteGameById(id);

        res.json({ message: 'Game deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error happened while deleting game' });
    }
})
    .patch(async (req, res) => {
        try {
            if (await validateClientInput(Validation.DEFAULT_PATCH, req.body) === false) {
                return res.status(404).json({ message: 'Validation failed for the given data!' });
            }

            const {id, name, description, image, releaseDate, price, tag } = req.body;

            await updateGame(id, name, description, image, tag, price, releaseDate);

            res.json({ message: 'Game updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error happened while updating the game' });
        }
    });

router.route('/filter')
    .post(async (req, res) => {
        try {
            if (await validateClientInput(Validation.DEFAULT_FILTER, req.body) === false) {
                return res.status(404).json({ message: 'Validation failed for the given data!' });
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
            const result = await getGamesOrderedByName();
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: 'Error happened while retrieving games' });
        }
    })

router.route('/filter/id')
    .post(async (req, res) => {
        try {
            if (await validateClientInput(Validation.DEFAULT_FILTER_ID, req.body) === false) {
                return res.status(404).json({ message: 'Validation failed for the given data!' });
            }

            const { id } = req.body;

            const result = await findGameById(id);

            res.json(result);
        } catch (error) {
            res.status(500).json({ message: 'Error happened while filtering games' });
        }
    })

router.route('/filter/year')
    .post(async (req, res) => {
        try {
            if (await validateClientInput(Validation.DEFAULT_FILTER_YEAR, req.body) === false) {
                return res.status(404).json({ message: 'Validation failed for the given data!' });
            }

            const { year } = req.body;
            const result = await findGameFromYear(year);

            res.json(result);
        } catch (error) {
            res.status(500).json({ message: 'Error happened while filtering games' });
        }
    })

module.exports = router;