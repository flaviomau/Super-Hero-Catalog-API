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

//AuditEventController.create.bind(AuditEventController)

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
    if(request.method === 'PUT' || request.method === 'DELETE'){
      const auditEvent = {
        entity:   entities[request.url.split('/')[1]],
        entityId: request.url.split('/')[2],
        username: request.username,
        action:   actions[request.method]
      }
      AuditEventModel.create(auditEvent)
      response.json(data)
    }else if(request.method === 'POST'){
      const auditEvent = {
        entity:   entities[request.url.split('/')[1]],
        entityId: data._id,
        username: request.username,
        action:   actions[request.method]
      }
      AuditEventModel.create(auditEvent)
      response.json(data)
    }else{
      response.json(data)
    }
  }else{
    next()
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

var server = app.listen(3000, () => {
  var host = server.address().address
  var port = server.address().port
  console.log('Super Hero Catalogue Server listening at http://%s:%s', host, port)
})