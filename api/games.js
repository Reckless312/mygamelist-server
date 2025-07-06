const {Router} = require("express");
const {z} = require("zod");
const {returnGames, createNewGame, findGameById, deleteGameById,
    updateGame, findGameByName, findGamesByName, getGamesOrderedByName} = require('../sequalize/games');

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
            const games = await returnGames();
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

const Validation = {
    DEFAULT_GET: "DEFAULT_GET",
    DEFAULT_POST: "DEFAULT_POST",
    DEFAULT_PATCH: "DEFAULT_PATCH",
    DEFAULT_DELETE: "DEFAULT_DELETE",
    DEFAULT_FILTER: "DEFAULT_FILTER",
    DEFAULT_FILTER_ID: "DEFAULT_FILTER_ID",
}

async function validateClientInput(method, body) {
    let components;
    switch (method) {
        case Validation.DEFAULT_GET:
            return true;
        case Validation.DEFAULT_POST:
            components = [body, body?.name, body?.description, body?.image, body?.banner_url, body?.releaseDate, body?.price, body?.tag]

            return !checkUndefinedElementsInArray(components) && checkZodIntegrity(body) && !await checkGameExistanceByName(body?.name);
        case Validation.DEFAULT_PATCH:
            components = [body, body?.id, body?.name, body?.description, body?.image, body?.banner_url, body?.releaseDate, body?.price, body?.tag];

            return !checkUndefinedElementsInArray(components) && checkZodIntegrity(body) && await checkGameExistanceById(body?.id) && await checkUniqueName(body?.name, body?.id);
        case Validation.DEFAULT_DELETE:
            components = [body];

            return !checkUndefinedElementsInArray(components) && checkZodIntegrity(body) && await checkGameExistanceById(body?.id);
        case Validation.DEFAULT_FILTER:
            components = [body, body?.name];

            return !checkUndefinedElementsInArray(components);
        case Validation.DEFAULT_FILTER_ID:
            components = [body, body?.id];

            return !checkUndefinedElementsInArray(components);
    }
}

function checkUndefinedElementsInArray(array) {
    for (const element of array) {
        if (element === undefined) {
            return true;
        }
    }
    return false;
}

function checkZodIntegrity(data) {
    const validation = gameSchema.safeParse(data);
    return validation.success;
}

async function checkGameExistanceByName(name) {
    return await findGameByName(name) !== undefined;
}

async function checkGameExistanceById(id) {
    return await findGameById(id) !== undefined;
}

async function checkUniqueName(name, id) {
    const game = await findGameByName(name);

    return game === undefined || game.id === id;
}

module.exports = router;