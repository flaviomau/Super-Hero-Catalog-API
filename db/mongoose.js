var mongoose  = require('mongoose'),
    debug     = require('debug')('super-hero-catalog:mongoose'),
    config    = require('config')
'use strict'

const _connection = () => {
  const username  = config.get('mongo.username'),
        password  = config.get('mongo.password'),
        server    = config.get('mongo.server'),
        port      = config.get('mongo.port'),
        database  = config.get('mongo.database'),
        auth      = username ? username + ':' + password + '@' : ''
        return 'mongodb://' + auth + server + ':' + port + '/' + database
}

mongoose.connect(_connection())
const db = mongoose.connection

db.on('error', error => {
  debug(error)
})

db.once('open', callback => {
  debug('connected to mongodb')
})

module.exports = mongoose
