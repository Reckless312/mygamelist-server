const {Router} = require("express");
const {destroySession} = require("../sequalize/users");

const router = Router();

router.route('/').post(async (req, res) => {
    try {
        const sessionId = req.cookies.session_id;

        if (sessionId === undefined) {
            return res.status(401).json({ message: 'No session found' });
        }

        await destroySession(sessionId);

        res.clearCookie('session_id', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
        });

        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
})

module.exports = router;