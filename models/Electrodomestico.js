'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ElectrodomesticoSchema = Schema({
    nombre: {type: String, required: true},
    portada: {type: String, required: true},
    potencia:{type:Number,required:true},
    usoDia:{type:Number,required:true},
    estado:{type:Boolean,required:true,default:true},
    categoria: {type: Schema.ObjectId, ref: 'categoriaElectrodomestico', required: true},
    createdAt: {type:Date, default: Date.now, require: true}
});

module.exports =  mongoose.model('electrodomestico',ElectrodomesticoSchema);