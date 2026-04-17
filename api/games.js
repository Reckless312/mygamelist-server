const {returnGames, createNewGame, findGamesByName, deleteGameById, updateGame} = require('../sequalize/games');
const gameService = require('../service/gameService');

const {Router} = require('express');
const {verifyIdAndExistence} = require("../service/gameService");
const router = Router();

router.route('/')
    .get(async (req, res) => {
        try {
            const validationResponse = gameService.validateFilterOptions(req.query);

            if (!validationResponse.ok) {
                return res.status(400).json({message: validationResponse.message});
            }

            const {name, startYear, endYear, field, order} = validationResponse.parsed;

            const games = name ? await findGamesByName(name) : await returnGames(startYear, endYear, field, order);

            res.json(games);
        } catch (error) {
            res.status(500).json({message: error.message});
        }
    })
    .post(async (req, res) => {
        try {
            const zodValidation = gameService.validateGameBody(req.body);

            if (!zodValidation.ok) {
                return res.status(400).json({message: 'Validation failed', errors: zodValidation.errors});
            }

            const isNameTaken = await gameService.validateTakenName(req.body.name);

            if (isNameTaken) {
                return res.status(400).json({message: 'A game with that name already exists'});
            }

            const {name, description, banner_url, images, releaseDate, price, tags} = req.body;

            await createNewGame(name, description, banner_url, images, tags, price, releaseDate);

            res.status(200).json({message: 'Game created successfully'});
        } catch (error) {
            res.status(500).json({message: error.message});
        }
    })

router.route('/:id')
    .get(verifyIdAndExistence, async (req, res) => {
        try {
            res.json(req.game);
        } catch (error) {
            res.status(500).json({message: error.message});
        }
    })
    .patch(verifyIdAndExistence, async (req, res) => {
        try {
            const zodValidation = gameService.validateGameBody(req.body);

            if (!zodValidation.ok) {
                return res.status(400).json({message: 'Validation failed', errors: zodValidation.errors});
            }

            const isNameTaken = await gameService.validateTakenName(req.body.name, req.id);

            if (isNameTaken) {
                return res.status(400).json({message: 'A game with that name already exists'});
            }

            const {name, description, banner_url, images, releaseDate, price, tags} = req.body;

            await updateGame(req.id, name, banner_url, description, images, tags, price, releaseDate);

            res.json({message: 'Game updated successfully'});
        } catch (error) {
            res.status(500).json({message: error.message});
        }
    })
    .delete(verifyIdAndExistence , async (req, res) => {
        try {
            await deleteGameById(req.id);

            res.json({message: 'Game deleted successfully'});
        } catch (error) {
            res.status(500).json({message: error.message});
        }
    })

module.exports = router;
