'use strict'

var express = require('express');
var empresaController=require('../controllers/EmpresaController');

var api = express.Router();
var auth = require('../middlewares/authenticate');
var multiparty = require('connect-multiparty');
var path = multiparty({uploadDir: './uploads/productos'});

//Rutas para las empresas de Empresarios
api.post('/create_empresa_empresa',[auth.auth,path],empresaController.create_empresa_empresa);
api.get('/listar_empresas_empresa',auth.auth,empresaController.listar_empresas_empresa);
api.put('/actualizar_empresa_empresa/:id',[auth.auth,path],empresaController.actualizar_empresa_empresa);
api.delete('/eliminar_empresa_empresa/:id',auth.auth,empresaController.eliminar_empresa_empresa);
api.get('/obtener_empresa_empresa/:id',auth.auth,empresaController.obtener_empresa_empresa);
//Finalizan las rutas empresas empresario

//Inician las rutas asociadas a las sucursales de cada empresa
api.get('/listar_sucursales_empresa/:id',auth.auth,empresaController.listar_sucursales_empresa);
api.post('/create_sucursal_empresa',[auth.auth,path],empresaController.create_sucursal_empresa);
api.delete('/eliminar_sucursal_empresa/:id',auth.auth,empresaController.eliminar_sucursal_empresa);
api.get('/obtener_sucursal_empresa/:id',auth.auth,empresaController.obtener_sucursal_empresa);
api.put('/actualizar_sucursal_empresa/:id',[auth.auth,path],empresaController.actualizar_sucursal_empresa);
//Finalizan rutas asociadas las sucursales de cada empresa

//Inician rutas asociadas a actualizar equipos de Sucursales
api.put('/actualizar_inversor_sucursal_empresa/:id',[auth.auth,path],empresaController.actualizar_inversor_sucursal_empresa);
api.put('/actualizar_controlador_sucursal_empresa/:id',[auth.auth,path],empresaController.actualizar_controlador_sucursal_empresa);
api.put('/actualizar_panel_sucursal_empresa/:id',[auth.auth,path],empresaController.actualizar_panel_sucursal_empresa);
api.put('/actualizar_bateria_sucursal_empresa/:id',[auth.auth,path],empresaController.actualizar_bateria_sucursal_empresa);
//Finalizan Rutas asociadas a actualizar equipos de Sucursales


//Rutas Paneles Solares Empresas
api.get('/listar_paneles_empresa',auth.auth,empresaController.listar_paneles_empresa);
api.post('/registro_panel_empresa',[auth.auth,path],empresaController.registro_panel_empresa);
api.put('/actualizar_panel_empresa/:id',[auth.auth,path],empresaController.actualizar_panel_empresa);
api.delete('/eliminar_panel_empresa/:id',auth.auth,empresaController.eliminar_panel_empresa);
api.get('/obtener_panel_empresa/:id',auth.auth,empresaController.obtener_panel_empresa);

//Rutas para Baterias
api.post('/registro_bateria_empresa',[auth.auth,path],empresaController.registro_bateria_empresa);
api.get('/listar_baterias_empresa',auth.auth,empresaController.listar_baterias_empresa);
api.put('/actualizar_bateria_empresa/:id',[auth.auth,path],empresaController.actualizar_bateria_empresa);
api.delete('/eliminar_bateria_empresa/:id',auth.auth,empresaController.eliminar_bateria_empresa);
api.get('/obtener_bateria_empresa/:id',auth.auth,empresaController.obtener_bateria_empresa);
//Finalizan rutas Baterias


//Rutas para Controladores
api.post('/registro_controlador_empresa',[auth.auth,path],empresaController.registro_controlador_empresa);
api.get('/listar_controladores_empresa',auth.auth,empresaController.listar_controladores_empresa);
api.put('/actualizar_controlador_empresa/:id',[auth.auth,path],empresaController.actualizar_controlador_empresa);
api.delete('/eliminar_controlador_empresa/:id',auth.auth,empresaController.eliminar_controlador_empresa);
api.get('/obtener_controlador_empresa/:id',auth.auth,empresaController.obtener_controlador_empresa);
//Finalizan rutas Controladores

//Rutas para Inversores
api.post('/registro_inversor_empresa',[auth.auth,path],empresaController.registro_inversor_empresa);
api.get('/listar_inversores_empresa',auth.auth,empresaController.listar_inversores_empresa);
api.put('/actualizar_inversor_empresa/:id',[auth.auth,path],empresaController.actualizar_inversor_empresa);
api.delete('/eliminar_inversor_empresa/:id',auth.auth,empresaController.eliminar_inversor_empresa);
api.get('/obtener_inversor_empresa/:id',auth.auth,empresaController.obtener_inversor_empresa);
//Finalizan rutas Inversores

module.exports = api;