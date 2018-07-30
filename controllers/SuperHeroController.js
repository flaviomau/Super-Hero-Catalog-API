const debug     = require('debug')('super-hero-catalog:controller'),
      Promise   = require('bluebird'),
      Util      = require('../utils/util')

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
      const answer = Util.buildSuccessMessage("List Successful", {
        page: pagination.page,
        limit: pagination.limit,
        list: data
      })
      response.json(answer)
    })
    .catch(next)
}

SuperHeroController.prototype.readById = function(request, response, next){
  const query = { _id: request.params._id }
  this.model.findOneAsync(query)
    .then(Uitl.handleNotFound)
    .then(data => {
      const answer = Util.buildSuccessMessage("Read successful", { superhero : data })
      return next(answer)
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
      const answer = Util.buildSuccessMessage("Create successful", { superhero : data })
      return next(answer)
    })
    .catch(error => {
      const messages = Object.keys(error.errors).map(key => {
        return error.errors[key].message
      })
      const answer = Util.buildErrorMessage(messages)
      response.json(answer)
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
      const answer = Util.buildSuccessMessage("Update successful", { _id })
      return next(answer)
    })
    .catch(error =>{
      const messages = Object.keys(error.errors).map(key => {
        return error.errors[key].message
      })
      const answer = Util.buildErrorMessage(messages)
      response.json(answer)
    })
}

SuperHeroController.prototype.delete = function(request, response, next){
  const _id = request.params._id
  this.model.removeAsync(_id)
    .then(data => {
      const answer = Util.buildSuccessMessage("Delete successful", { _id })
      return next(answer)
    })
    .catch(next)
}

module.exports = function(SuperHeroModel){
  return new SuperHeroController(SuperHeroModel)
}