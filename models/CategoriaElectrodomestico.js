'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategoriaElectrodomesticoSchema = Schema({
    nombre: {type: String, required: true},
    descripcion: {type: String, required: true},
    createdAt: {type:Date, default: Date.now, require: true}
});

module.exports =  mongoose.model('categoriaElectrodomestico',CategoriaElectrodomesticoSchema);