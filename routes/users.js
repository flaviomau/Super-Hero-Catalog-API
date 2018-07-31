/** Express router providing user related routes
 * @module users
 */

const createRouter = (UserModel)=> {
	const	express         = require('express'),
  			router					= express.Router(),        
        UserController	= require('../controllers/UserController')(UserModel),
        middlewareAuth	= require('../controllers/middlewareAuth')

	/**
 	* Route to retrieve users list. Only avaiable to Admin users.
 	* @name get/user
 	* @function
 	* @memberof module:users
 	* @inner
 	* @returns {Array.<Object>} List of users registered.
 	*/
	router.get('/', middlewareAuth({route: 11}), UserController.readAll.bind(UserController))

	/**
 	* Route to insert new users. Only avaiable to Admin users.
 	* @name post/user
 	* @function
 	* @memberof module:users
 	* @inner
	* @param {Object} User data 
 	* @returns {Object} Status of operation.
 	*/
	router.post('/', middlewareAuth({route: 12}), UserController.create.bind(UserController))

	/**
 	* Route to update one specific user. Only avaiable to Admin	 users.
 	* @name put/user
 	* @function
 	* @memberof module:users
	* @inner
	* @param {String} Id User id 
	* @param {Object} Data User data 
 	* @returns {Object} Status of operation.
 	*/
	router.put('/:_id', middlewareAuth({route: 13}), UserController.update.bind(UserController))

	/**
 	* Route to delete one specific user. Only avaiable to Admin users.
 	* @name delete/user
 	* @function
 	* @memberof module:users
	* @inner
	* @param {String} User id
 	* @returns {Object} Status of operation.
 	*/
	router.delete('/:_id', middlewareAuth({route: 14}), UserController.delete.bind(UserController))

	/**
 	* Route to retrieve users list. Only avaiable to Admin users.
 	* @name post/authenticate
 	* @function
 	* @memberof module:users
	* @inner
	* @param {Object} User data - username and password.
 	* @returns {Object} Status of operation - token included.
 	*/
	router.post('/authenticate', UserController.authenticate.bind(UserController))
	return router
}

module.exports = createRouter