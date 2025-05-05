'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BateriaSchema = Schema({
    propietario: {type: Schema.ObjectId, ref: 'clienteEmpresarial', required: true},
    modelo: {type: String,default: 0, required: true},
    portada: {type: String, required: true},
    descripcion: {type: String, required: true},
    voltaje: {type: Number,default: 0, required: true},
    peso: {type: Number,default: 0, required: true},
    amperaje: {type: Number,default: 0, required: true},
    tecnologia: {type: String,default: 0, required: true},
    estado: {type: Boolean, default: true, required: true},
    createdAt: {type:Date, default: Date.now, require: true}
});

module.exports =  mongoose.model('bateria',BateriaSchema);