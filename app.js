const express               = require('express'),
      methodOverride        = require('method-override'),
      bodyParser            = require('body-parser'),
      routes                = require('./routes'),
      mongoose              = require('./db/mongoose'),
      AuditEventModel       = require('./models/AuditEventModel')(mongoose),
      Util                  = require('./utils/util'),
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
  if(data.status)
    return next(data)

  const entity = request.url.split('/')[1]
  const auditEvent = {
    entity:   entities[entity],
    username: request.username,
    action:   actions[request.method]
  }

  if(request.method === 'GET' || (request.url.split('/')[2] && request.url.split('/')[2] == 'authenticate'))
    response.json(data)
  else {      
    const io = request.app.get('io')
    if(request.method === 'PUT' || request.method === 'DELETE'){
      auditEvent['entityId'] = request.url.split('/')[2]
    }else if(request.method === 'POST'){
      auditEvent['entityId'] = data.data[entity]._id
    }
    auditEvent.datetime = new Date().getTime()
    AuditEventModel.create(auditEvent)
    io.emit('audit', auditEvent)
    response.json(data)
  }
})

// error handling
app.use((request, response, next) => {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

app.use((err, request, response, next) => {
  const answer = Util.buildErrorMessage(err.message)
  response.status(err.status || 500).json(answer)
})

const server = require('http').createServer(app)  
const io = require('./controllers/socketServer')(server)
app.set('io', io)

server.listen(3000, () => {
  var host = server.address().address
  var port = server.address().port
  console.log('Super Hero Catalogue Server listening at http://%s:%s', host, port)
})

module.exports = server