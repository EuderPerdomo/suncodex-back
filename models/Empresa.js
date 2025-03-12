'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var EmpresaSchema = Schema({
    nombre: {type: String, required: true},
    direccion: {type: String, required: true},
    descripcion: {type: String, required: false},
    logo: {type: String, required: false},
    email: {type: String, required: false},
    estado:{type:Boolean,default:true},   
    nit: {type: Number, required: true},
    createdAt: {type:Date, default: Date.now, require: true},
    oficinas: [{type: Schema.ObjectId, ref: 'oficina', required:false}],
});

module.exports =  mongoose.model('empresa',EmpresaSchema);