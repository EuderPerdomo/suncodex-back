'use strict'

var mongoose=require('mongoose')
var Schema=mongoose.Schema

var comentarioSchema = new mongoose.Schema({
    nombre: {type:String,required:true},
    email: {type:String,required:true},
    comentario: {type:String,required:true},
    estado:{type:Boolean, default:true},
    createdAt:{type:Date,default:Date.now,required:true}
});

var BlogSchema=Schema({
    titulo:{type:String, required:true},
    slug:{type:String, required:true},
    portada:{type:String, required:true},
    descripcion:{type:String, required:true},
    contenido:{type:String, required:true},
    categoria: {type: Schema.ObjectId, ref: 'categoria', required: true},
    estado:{type:String, default:'Edicion', required:true},
    comentarios:[comentarioSchema],
    createdAt:{type:Date,default:Date.now,required:true}

})
module.exports =mongoose.model('blog',BlogSchema)