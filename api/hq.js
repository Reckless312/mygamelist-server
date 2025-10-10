const {Router} = require("express");
const {getUserFromSession} = require("../sequalize/users");

const router = Router();

router.route('/').get(async (req, res) => {
    console.log("Cookies received ", req.cookies);

    const sessionId = req.cookies.session_id;

    if (sessionId === undefined) {
        return res.status(401).json({message: 'No session found'});
    }

    const user = await getUserFromSession(sessionId);

    if (!user) {
        return res.status(401).json({message: 'Something went wrong'});
    }

    return res.json({username: user.username});
})

module.exports = router;