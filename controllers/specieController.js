const Specie = require('../models/Specie');

exports.getSpecies = async (req, res) => {
  try {
    const species = await Specie.find()
      .populate('kingdom_id')
      .populate('taxonomy_id')
      .populate('habitat_id')

    res.status(200).json(species);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las especies', error });
  }
};

exports.getSpecieById = async (req, res) => {
  try {
    const specie = await Specie.findById(req.params.id)
      .populate('kingdom_id')
      .populate('taxonomy_id')
      .populate('habitat_id');

    if (!specie) {
      return res.status(404).json({ message: 'Especie no encontrada' });
    }
    res.status(200).json(specie);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la especie', error });
  }
};

//Buscar especies por estado de conservación usando operadores de comparación o igualdad

exports.getSpecieByStatus = async (req, res) => {
  try {
    const status = req.query.status;

    if (!status) {
      return res.status(400).json({ message: "Debe enviar el estado" })
    }
    const specie = await Specie.find({ conservation_status: status })

    res.status(200).json(specie);

  } catch (error) {

    res.status(500).json({ message: 'Error al obtener la especie', error })

  }
}

//buscar por nombre y taxonomia genus o family
exports.getByNameAndTax = async (req, res) => {
  const { name, genus, family } = req.query;

  let specieFilter = {};
  if (name) {
    specieFilter.scientific_name = { $regex: name, $options: "i" };
  }

  let taxonomyMatch = {};
  if (genus) {
    taxonomyMatch.genus = { $regex: genus, $options: "i" };
  }
  if (family) {
    taxonomyMatch.family = { $regex: family, $options: "i" };
  }

  try {
    let species = await Specie.find(specieFilter)
      .populate({
        path: "taxonomy_id",
        match: taxonomyMatch,
      });

    if (genus || family) {
      species = species.filter(specie => specie.taxonomy_id !== null);
    }

    res.status(200).json(species);

  } catch (error) {
    res.status(500).json({ message: "Error al buscar especies", error });
  }
};

//Buscar especies cuya distribución geográfica incluya un país o región usando IN.
exports.getSpecieByCountry = async (req, res) => {
  try {
    const countryQuery = req.query.country;

    if (!countryQuery) {
      return res.status(400).json({ message: "Debe enviar al menos un país" });
    }

    const countriesArray = countryQuery.split(',').map(c => c.trim());

    const specie = await Specie.find({
      "geographic_distribution.countries": { $in: countriesArray }
    });

    res.status(200).json(specie);

  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la especie', error });
  }
};

//Buscar especies con estado de conservación dentro de un rango (por ejemplo, entre “Vulnerable” y “En Peligro Crítico”).
exports.getSpecieByRangeStatus = async (req, res) => {
  try {
    const { minStatus, maxStatus } = req.query;

    const statusOrderOriginal = [
      "preocupación menor",
      "casi amenazado",
      "vulnerable",
      "en peligro",
      "en peligro crítico",
      "extinto en estado silvestre",
      "extinto"
    ];

    const statusOrderLowerCase = statusOrderOriginal.map(status => status.toLowerCase());

    if (!minStatus || !maxStatus) {
      return res.status(400).json({ message: "Debe enviar los estados de rango mínimo y máximo." });
    }

    const minStatusLower = minStatus.trim().toLowerCase();
    const maxStatusLower = maxStatus.trim().toLowerCase();

    const minIndex = statusOrderLowerCase.indexOf(minStatusLower);
    const maxIndex = statusOrderLowerCase.indexOf(maxStatusLower);

    if (minIndex === -1 || maxIndex === -1 || minIndex > maxIndex) {
      return res.status(400).json({ message: "Estados de conservación inválidos o el rango es incorrecto." });
    }

    const requiredStatuses = statusOrderOriginal.slice(minIndex, maxIndex + 1);

    const species = await Specie.find({
      conservation_status: { $in: requiredStatuses }
    });

    res.status(200).json(species);

  } catch (error) {
    res.status(500).json({ message: 'Error al buscar especies por rango de estado.', error });
  }
};

// Excluir especies de una taxonomía (genus y family) específica usando NE/NOT.
exports.findByTaxExclusion = async (req, res) => {
  const { genus, family } = req.query;

  const taxonomyExclusionCriteria = {};
  if (genus) {
    taxonomyExclusionCriteria.genus = { $regex: genus, $options: "i" };
  }
  if (family) {
    taxonomyExclusionCriteria.family = { $regex: family, $options: "i" };
  }

  try {
    const exclusionConditions = [];
    if (genus) {
      exclusionConditions.push({ 'taxonomyDetails.genus': taxonomyExclusionCriteria.genus });
    }
    if (family) {
      exclusionConditions.push({ 'taxonomyDetails.family': taxonomyExclusionCriteria.family });
    }

    const pipeline = [
      {
        $lookup: {
          from: 'taxonomies',
          localField: 'taxonomy_id',
          foreignField: '_id',
          as: 'taxonomyDetails'
        }
      },
      {
        $unwind: {
          path: '$taxonomyDetails',
          preserveNullAndEmptyArrays: true
        }
      },
    ];
    if (exclusionConditions.length > 0) {
      pipeline.push({
        $match: {
          $nor: exclusionConditions
        }
      });
    }
    const species = await Specie.aggregate(pipeline);
    res.status(200).json(species);

  } catch (error) {
    res.status(500).json({ message: "Error al buscar especies por exclusión taxonómica.", error });
  }
};

//Proyectar solo nombre común, nombre científico y estado de conservación usando PROJECT.
exports.simpleSpecie = async (req, res) => {
  try {
    const pipeline = [
      {
        $project: {
          _id: 0,
          common_name: 1,
          scientific_name: 1,
          conservation_status: 1
        }
      }
    ];

    const species = await Specie.aggregate(pipeline);
    res.status(200).json(species);

  } catch (error) {
    res.status(500).json({ message: "Error al obtener la lista simple de especies usando aggregate.", error });
  }
}

//Ordenar especies por estado de conservación o por nivel taxonómico usando SORT
exports.sortStatus = async (req, res) => {
  try {
    const species = await Specie.find({})
      // Ordenar por el campo conservation_status alfabéticamente (Ascendente: 1)
      .sort({ conservation_status: 1 });

    res.status(200).json(species);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las especies", error });
  }
};


exports.createSpecie = async (req, res) => {
  try {
    const newSpecie = await Specie.create(req.body);
    res.status(201).json(newSpecie);
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ message: 'Datos inválidos', error });
    }

    return res.status(500).json({ message: 'Error del servidor al crear', error });
  }
};

exports.updateSpecie = async (req, res) => {
  try {
    const updatedSpecie = await Specie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!updatedSpecie) {
      res.status(404).json({ message: 'Especie no encontrada' });
    }

    res.status(200).json(updatedSpecie);
  } catch (error) {

    if (error.name === 'CastError' || error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Datos inválidos', error });
    }
    return res.status(500).json({ message: 'Error del servidor al actualizar', error });
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
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID inválido', error });
    }

    return res.status(500).json({ message: 'Error del servidor al eliminar', error });
  }
};
