const debug     = require('debug')('super-hero-catalog:controller'),
      Promise   = require('bluebird'),
      jwt       = require('jwt-simple'),
      moment    = require('moment'),
      config    = require('config'),
      bcrypt    = require('bcrypt'),
      Util      = require('../utils/util')

const buildUser = (body) => {
  return {
      username: body.username,
      role: body.role
  }
}

const getHash = async (password) => {
  try{
    const salt = await bcrypt.genSalt(5)
    return await bcrypt.hash(password, salt)
  }
  catch (e) {
    return null
  }
}

function UserController(UserModel){
  this.model = Promise.promisifyAll(UserModel)
}

UserController.prototype.readAll = function(request, response, next){
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

UserController.prototype.create = function(request, response, next){
  const user = buildUser(request.body)

  if (user.role !== 'Standard' && user.role !== 'Admin') {
    const err = new Error('Invalid role (must be Standard or Admin)')
    err.status = 401
    return next(err)
  }

  getHash(request.body.password)
    .then(password => {
      if(password)
        user['password'] = password
      return true
    }).then(()=>{
      return this.model.createAsync(user)
    }).then(data => {
      const answer = Util.buildSuccessMessage("Create successful", { user : data })
      return next(answer)
    }).catch(error =>{
      if(error.errors){
        const messages = Object.keys(error.errors).map(key => {
          return error.errors[key].message
        })
        const answer = Util.buildErrorMessage(messages)
        response.json(answer)
      }else{
        next(error) 
      }
    })  
}

UserController.prototype.update = function(request, response, next){
  const _id = request.params._id
  const user = buildUser(request.body)

  if(request.body.password){
    bcrypt.genSalt(5, (err, salt) => {
      if (err) return next(err)
      bcrypt.hash(request.body.password, salt, null, (err, hash) => {
        if (err) return next(err)
        user['password'] = hash
      })
    })
  }

  this.model.updateAsync(_id, user)
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

UserController.prototype.delete = function(request, response, next){
  const _id = request.params._id
  this.model.removeAsync(_id)
    .then(data => {
      const answer = Util.buildSuccessMessage("Delete successful", { superhero : data })
      return next(answer)
    })
    .catch(next)
}

UserController.prototype.authenticate = function(request, response, next){
  const username = request.body.username || ''
  const password = request.body.password || ''
  const role = request.body.role || ''

  if (username == '' || password == '') {
    const err = new Error('Unauthorized (missing username or password)')
    err.status = 401
    return next(err)
  }
  const query = {username: username}
  this.model.findOneAsync(query)
    .then(Util.handleNotFound)
    .then(data => {
      bcrypt.compare(password, data.password, (err, isMatch) => {
        if(isMatch){
          const expires = moment().add(7, 'days').valueOf()
          const token = jwt.encode({
              username: username,
              role: data.role,
              expires: expires
            }, 
            config.get('jwtTokenSecret')
          )
          const answer = Util.buildSuccessMessage("Authentication successful", {token: token})
          response.json(answer)
        }else{
          const err = new Error('Invalid Password')
          err.status = 401
          return next(err)
        }
      })
    })
    .catch(next)
}

module.exports = function(UserModel){
  return new UserController(UserModel)
}
