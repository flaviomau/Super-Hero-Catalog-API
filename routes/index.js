const express     = require('express'),
      router      = express.Router()

router.get('/', (request, response) => {
  response.send('Super Hero Catalogue REST api')
})

router.use('/users', require('./users'))
router.use('/superpowers', require('./superPowers'))
router.use('/superheroes', require('./superHeroes'))

module.exports = router