'use strict'

var express = require('express');
var InversorController= require('../controllers/InversorController')

var api = express.Router();
var auth = require('../middlewares/authenticate');
var multiparty = require('connect-multiparty');
var path = multiparty({uploadDir: './uploads/productos'});


api.get('/listar_inversores',InversorController.listar_inversores)

module.exports = api;