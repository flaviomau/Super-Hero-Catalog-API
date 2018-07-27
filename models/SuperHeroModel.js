'use strict'

function SuperHeroDao(model){
  this.model = model
}

SuperHeroDao.prototype.create = function(data, callback){
  const model = new this.model(data)
  model.save((err,result) => {
    callback(err, result)
  })
}

SuperHeroDao.prototype.find = function(pagination, callback){
  this.model
    .find()
    .skip(pagination.page * pagination.limit)
    .limit(pagination.limit)
    .exec(callback)
}

SuperHeroDao.prototype.findOne = function(query, callback){
  this.model
    .findOne(query)
    .populate('superpower')
    .exec(callback)
}

SuperHeroDao.prototype.update = function(_id, data, callback){
  const query = {_id: _id}
  this.model.update(query, data).exec((err, result) => {
    callback(err, result)
  })
}

SuperHeroDao.prototype.delete = function(_id, callback){
  const query = {_id: _id}
  this.model.remove(query).exec((err, result) => {
    callback(err, result)
  })
}

module.exports = function(mongoose){
  const protectionAreaSchema = new mongoose.Schema({
    name:   { type: String, required: [true, 'Field name cannot be blank.'], unique: true},
    lat:    { type: Number, required: [true, 'Field lat cannot be blank.']},
    long:   { type: Number, required: [true, 'Field long cannot be blank.']},
    radius: { type: Number, required: [true, 'Field radius cannot be blank.']},
  })

  const SuperHero = mongoose.model('SuperHero', {
    name:           { type: String, required: [true, 'Field name cannot be blank.'], unique: true},
    alias:          { type: String, required: [true, 'Field alias cannot be blank.']},
    protectionArea: { type: protectionAreaSchema, required: [true, 'Field protectionArea cannot be blank.']},
    superpower: [{
          type: mongoose.Schema.Types.ObjectId,
          ref:  'SuperPower'
        }],
    })
    return new SuperHeroDao(SuperHero)
}