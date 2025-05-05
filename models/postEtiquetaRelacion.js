'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostEtiquetaRelacionSchema = Schema({
    blog: {type: Schema.ObjectId, ref: 'blog', required: true},
    etiqueta: {type: Schema.ObjectId, ref: 'postEtiqueta', required: true},
    createdAt: {type:Date, default: Date.now, require: true}
});

module.exports =  mongoose.model('post_etiqueta_relacion',PostEtiquetaRelacionSchema);