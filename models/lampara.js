'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LamparaSchema = Schema({
    nombre: {type: String, required: true},
    portada: {type: String, required: true},
    potencia:{type:Number,required:true},
    estado:{type:Boolean,required:true,default:true},
    categoria: {type: Schema.ObjectId, ref: 'categoriaLampara', required: true},
    path: {type: String, required: true},
    lumens:{type:Number,required:true},
    distancia:{type:Number,required:true},
    anguloApertura:{type:Number,required:true},
    TemperaturaColor:{type:String,required:true},
    penumbra:{type:Number,required:true},
    createdAt: {type:Date, default: Date.now, require: true}
});

module.exports =  mongoose.model('lampara',LamparaSchema);
