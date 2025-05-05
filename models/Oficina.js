'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var OficinaSchema = Schema({
    nombre: {type: String, required: true},
    direccion: {type: String, required: true},
    descripcion: {type: String, required: true},
    email: {type: String, required: true},
    telefono: {type: Number, required: true},
    ubicacion:[{type: Object, required: true}],
    estado:{type:Boolean,default:true},   
    createdAt: {type:Date, default: Date.now, require: true},
    inversores: [{type: Schema.ObjectId, ref: 'inversor', required:false}],
    controladores: [{type: Schema.ObjectId, ref: 'controlador', required:false}],
    paneles: [{type: Schema.ObjectId, ref: 'panel_solar', required:false}],
    baterias: [{type: Schema.ObjectId, ref: 'bateria', required:false}],
});

module.exports =  mongoose.model('oficina',OficinaSchema);