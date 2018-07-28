const createRouter = (SuperPowerModel, SuperHeroModel)=> {
	const	express             = require('express'),
        router              = express.Router(),
        SuperPowerController= require('../controllers/SuperPowerController')(SuperPowerModel, SuperHeroModel),
        middlewareAuth      = require('../controllers/middlewareAuth')

	router.get('/',         middlewareAuth({route: 6}), SuperPowerController.readAll.bind(SuperPowerController))
	router.post('/',        middlewareAuth({route: 7}), SuperPowerController.create.bind(SuperPowerController))
	router.put('/:_id',     middlewareAuth({route: 8}), SuperPowerController.update.bind(SuperPowerController))
	router.delete('/:_id',  middlewareAuth({route: 9}), SuperPowerController.delete.bind(SuperPowerController))
	router.get('/:_id',     middlewareAuth({route: 10}),SuperPowerController.readById.bind(SuperPowerController))
	return router
}

module.exports = createRouter