const {findGameByName, findGameById} = require("../sequalize/games");

const Validation = {
    GET: "GET",
    DEFAULT_POST: "DEFAULT_POST",
    DEFAULT_PATCH: "DEFAULT_PATCH",
    DEFAULT_DELETE: "DEFAULT_DELETE",
    DEFAULT_FILTER: "DEFAULT_FILTER",
    DEFAULT_FILTER_ID: "DEFAULT_FILTER_ID",
    DEFAULT_FILTER_YEAR: "DEFAULT_FILTER_YEAR",
}

const isValidYear = (y) => /^\d{4}$/.test(y);

async function validateClientInput(method, body) {
    let components;
    switch (method) {
        case Validation.GET:
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
        case Validation.DEFAULT_FILTER_YEAR:
            components = [body, body?.year];
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

module.exports = { isValidYear };