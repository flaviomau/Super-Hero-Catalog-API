var express             = require('express'),
    router              = express.Router(),
    mongoose            = require('../db/mongoose'),
    UserModel           = require('../models/UserModel')(mongoose),
    UserController      = require('../controllers/UserController')(UserModel),
    middlewareAuth      = require('../controllers/middlewareAuth')

router.get('/',             middlewareAuth, UserController.readAll.bind(UserController))
router.post('/',            middlewareAuth, UserController.create.bind(UserController))
router.put('/:_id',         middlewareAuth, UserController.update.bind(UserController))
router.delete('/:_id',      middlewareAuth, UserController.delete.bind(UserController))
router.post('/authenticate',                UserController.authenticate.bind(UserController))

module.exports = router