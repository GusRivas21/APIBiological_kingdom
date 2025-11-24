const express = require('express');
const router = express.Router();
const controller = require('../controllers/specieController');

router.get('/', controller.getSpecies);
router.get('/:id', controller.getSpecieById);
router.post('/', controller.createSpecie);
router.put('/:id', controller.updateSpecie);
router.delete('/:id', controller.deleteSpecie);

module.exports = router;
