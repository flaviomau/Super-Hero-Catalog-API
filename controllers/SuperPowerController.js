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

const handleSuperPowerUsed = (data) => {
  if(data.length > 0){
    const err = new Error('Super power used by one Super hero and can not be deleted.')
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
      response.json(data)
    })
    .catch(next)
}

SuperPowerController.prototype.readById = function(request, response, next){
  const query = {_id: request.params._id}
  this.model.findOneAsync(query)
    .then(handleNotFound)
    .then(data => {
      response.json(data)
    }).catch(next)
}

SuperPowerController.prototype.create = function(request, response, next){
  const superPower = buildSuperPower(request.body)
  this.model.createAsync(superPower)
    .then(data => {
      next(data)
    }).catch(error =>{
      const messages = Object.keys(error.errors).map(key => {
        return error.errors[key].message
      })
      response.json({errors: messages})
    })  
}

SuperPowerController.prototype.update = function(request, response, next){
  const _id = request.params._id
  const superPower = buildSuperPower(request.body)

  this.model.updateAsync(_id, superPower)
    .then(data => {
      next(data)
    })
    .catch(error =>{
      const messages = Object.keys(error.errors).map(key => {
        return error.errors[key].message
      })
      response.json({errors: messages})
    })
}

SuperPowerController.prototype.delete = function(request, response, next){
  const _id = request.params._id
  this.superHeroModel.findBySuperPowerAsync(_id)
    .then(handleSuperPowerUsed)
    .then(()=>{
      return this.model.removeAsync(_id)      
    }).then(data => {
      next(data)
    }).catch(next)
}

module.exports = function(SuperPowerModel, SuperHeroModel){
  return new SuperPowerController(SuperPowerModel, SuperHeroModel)
}