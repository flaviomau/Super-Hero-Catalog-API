const jwt     = require('jwt-simple'),
      config  = require('config'),
      moment  = require('moment')

module.exports = (server) => {
  const io = require('socket.io')(server)

  io.on('connection', function(client) {  
  	client.on('subscribe', function(token) {			
    	try{
      	const decoded = jwt.decode(token, config.get('jwtTokenSecret'))
      	const isExpired = moment(decoded.expires).isBefore(new Date())

      	if(!decoded.expires || !decoded.username || !decoded.role){
					client.emit('welcome', 'Unauthorized (token malformed)')
					client.disconnect(true)
      	}else if(isExpired){
					client.emit('welcome', 'Unauthorized (token expired)')
					client.disconnect(true)
      	}else{
        	if(decoded.role === 'Standard'){
						client.emit('welcome', 'Unauthorized (low privilege)')
						client.disconnect(true)
        	}else if(decoded.role === 'Admin'){
						client.emit('welcome', 'Welcome to Super Hero Catalogue Server Notification Socket - all messages will be sent in the audit event.')
        	}else{
						client.emit('welcome', 'Unauthorized (invalid role)')
						client.disconnect(true)
        	}
     	 	}
    	}catch(err){
				client.emit('welcome', 'Authorizathion token not sent or invalid.')
				client.disconnect(true)
    	}		      
		})
	})

	return io
}