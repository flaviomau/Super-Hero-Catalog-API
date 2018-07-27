const debug     = require('debug')('super-hero-catalog:controller'),
      Promise   = require('bluebird'),
      jwt       = require('jwt-simple'),
      moment    = require('moment'),
      config    = require('config'),
      bcrypt    = require('bcrypt')

const handleNotFound = (data) => {
  if(!data){
    const err = new Error('Not Found in database')
    err.status = 404
    throw err
  }
  return data
}

const buildUser = (body) => {
  return {
      name: body.username,
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
    .then(function(data){
      response.json(data)
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
      response.json(data)
    }).catch(error =>{
      if(error.errors){
        const messages = Object.keys(error.errors).map(key => {
          return error.errors[key].message
        })
        response.json({errors: messages})
      }else{
        next(error) 
      }
    })  
}

UserController.prototype.update = function(request, response, next){
  const _id = request.params._id
  const user = buildUser(request.body)  

  if(request.body.password){
    bcrypt.genSalt(5, function(err, salt) {
      if (err) return next(err)
      bcrypt.hash(request.body.password, salt, null, function(err, hash) {
        if (err) return next(err)
        user['password'] = hash
      })
    })
  }


  this.model.updateAsync(_id, user)
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

UserController.prototype.delete = function(request, response, next){
  const _id = request.params._id
  this.model.removeAsync(_id)
    .then(function(data){
      response.json(data)
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
    .then(handleNotFound)
    .then(function(data){
      bcrypt.compare(password, data.password, function(err, isMatch) {
        if(isMatch){
          const expires = moment().add(7, 'days').valueOf()
          const token = jwt.encode({
              username: username,
              role: data.role,
              expires: expires
            }, 
            config.get('jwtTokenSecret')
          )
          response.json({token: token})
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