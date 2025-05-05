'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Panel_solarSchema = Schema({
    //producto: {type: Schema.ObjectId, ref: 'producto', required: true},
    modelo:{type:String,required:true},
    potencia: {type: Number,default: 0, required: true},  
    voc: {type: Number,default: 0, required: true},
    isc: {type: Number,default: 0, required: true},
    eficiencia: {type: Number,default: 0, required: true},
    tension: {type: Number,default: 0, required: true},
    potencia: {type: Number,default: 0, required: true},
    descripcion: {type: String, required: true},
    vmpp: {type: Number,default: 0, required: true},
    impp: {type: Number,default: 0, required: true},
    peso: {type: Number,default: 0, required: true},
    noct: {type: Number,default: 0, required: true},
    tc_of_isc: {type: Number,default: 0, required: true},
    tc_of_voc: {type: Number,default: 0, required: true},
    tc_of_pmax: {type: Number,default: 0, required: true},
    portada: {type: String, required: true},
    estado: {type: Boolean, default:true},
    createdAt: {type:Date, default: Date.now, require: true},
    propietario: {type: Schema.ObjectId, ref: 'clienteEmpresarial', required:true},
   
});

module.exports =  mongoose.model('panel',Panel_solarSchema);//panel_solar