'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var NotificacionSchema = Schema({
    calculo: {type: Schema.ObjectId, ref: 'calculo', required:false},
    propietarios:[{type: Object, required: true}],
    interesado_nombre:{type: String, required: true},   
    descripcion: {type: String, required: true},
    potencia: {type: Number,default: 0, required: true},
    //asunto: {type: String, required: true},
    telefono: {type: String, required: true},
    correo: {type: String, required: true},
    ubicacion:[{type: Object, required: true}],
    createdAt: {type:Date, default: Date.now, require: true}
});

module.exports =  mongoose.model('notificacion',NotificacionSchema);