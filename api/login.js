const {Router} = require('express');
const {checkCredentials, createNewSession} = require('../sequalize/users');
const authService = require('../service/authService');

const router = Router();

router.route('/').post(async (req, res) => {
    try {
        const validation = authService.validateAuthBody(req.body);

        if (!validation.ok) {
            return res.status(400).json({ message: validation.message });
        }

        const {username, password} = req.body;

        const user = await checkCredentials(username, password);

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const sessionId = await createNewSession(user.id);

        res.cookie('session_id', sessionId, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 1000 * 60 * 60 * 24,
        });

        return res.status(200).json({ message: 'Logged in successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
})

module.exports = router;
