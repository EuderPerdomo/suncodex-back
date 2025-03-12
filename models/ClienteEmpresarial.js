'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ClienteEmpresarialSchema = Schema({
    nombres: {type: String, required: true},
    apellidos: {type: String, required: true},
    pais: {type: String, required: false},
    email: {type: String, required: true},
    password: {type: String, required: true},
    telefono: {type: String, required: true},
    rol: {type: String, required: true, default:'empresa'},
    estado:{type:Boolean,default:true},   
    dni: {type: String, required: false},
    createdAt: {type:Date, default: Date.now, require: true},
    empresas: [{type: Schema.ObjectId, ref: 'empresa', required:false}],
    empresas_favoritas: {type: Schema.ObjectId, ref: 'empresa', required:false},
});

module.exports =  mongoose.model('clienteEmpresarial',ClienteEmpresarialSchema);