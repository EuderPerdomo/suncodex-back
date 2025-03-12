'use strict'

var express = require('express');
var controladorController = require('../controllers/ControladorController')

var api = express.Router();
var auth = require('../middlewares/authenticate');
var multiparty = require('connect-multiparty');
var path = multiparty({uploadDir: './uploads/productos'});


api.get('/listar_controladores',controladorController.listar_controladores)

module.exports = api;