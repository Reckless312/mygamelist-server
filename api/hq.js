import {Router} from "express";
import {getUserFromSession} from "../sequalize/users";

const router = Router();

router.route('/').get(async (req, res) => {
    const sessionId = req.cookie.session_id;

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