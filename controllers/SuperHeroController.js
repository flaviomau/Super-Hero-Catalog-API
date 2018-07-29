const debug     = require('debug')('super-hero-catalog:controller'),
      Promise   = require('bluebird')

const handleNotFound = (data) => {
  if(!data){
    const err = new Error('Not Found in database')
    err.status = 404
    throw err
  }
  return data
}

const buildSuperHero = (body) => {
    return {
        name:           body.name,
        alias:          body.alias,
        superpower:     body.superpower,
        protectionArea: body.protectionArea
    }
}

function SuperHeroController(SuperHeroModel){
  this.model = Promise.promisifyAll(SuperHeroModel)
}

SuperHeroController.prototype.readAll = function(request, response, next){
  const pagination = {
    page: parseInt(request.query.page) || 0,
    limit: parseInt(request.query.limit) || 10
  }

  this.model.findAsync(pagination)
    .then(data => {
      response.json(data)
    })
    .catch(next)
}

SuperHeroController.prototype.readById = function(request, response, next){
  const query = { _id: request.params._id }
  this.model.findOneAsync(query)
    .then(handleNotFound)
    .then(data => {
      return next(data)
    })
    .catch(next)
}

SuperHeroController.prototype.create = function(request, response, next){
  const superHero = buildSuperHero(request.body)
  if (superHero.superpower.length === 0) {
    const err = new Error('The Super Hero must have at least one super power')
    err.status = 401
    return next(err)
  }
  this.model.createAsync(superHero)
    .then(data => {
      return next(data)
    })
    .catch(error => {
      const messages = Object.keys(error.errors).map(key => {
        return error.errors[key].message
      })
      response.json({ errors: messages })
    })  
}

SuperHeroController.prototype.update = function(request, response, next){
  const _id = request.params._id
  const superHero = buildSuperHero(request.body)

  if(superHero.superpower.length === 0){
    const err = new Error('The Super Hero must have at least one super power')
    err.status = 401
    return next(err)
  }

  this.model.updateAsync(_id, superHero)
    .then(data => {
      return next(data)
    })
    .catch(error =>{
      const messages = Object.keys(error.errors).map(key => {
        return error.errors[key].message
      })
      response.json({errors: messages})
    })
}

SuperHeroController.prototype.delete = function(request, response, next){
  const _id = request.params._id
  this.model.removeAsync(_id)
    .then(data => {
      return next(data)
    })
    .catch(next)
}

module.exports = function(SuperHeroModel){
  return new SuperHeroController(SuperHeroModel)
}