'use strict'

function UserDao(model){
  this.model = model
}

UserDao.prototype.create = function(data, callback){
  const model = new this.model(data)
  model.save((err,result) => {
    callback(err, result)
  })
}

UserDao.prototype.find = function(pagination, callback){
  this.model
    .find()
    .skip(pagination.page * pagination.limit)
    .limit(pagination.limit)
    .exec(callback)
}

UserDao.prototype.update = function(_id, data, callback){
  const query = {_id: _id}
  this.model.update(query, data).exec((err, result) => {
    callback(err, result)
  })
}

UserDao.prototype.delete = function(_id, callback){
  const query = {_id: _id}
  this.model.remove(query).exec((err, result) => {
    callback(err, result)
  })
}

module.exports = function(mongoose){
  const User = mongoose.model('User', {
    username:   { type: String, required: [true, 'Field username cannot be blank.'], unique: true},
    password:   { type: String, required: [true, 'Field password cannot be blank.']},
    role:       { type: String, enum: ['Admin', 'Standard'], required: [true, 'Field role cannot be blank.']}
  })
  return new UserDao(User)
}