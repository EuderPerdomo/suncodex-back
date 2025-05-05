'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var InversorSchema = Schema({
    propietario: {type: Schema.ObjectId, ref: 'clienteEmpresarial', required: true},
    modelo:{type:String,required:true},
    voltaje_out: {type: Number, required: true},
    voltaje_in: {type: Number,default: 0, required: true},
    potencia: {type: Number,default: 0, required: true},
    potencia_pico: {type: Number,default: 0, required: true},
    peso: {type: Number,default: 0, required: true},
    eficiencia: {type: Number,default: 95, required: true},
    tipo:{type:String,required:true},
    estado:{type:Boolean, default:true},
    portada:{type:String,required:true},
    descripcion:{type:String,required:true},
    createdAt: {type:Date, default: Date.now, require: true}
});

module.exports =  mongoose.model('inversor',InversorSchema);