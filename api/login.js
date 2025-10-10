const {Router} = require("express");
const {checkCredentials, createNewSession} = require("../sequalize/users");

const router = Router();

router.route('/').post(async (req, res) => {
    const {username, password} = req.body;

    const user = await checkCredentials(username, password);

    if (!user) {
        return res.status(401).json({message: 'Invalid credentials'});
    }

    const sessionId = await createNewSession(user.id);

    res.cookie('session_id', sessionId, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24,
    });

    return res.status(200).json({message: 'Logged in successfully'});
})

module.exports = router;