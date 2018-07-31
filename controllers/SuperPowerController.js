const debug     = require('debug')('super-hero-catalog:controller'),
      Promise   = require('bluebird'),
      Util      = require('../utils/util')

const handleSuperPowerUsed = (data) => {
  if(data.length > 0){
    const err = new Error('SuperPower used by one SuperHero and can not be deleted.')
    err.status = 401
    throw err
  }
  return data
}

const buildSuperPower = (body) => {
    return {
        name: body.name,
        description: body.description
    }
}

function SuperPowerController(SuperPowerModel, SuperHeroModel){
  this.model = Promise.promisifyAll(SuperPowerModel)
  this.superHeroModel = Promise.promisifyAll(SuperHeroModel)
}

SuperPowerController.prototype.readAll = function(request, response, next){
  const pagination = {
    page: parseInt(request.query.page) || 0,
    limit: parseInt(request.query.limit) || 10
  }

  this.model.findAsync(pagination)
    .then(data => {
      const answer = Util.buildSuccessMessage("List successful", {
        page: pagination.page,
        limit: pagination.limit,
        list: data
      })
      response.json(answer)
    })
    .catch(next)
}

SuperPowerController.prototype.readById = function(request, response, next){
  const query = {_id: request.params._id}
  this.model.findOneAsync(query)
    .then(Util.handleNotFound)
    .then(data => {
      const answer = Util.buildSuccessMessage("Read successful", {
        superpowers: data
      })
      response.json(answer)
    }).catch(next)
}

SuperPowerController.prototype.create = function(request, response, next){
  const superPower = buildSuperPower(request.body)
  this.model.createAsync(superPower)
    .then(data => {
      const answer = Util.buildSuccessMessage("Create successful", { superpowers : data })
      return next(answer)
    }).catch(error =>{            
      if(error.errors){
        const messages = Object.keys(error.errors).map(key => {
          return error.errors[key].message
        })
        const answer = Util.buildErrorMessage(messages)
        response.json(answer)
      }else{
        const err = new Error(error.message || error)
        err.status = 401
        next(err)
      }
    })  
}

SuperPowerController.prototype.update = function(request, response, next){
  const _id = request.params._id
  const superPower = buildSuperPower(request.body)

  this.model.updateAsync(_id, superPower)
    .then(data => {
      const answer = Util.buildSuccessMessage("Update successful", { _id })
      return next(answer)
    })
    .catch(error =>{
      if(error.errors){
        const messages = Object.keys(error.errors).map(key => {
          return error.errors[key].message
        })
        const answer = Util.buildErrorMessage(messages)
        response.json(answer)
      }else{
        const err = new Error(error.message || error)
        err.status = 401
        next(err)
      }
    })
}

SuperPowerController.prototype.delete = function(request, response, next){
  const _id = request.params._id
  this.superHeroModel.findBySuperPowerAsync(_id)
    .then(handleSuperPowerUsed)
    .then(()=>{    
      return this.model.removeAsync(_id)
    }).then(data => {
      const answer = Util.buildSuccessMessage("Delete successful", { _id })
      return next(answer)
    }).catch(next)
}

module.exports = function(SuperPowerModel, SuperHeroModel){
  return new SuperPowerController(SuperPowerModel, SuperHeroModel)
}