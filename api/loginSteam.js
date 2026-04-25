const { Router } = require('express');
const { findOrCreateSteamUser, createNewSession } = require('../sequalize/users');

const router = Router();

router.route('/').post(async (req, res) => {
    try {
        const { steamId, displayName } = req.body;

        if (!steamId || typeof steamId !== 'string') {
            return res.status(400).json({ message: 'steamId is required' });
        }

        if (!displayName || typeof displayName !== 'string') {
            return res.status(400).json({ message: 'displayName is required' });
        }

        const { user, conflict } = await findOrCreateSteamUser(steamId, displayName);

        if (conflict) {
            return res.status(409).json({ message: 'Username already taken' });
        }

        const sessionId = await createNewSession(user.id);

        res.cookie('session_id', sessionId, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24,
        });

        return res.status(200).json({ message: 'Logged in successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
