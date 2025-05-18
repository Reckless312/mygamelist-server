const {z} = require('zod');
const {isValidYear} = require('../utils/gamesApiValidation');
const {findGameByName, acceptedSortingFields, findGameById} = require('../sequalize/games');

const gameSchema = z.object({
    name: z.string().min(3),
    description: z.string().min(10),
    banner_url: z.string().url(),
    images: z.array(z.string().url()),
    releaseDate: z.string().date(),
    price: z.number().nonnegative().max(100),
    tags: z.array(z.string().min(3)),
});

function validateGameBody(body) {
    const result = gameSchema.safeParse(body);

    if (!result.success) {
        return { ok: false, errors: result.error.flatten() };
    }

    return { ok: true, data: result.data };
}

function validateFilterOptions(query) {
    const { name, startYear, endYear, sort } = query;

    if (startYear && !isValidYear(startYear)) {
        return { ok: false, message: 'Invalid start year format' };
    }

    if (endYear && !isValidYear(endYear)) {
        return { ok: false, message: 'Invalid end year format' };
    }

    const [field, order] = sort ? sort.split(':') : [];

    if (field && !acceptedSortingFields.includes(field)) {
        return { ok: false, message: 'Invalid sort field' };
    }

    if (order && !['asc', 'desc'].includes(order.toLowerCase())) {
        return { ok: false, message: 'Invalid sort order' };
    }

    return { ok: true, parsed: {name, startYear, endYear, field, order }};
}

function validateId(id) {
    if (!id || isNaN(Number(id))) {
        return { ok: false, message: 'Game ID must be a valid number' };
    }

    return { ok: true, id: Number(id) };
}

async function validateGameExistence(id) {
    const game = await findGameById(id);

    if (!game) {
        return { ok: false, message: 'Game not found' };
    }

    return { ok: true, game: game };
}

async function validateTakenName(name, excludeId = null) {
    const existing = await findGameByName(name);

    if (!existing) {
        return false;
    }

    return excludeId === null || existing.id !== excludeId;
}

async function verifyIdAndExistence(req, res, next) {
    const validId = validateId(req.params.id);

    if (!validId.ok) {
        return res.status(400).json({message: validId.message});
    }

    const validExistence = await validateGameExistence(validId.id);

    if (!validExistence.ok) {
        return res.status(404).json({message: validExistence.message});
    }

    req.game = validExistence.game;
    req.id = validId.id;

    next();
}

module.exports = {validateGameBody, validateFilterOptions, validateTakenName, verifyIdAndExistence};
