const   express             = require('express'),
        router              = express.Router(),
        mongoose            = require('../db/mongoose'),
        UserModel           = require('../models/UserModel')(mongoose),
        UserController      = require('../controllers/UserController')(UserModel),
        middlewareAuth      = require('../controllers/middlewareAuth')

router.get('/',             middlewareAuth({route: 11}), UserController.readAll.bind(UserController))
router.post('/',            middlewareAuth({route: 12}), UserController.create.bind(UserController))
router.put('/:_id',         middlewareAuth({route: 13}), UserController.update.bind(UserController))
router.delete('/:_id',      middlewareAuth({route: 14}), UserController.delete.bind(UserController))
router.post('/authenticate',                             UserController.authenticate.bind(UserController))

module.exports = router