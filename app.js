const express               = require('express'),
      methodOverride        = require('method-override'),
      bodyParser            = require('body-parser'),
      routes                = require('./routes'),
      mongoose              = require('./db/mongoose'),
      AuditEventModel       = require('./models/AuditEventModel')(mongoose)
      app                   = express(),  
      entities              = {
        'superheroes' : 'SuperHero',
        'superpowers' : 'SuperPower',
        'users'       : 'User'},
      actions               = {
        'POST'  : 'CREATE',
        'PUT'   : 'UPDATE',
        'DELETE': 'DELETE',
        'GET'   : 'LIST'      }

// server config
app.use(methodOverride('X­HTTP­Method'))
app.use(methodOverride('X­HTTP­Method­Override'))
app.use(methodOverride('X­Method­Override'))
app.use(methodOverride('_method'))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use((request, response, next) => {
  if (request.url === '/favicon.ico') {
    response.writeHead(200, {'Content-Type': 'image/x-icon'})
    response.end('')
  } else {
    next()
  }
})

// router
app.use('/', routes)

app.use((data, request, response, next) => {
  if(response.statusCode === 200){
    const auditEvent = {
      entity:   entities[request.url.split('/')[1]],
      username: request.username,
      action:   actions[request.method]
    }

    if(request.method === 'GET')
      response.json(data)
    else {      
      const io = request.app.get('io');
      if(request.method === 'PUT' || request.method === 'DELETE'){
        auditEvent['entityId'] = request.url.split('/')[2]      
      }else if(request.method === 'POST'){
        auditEvent['entityId'] = data._id
      }
      AuditEventModel.create(auditEvent)      
      io.emit('audit', auditEvent);
      response.json(data)
    }
  }else{
    next(data)
  }  
})

// error handling
app.use((request, response, next) => {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

app.use((err, request, response, next) => {
  response.status(err.status || 500).json({ err: err.message })
})

const server = require('http').createServer(app)  
const io = require('./controllers/socketServer')(server)

/*
const server = require('http').createServer(app)  
const io = require('socket.io')(server)

io.on('connection', function(client) {  
  client.on('subscribe', function(data) {
    try{
      const decoded = jwt.decode(token, config.get('jwtTokenSecret'))
      const isExpired = moment(decoded.expires).isBefore(new Date())

      if(!decoded.expires || !decoded.username || !decoded.role){
        const message = 'Unauthorized (token malformed)'
      }else if(isExpired){
        const message = 'Unauthorized (token expired)'
      }else{
        decoded.username
        decoded.role

        if(decoded.role === 'Standard'){
          const message = 'Unauthorized (low privilege)'
        }else if(request.role === 'Admin'){
          const message = 'ok'  
        }else{
            const message = 'Unauthorized (invalid role)'
        }
      }
    }catch(err){
      console.log(err)
      const message = err
    }
      //client.disconnect(true)

      client.emit('welcome', 'Welcome to Super Hero Catalogue Server Notification Socket - all messages will be sent in the audit event')
  })
})
*/
app.set('io', io)

server.listen(3000, () => {
  var host = server.address().address
  var port = server.address().port
  console.log('Super Hero Catalogue Server listening at http://%s:%s', host, port)
});