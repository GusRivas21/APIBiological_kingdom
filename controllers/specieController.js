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

//Buscar especies filtrando por nombre científico y taxonomía usando AND.
exports.getByNameAndTax = async (req, res) => {
  try {
    const { name, phylum, class: classLevel, order, family, genus } = req.query;
    const validTaxonomyLevels = ['phylum', 'class', 'order', 'family', 'genus'];
    const taxonomyFilters = {};

    validTaxonomyLevels.forEach(level => {
      const value = level === 'class' ? classLevel : req.query[level];

      if (value) {
        taxonomyFilters[`taxonomyDetails.${level}`] = { $regex: value, $options: "i" };
      }
    });

    const pipeline = [];

    pipeline.push({
      $lookup: {
        from: 'taxonomies',
        localField: 'taxonomy_id',
        foreignField: '_id',
        as: 'taxonomyDetails'
      }
    });

    pipeline.push({
      $unwind: {
        path: '$taxonomyDetails',
      }
    });

    const matchConditions = [];

    if (name) {
      matchConditions.push({
        scientific_name: { $regex: name, $options: "i" }
      });
    }

    if (Object.keys(taxonomyFilters).length > 0) {
      matchConditions.push(taxonomyFilters);
    }

    if (matchConditions.length > 0) {
      pipeline.push({
        $match: {
          $and: matchConditions
        }
      });
    }

    const species = await Specie.aggregate(pipeline);
    res.status(200).json(species);

  } catch (error) {
    res.status(500).json({ message: "Error al buscar especies", error: error.message });
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
  try {
    const { phylum, class: classLevel, order, family, genus } = req.query;

    const validTaxonomyLevels = ['phylum', 'class', 'order', 'family', 'genus'];
    const exclusionConditions = [];

    validTaxonomyLevels.forEach(level => {
      const value = level === 'class' ? classLevel : req.query[level];

      if (value) {
        exclusionConditions.push({
          [`taxonomyDetails.${level}`]: { $regex: value, $options: "i" }
        });
      }
    });

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
    console.error("Error al buscar especies por exclusión taxonómica:", error);
    res.status(500).json({ message: "Error al buscar especies por exclusión taxonómica.", error: error.message });
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
    const statusOrder = [
      "preocupación menor",
      "casi amenazado",
      "vulnerable",
      "en peligro",
      "en peligro crítico",
      "extinto en estado silvestre",
      "extinto"
    ];


    const pipeline = [
      {
        $addFields: {
          sortIndex: {
            $indexOfArray: [statusOrder, '$conservation_status']
          }
        }
      },
      {
        $sort: {
          sortIndex: 1
        }
      },
      {
        $project: {
          sortIndex: 0
        }
      }
    ];

    const species = await Specie.aggregate(pipeline);

    res.status(200).json(species);

  } catch (error) {
    res.status(500).json({ message: "Error al obtener las especies", error: error.message });
  }
};

//Contar cuántas especies existen por categoría taxonómica usando GROUP + SUM.
exports.sumSpeciesByTax = async (req, res) => {
  const { level, value } = req.query;
  const validTaxonomyLevels = ['phylum', 'class', 'order', 'family', 'genus'];
  if (level && !validTaxonomyLevels.includes(level)) {
    return res.status(400).json({ message: `Nivel taxonómico no válido. Debe ser uno de: ${validTaxonomyLevels.join(', ')}` });
  }

  try {
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
    if (level && value) {
      const matchField = `taxonomyDetails.${level}`;
      const matchCriteria = {
        [matchField]: { $regex: value, $options: "i" }
      };

      pipeline.push({
        $match: matchCriteria
      });
    }

    const groupingKey = {};
    if (level) {
      groupingKey[level] = `$taxonomyDetails.${level}`;
    } else {
      groupingKey._id = null;
    }

    pipeline.push({
      $group: {
        _id: groupingKey,
        count: { $sum: 1 }
      }
    });

    const species = await Specie.aggregate(pipeline);
    res.status(200).json(species);

  } catch (error) {
    res.status(500).json({ message: "Error al contar especies por taxonomía.", error: error.message });
  }
};

//Mostrar especies detallando sus áreas de distribución usando PROJECT.

exports.speciesDistribution = async (req, res) => {
  try {
    const pipeline = [
      {
        $project: {
          _id: 0,
          common_name: 1,
          scientific_name: 1,
          geographic_distribution: 1
        }
      }
    ];

    const species = await Specie.aggregate(pipeline);
    res.status(200).json(species);

  } catch (error) {
    res.status(500).json({ message: "Error al obtener las especies.", error });
  }
}

//Obtener la especie más amenazada según estado de conservación usando SORT + LIMIT.
exports.endangeredSpecies = async (req, res) => {
  try {
    const statusOrder = [
      "preocupación menor",
      "casi amenazado",
      "vulnerable",
      "en peligro",
      "en peligro crítico",
      "extinto en estado silvestre",
      "extinto"
    ];


    const pipeline = [
      {
        $addFields: {
          sortIndex: {
            $indexOfArray: [
              statusOrder,
              { $toLower: '$conservation_status' }
            ]
          }
        }
      },
      {
        $sort: {
          sortIndex: -1
        }
      },
      {
        $limit: 1
      },
      {
        $project: {
          sortIndex: 0
        }
      }
    ];
    const species = await Specie.aggregate(pipeline);

    res.status(200).json(species);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las especies", error: error.message });
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
