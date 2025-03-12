'use strict'

var express = require('express');
var bateriaController=require('../controllers/BateriaController')

var api = express.Router();
var auth = require('../middlewares/authenticate');
var multiparty = require('connect-multiparty');
var path = multiparty({uploadDir: './uploads/productos'});


api.get('/listar_baterias',bateriaController.listar_baterias)

module.exports = api;