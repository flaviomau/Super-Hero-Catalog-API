const express     = require('express'),
      router      = express.Router()

router.get('/', function (request, response) {
  response.send('Super Hero Catalogue REST api')
})

module.exports = router;