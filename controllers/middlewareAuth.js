const jwt     = require('jwt-simple'),
      config  = require('config'),
      moment  = require('moment')

module.exports = (option) => {
  return (request, reponse, next) => {
    const token = (request.body && request.body.access_token) || 
                (request.query && request.query.access_token) || 
                request.headers['x-access-token']

    const standardAutorization = [1,5,6,10,17]
    const adminAutorization = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,16,17]

    if(!token){
      const err = new Error('Forbidden')
      err.status = 403
      return next(err)
    }

    try{
      const decoded = jwt.decode(token, config.get('jwtTokenSecret'))
      const isExpired = moment(decoded.expires).isBefore(new Date())

      if(!decoded.expires || !decoded.username || !decoded.role){
        const err = new Error('Unauthorized (token malformed)')
        err.status = 401
        return next(err)
      }else if(isExpired){
        const err = new Error('Unauthorized (token expired)')
        err.status = 401        
        return next(err)
      }else{
        request.username = decoded.username
        request.role = decoded.role

        if(request.role === 'Standard'){
          if(standardAutorization.indexOf(option.route) < 0){
            const err = new Error('Unauthorized (low privilege)')
            err.status = 401
            return next(err)
          }          
        }else if(request.role === 'Admin'){
          //Not necessary, implemented only to do a double check in the role parameter
          if(adminAutorization.indexOf(option.route) < 0){
            const err = new Error('Unauthorized (low privilege)')
            err.status = 401
            return next(err)
          }  
        }else{
            const err = new Error('Unauthorized (invalid role)')
            err.status = 401
            return next(err)
        }
        next()
      }
    }catch(error){
      const err = new Error(error)
      err.status = 401
      return next(err)
    }
  }
}