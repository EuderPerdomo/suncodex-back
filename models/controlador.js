'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ControladorSchema = Schema({
    propietario: {type: Schema.ObjectId, ref: 'clienteEmpresarial', required: true},
    modelo:{type:String,default:'',required:true},
    descripcion:{type:String,required:true},
    tecnologia:{type:String,required:true},
    portada:{type:String,required:true},
    peso: {type: Number,default: 0, required: true},
    amperaje: {type: Number,default: 0, required: true},
    input:[{type: Object, required: true}],
    estado:{type:Boolean,default:true},
    //tipos_baterias:[{type: Object, required: true}],
    createdAt: {type:Date, default: Date.now, require: true}
});

module.exports =  mongoose.model('controlador',ControladorSchema);