'use strict'

var express = require('express');
var LamparaController = require('../controllers/LamparaController')

var api = express.Router();
var auth = require('../middlewares/authenticate');
var multiparty = require('connect-multiparty');
var path = multiparty({uploadDir: './uploads/productos'});



//Rutas para lamparas
api.post('/registro_lampara_admin',[auth.auth,path],LamparaController.registro_lampara_admin);
api.post('/registro_categoriaLampara_admin',[auth.auth,path],LamparaController.registro_categoriaLampara_admin);
//api.get('/listar_lamparas_admin',auth.auth,LamparaController.listar_lamparas_admin);
api.get('/listar_lamparas_guest',LamparaController.listar_lamparas_guest);
//api.put('/actualizar_lampara_admin/:id',[auth.auth,path],LamparaController.actualizar_lampara_admin);
//api.delete('/eliminar_lampara_admin/:id',auth.auth,LamparaController.eliminar_lampara_admin);
//api.get('/obtener_lampara_admin/:id',auth.auth,LamparaController.obtener_lampara_admin);
//Finalizan rutas lamparas

//Listado de lamparas desde el cliente

api.get('/listar_lamparas_public/:filtro?',LamparaController.listar_lamparas_public);
api.get('/obtener_lampara_public/:slug',LamparaController.obtener_lampara_public);
module.exports = api;