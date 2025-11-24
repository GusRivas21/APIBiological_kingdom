const Specie = require('../models/Specie');

exports.getSpecies = async (req, res) => {
  try {
    const species = await Specie.find();
    res.status(200).json(species);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las especies', error });
  }
};

exports.getSpecieById = async (req, res) => {
  try {
    const specie = await Specie.findById(req.params.id);
    if (!specie) {
      return res.status(404).json({ message: 'Especie no encontrada' });
    }
    res.status(200).json(specie);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la especie', error });
  }
};

exports.createSpecie = async (req, res) => {
  try {
    const newSpecie = new Specie.create(req.body);
    res.status(201).json(newSpecie);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear la especie', error });
  }
};

exports.updateSpecie = async (req, res) => {
  try {
    const updatedSpecie = await Specie.findByIdAndUpdate(req.params.id, req.body,{ new: true, runValidators: true });

    if (!updatedSpecie) {
      return res.status(404).json({ message: 'Especie no encontrada' });
    }

    res.status(200).json(updatedSpecie);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar la especie', error });
  }
};

exports.deleteSpecie = async (req, res) => {
  try {
    const deletedSpecie = await Specie.findByIdAndDelete(req.params.id);
    if (!deletedSpecie) {
      return res.status(404).json({ message: 'Especie no encontrada' });
    }

    res.status(200).json({ message: 'Especie eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la especie', error });
  }
};
