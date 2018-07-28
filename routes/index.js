const express         = require('express'),
      router          = express.Router(),
      mongoose        = require('../db/mongoose'),
      UserModel       = require('../models/UserModel')(mongoose),
      SuperPowerModel = require('../models/SuperPowerModel')(mongoose),
      SuperHeroModel  = require('../models/SuperHeroModel')(mongoose),    
      users           = require('./users'),
      superpowers     = require('./superPowers'),
      superheroes     = require('./superHeroes')

router.get('/', (request, response) => {
  response.send('Super Hero Catalogue REST api')
})

router.use('/users',      users(UserModel))
router.use('/superpowers',superpowers(SuperPowerModel, SuperHeroModel))
router.use('/superheroes',superheroes(SuperHeroModel))

module.exports = router