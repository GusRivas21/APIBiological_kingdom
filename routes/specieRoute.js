const express = require('express');
const router = express.Router();
const controller = require('../controllers/specieController');

// Ruta para búsqueda con AND (nombre + taxonomía)
router.get("/statusRange", controller.getSpecieByRangeStatus);
router.get("/search", controller.getByNameAndTax);
router.get("/country", controller.getSpecieByCountry);


//Ruta para buscar por estado de conservación
router.get('/status', controller.getSpecieByStatus);
router.get('/', controller.getSpecies);
router.get('/:id', controller.getSpecieById);
router.post('/', controller.createSpecie);
router.put('/:id', controller.updateSpecie);
router.delete('/:id', controller.deleteSpecie);


module.exports = router;
