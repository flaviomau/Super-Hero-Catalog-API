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

const buildSuperPower = (body) => {
    return {
        name: body.name,
        description: body.description
    }
}

function SuperPowerController(SuperPowerModel){
  this.model = Promise.promisifyAll(SuperPowerModel)
}

SuperPowerController.prototype.readAll = function(request, response, next){
  const pagination = {
    page: parseInt(request.query.page) || 0,
    limit: parseInt(request.query.limit) || 10
  }

  this.model.findAsync(pagination)
    .then(function(data){
      response.json(data)
    })
    .catch(next)
}

SuperPowerController.prototype.readById = function(request, response, next){
    const query = {_id: request.params._id}
    this.model.findOneAsync(query)
        .then(handleNotFound)
        .then(function(data){
            response.json(data)
        })
        .catch(next)
}

SuperPowerController.prototype.create = function(request, response, next){
    const superPower = buildSuperPower(request.body)
    this.model.createAsync(superPower)
        .then(data => {
            response.json(data)
         })
        .catch(error =>{
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
    .then(function(data){
      response.json(data)
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
  //TODO: Check if the super power is registered for at least one super hero, in this case, return error
  this.model.removeAsync(_id)
    .then(function(data){
      response.json(data)
    })
    .catch(next)
}

module.exports = function(SuperPowerModel){
  return new SuperPowerController(SuperPowerModel)
}