'use strict'

function AuditEventDao(model){
  this.model = model
}

AuditEventDao.prototype.create = function(data){
  const model = new this.model(data)
    model.save()
}

module.exports = function(mongoose){
  const AuditEvent = mongoose.model('AuditEvent', {
    entity:     { type: String, required: [true, 'Field name cannot be blank.']},
    username:   { type: String, required: [true, 'Field username cannot be blank.']},
    action:     { type: String, required: [true, 'Field action cannot be blank.']},
    entityId:   { type: mongoose.Schema.Types.ObjectId, required: [true, 'Field name cannot be blank.']},
    datetime:   { type: Date,   default: Date.now }
  })
  return new AuditEventDao(AuditEvent)
}