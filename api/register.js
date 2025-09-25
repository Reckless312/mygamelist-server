import {Router} from "express";
import {createNewSession, registerNewUser} from "../sequalize/users";

const router = Router();

router.route('/').post(async (req, res) => {
    const {username, password} = req.body;

    const user = await registerNewUser(username, password);

    if (!user) {
        return res.status(401).json({message: 'Username already exists'});
    }

    const sessionId = await createNewSession(user.id);

    res.cookie('session_id', sessionId, {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 24,
    });

    return res.status(200).json({message: 'Registered successfully'});
})

module.exports = router;