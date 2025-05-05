'use strict'

var express = require('express');
var PanelSolarController=require('../controllers/PaneleSolarController')

var api = express.Router();
var auth = require('../middlewares/authenticate');
var multiparty = require('connect-multiparty');
var path = multiparty({uploadDir: './uploads/productos'});

api.get('/listar_paneles',PanelSolarController.listar_paneles);

module.exports = api;