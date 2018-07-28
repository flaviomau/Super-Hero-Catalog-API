const createRouter = (SuperHeroModel)=> {
	const	express             = require('express'),
        router              = express.Router(),
        SuperHeroController = require('../controllers/SuperHeroController')(SuperHeroModel),
        middlewareAuth      = require('../controllers/middlewareAuth')

	router.get('/',         middlewareAuth({route: 1}), SuperHeroController.readAll.bind(SuperHeroController))
	router.post('/',        middlewareAuth({route: 2}), SuperHeroController.create.bind(SuperHeroController))
	router.put('/:_id',     middlewareAuth({route: 3}), SuperHeroController.update.bind(SuperHeroController))
	router.delete('/:_id',  middlewareAuth({route: 4}), SuperHeroController.delete.bind(SuperHeroController))
	router.get('/:_id',     middlewareAuth({route: 5}), SuperHeroController.readById.bind(SuperHeroController))
	return router
}

module.exports = createRouter