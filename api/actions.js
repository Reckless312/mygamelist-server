const {Router} = require("express");
const {createUser, getUserByName, updateUser} = require("../sequalize/users")

const actions = new Map();

const router = Router();

router.route('/')
    .post(async (req, res) => {
        try {
            if (req.body === undefined || req.body?.name === undefined) {
                return res.status(404).json({ message: 'Missing required fields' });
            }

            const { name, email, image } = req.body;
            await createUser(name, email, image, "User");

            res.status(200).json({ message: 'User created successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error happened while adding a new user' });
        }
    })
    .patch(async (req, res) => {
        try {
            if (req.body === undefined || req.body?.id === undefined || req.body?.name === undefined || req.body?.email === undefined || req.body?.image === undefined || req.body?.role === undefined) {
                return res.status(404).json({ message: 'Missing required fields' });
            }

            const { id, name, email, image, role } = req.body;
            await updateUser(id, name, email, image, role);

            res.status(200).json({ message: 'User updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error happened while updating a new user' });
        }
    })

router.route('/name')
    .post(async (req, res) => {
        try {
            if (req.body === undefined || req.body?.name === undefined) {
                return res.status(404).json({ message: 'Missing required fields' });
            }

            const { name } = req.body;

            const response = await getUserByName(name);
            res.json(response);
        } catch (error) {
            res.status(500).json({ message: 'Error happened while retrieving a new user' });
        }
    })

router.route('/add')
    .post(async (req, res) => {
        try {
            if (req.body === undefined || req.body?.name === undefined || req.body?.time === undefined) {
                return res.status(404).json({ message: 'Missing required fields' });
            }

            const { name, time } = req.body;

            switch (actions.has(name)) {
                case true:
                    actions.set(name, [...actions.get(name), [time, "add"]]);
                    break;
                case false:
                    actions.set(name, [[time, "add"]]);
                    break;
            }

            console.log(actions);

            res.status(200);
        } catch (error) {
            res.status(500).json({ message: 'Error happened while adding a new add operation' });
        }
    })

router.route('/remove')
    .post(async (req, res) => {
        try {
            if (req.body === undefined || req.body?.name === undefined || req.body?.time === undefined) {
                return res.status(404).json({ message: 'Missing required fields' });
            }

            const { name, time } = req.body;

            switch (actions.has(name)) {
                case true:
                    actions.set(name, [...actions.get(name), [time, "remove"]]);
                    break;
                case false:
                    actions.set(name, [[time, "remove"]]);
                    break;
            }

            console.log(actions);

            res.status(200);
        } catch (error) {
            res.status(500).json({ message: 'Error happened while adding a new remove operation' });
        }
    })


router.route('/update')
    .post(async (req, res) => {
        try {
            if (req.body === undefined || req.body?.name === undefined || req.body?.time === undefined) {
                return res.status(404).json({ message: 'Missing required fields' });
            }

            const { name, time } = req.body;

            switch (actions.has(name)) {
                case true:
                    actions.set(name, [...actions.get(name), [time, "update"]]);
                    break;
                case false:
                    actions.set(name, [[time, "update"]]);
                    break;
            }

            console.log(actions);

            res.status(200);
        } catch (error) {
            res.status(500).json({ message: 'Error happened while adding a new add operation' });
        }
    })

module.exports = router;