const {getUserFromSession} = require('../sequalize/users');

const VALID_STATUSES = ['Currently Playing', 'Completed', 'On Hold', 'Dropped', 'Plan To Play'];

async function resolveSession(req) {
    const sessionId = req.cookies?.session_id;

    if (!sessionId) {
        return null;
    }

    return await getUserFromSession(sessionId);
}

function validateGameId(id) {
    if (!id || isNaN(Number(id))) {
        return { ok: false, message: 'Game ID must be a valid number' };
    }

    return { ok: true, id: Number(id) };
}

function validateStatus(status) {
    return VALID_STATUSES.includes(status);
}

function validateScore(score) {
    return typeof score === 'number' && score >= 0 && score <= 10;
}

async function verifySession(req, res, next) {
    try {
        const user = await resolveSession(req);

        if (!user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

async function verifyGameId(req, res, next) {
    const validId = validateGameId(req.params.gameId);

    if (!validId.ok) {
        return res.status(400).json({ message: validId.message });
    }

    req.gameId = validId.id;
    next();
}

module.exports = { validateGameId, validateStatus, validateScore, verifySession, verifyGameId };
