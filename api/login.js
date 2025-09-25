import {Router} from "express";
import {checkCredentials} from "../sequalize/users";

const router = Router();

router.route('/').post(async (req, res) => {
    const {username, password} = req.body;

    const user = await checkCredentials(username, password);

    if (user !== null) {
        res.status(200).json({message: 'Login successful'});
    } else {
        res.status(401).json({message: 'Login failed'});
    }
})