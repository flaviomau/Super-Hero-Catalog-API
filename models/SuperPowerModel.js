'use strict'

function SuperPowerDao(model){
  this.model = model
}

SuperPowerDao.prototype.create = function(data, callback){
  const model = new this.model(data)
  model.save((err,result) => {
    callback(err, result)
  })
}

SuperPowerDao.prototype.find = function(pagination, callback){
  this.model
    .find()
    .skip(pagination.page * pagination.limit)
    .limit(pagination.limit)
    .exec(callback)
}

SuperPowerDao.prototype.findOne = function(query, callback){
  this.model.findOne(query).exec(callback)
}

SuperPowerDao.prototype.update = function(_id, data, callback){
  const query = {_id: _id}
  this.model.update(query, data).exec((err, result) => {
    callback(err, result)
  })
}

SuperPowerDao.prototype.remove = function(_id, callback){
  const query = {_id: _id}
  this.model.remove(query).exec((err, result) => {
    callback(err, result)
  })
}

module.exports = function(mongoose){
  const SuperPower = mongoose.model('SuperPower', {
    name:   { type: String, required: [true, 'Field name cannot be blank.'], unique: true},
    description:{ type: String, required: [true, 'Field description cannot be blank.']}
  })
  return new SuperPowerDao(SuperPower)
}