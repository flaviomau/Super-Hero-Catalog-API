const express     = require('express'),
      router      = express.Router()

router.get('/', function (request, response) {
  response.send('Super Hero Catalogue REST api')
})

router.use('/users', require('./users'))
router.use('/superpowers', require('./superPowers'))

module.exports = router