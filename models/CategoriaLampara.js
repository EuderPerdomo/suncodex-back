'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategoriaLamparaSchema = Schema({
    nombre: {type: String, required: true},
    descripcion: {type: String, required: true},
    createdAt: {type:Date, default: Date.now, require: true}
});

module.exports =  mongoose.model('categoriaLampara',CategoriaLamparaSchema);