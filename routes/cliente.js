'use strict'

var express = require('express');
var clienteController = require('../controllers/ClienteController')
//var clienteController = require('../controllers/ClienteController');

var api = express.Router();
var auth = require('../middlewares/authenticate');
var multiparty = require('connect-multiparty');
var path = multiparty({uploadDir: './uploads/productos'});

//Registro de Clientes Guest
api.post('/registro_cliente_guest',clienteController.registro_cliente_guest);
api.post('/registro_instalador_guest',clienteController.registro_instalador_guest);
api.post('/registro_cliente_empresa_guest',clienteController.registro_cliente_empresa_guest);

api.post('/login_guest',clienteController.login_guest);
//Perfil Usuario
api.get('/obtener_usuario_usuario',auth.auth,clienteController.obtener_usuario_usuario);



api.post('/registro_cliente_tienda',clienteController.registro_cliente_tienda);
api.get('/listar_clientes_tienda',auth.auth,clienteController.listar_clientes_tienda);

//Creacion y edicion del cliente
api.post('/registro_cliente_admin',auth.auth,clienteController.registro_cliente);
api.get('/obtener_cliente_admin/:id',auth.auth,clienteController.obtener_cliente_admin);
api.put('/actualizar_cliente_admin/:id',auth.auth,clienteController.actualizar_cliente_admin);
api.delete('/eliminar_cliente_admin/:id',auth.auth,clienteController.eliminar_cliente_admin);
//Finaliza creacion edicion de clientes

//CRUD inversores
api.post('/registro_inversor_usuario',[auth.auth,path],clienteController.registro_inversor_usuario);
api.get('/listar_inversores_usuario',auth.auth,clienteController.listar_inversores_usuario);
api.put('/actualizar_inversor_usuario/:id',[auth.auth,path],clienteController.actualizar_inversor_usuario);
api.delete('/eliminar_inversor_usuario/:id',auth.auth,clienteController.eliminar_inversor_usuario);
api.get('/obtener_inversor_usuario/:id',auth.auth,clienteController.obtener_inversor_usuario);
//Finalizan rutas Inversores

//CRUD Calculos Solares Cliente
api.post('/registro_calculo_usuario',[auth.auth,path],clienteController.registro_calculo_usuario);
api.get('/listar_calculos_usuario',auth.auth,clienteController.listar_calculos_usuario);
api.put('/actualizar_calculo_usuario/:id',[auth.auth,path],clienteController.actualizar_calculo_usuario);
//api.delete('/eliminar_calculos_usuario/:id',auth.auth,clienteController.eliminar_calculo_usuario);
api.get('/obtener_calculo_cliente/:id',auth.auth,clienteController.obtener_calculo_cliente);
api.get('/listar_inversores_usuario_ubicacion/:latitud/:longitud/:radio/:filtro',auth.auth,clienteController.listar_inversores_usuario_ubicacion);
api.get('/listar_controladores_usuario_ubicacion/:latitud/:longitud/:radio/:filtro',auth.auth,clienteController.listar_cotroladores_usuario_ubicacion);
api.get('/listar_paneles_usuario_ubicacion/:latitud/:longitud/:radio/:filtro',auth.auth,clienteController.listar_paneles_usuario_ubicacion);
api.get('/listar_baterias_usuario_ubicacion/:latitud/:longitud/:radio/:filtro',auth.auth,clienteController.listar_baterias_usuario_ubicacion);
//api.get('/obtener_producto_calculadora_admin/:id/:tipo',auth.auth,AdminController.obtener_producto_calculadora_admin);

//Consulta pvgis
api.get('/consulta_rendimiento_Pvgis/:lat/:lon/:peakpower/:atterysize/:consumptionday/:cutoff',clienteController.consulta_rendimiento_Pvgis)


//Notificaciones
api.get('/listar_notificaciones_usuario',auth.auth,clienteController.listar_notificaciones_usuario);

//Rutas cuando el Usuario no Autenticado
api.get('/listar_paneles_usuario_guest/:latitud/:longitud/:radio/:filtro',clienteController.listar_paneles_usuario_guest);
api.get('/listar_baterias_usuario_guest/:latitud/:longitud/:radio/:filtro',clienteController.listar_baterias_usuario_guest);
api.get('/listar_controladores_usuario_guest/:latitud/:longitud/:radio/:filtro',clienteController.listar_controladores_usuario_guest);
api.get('/listar_inversores_usuario_guest/:latitud/:longitud/:radio/:filtro',clienteController.listar_inversores_usuario_guest);
//Finalizan rutas Calculos Solares

//Empresas Favoritas
api.get('/listar_empresas_usuario',auth.auth,clienteController.listar_empresas_usuario);
api.get('/anadirEmpresaFavorita_usuario/:id',auth.auth,clienteController.anadirEmpresaFavorita_usuario);
api.delete('/eliminar_empresa_favorita_usuario/:id',auth.auth,clienteController.eliminar_empresa_favorita_usuario);


//Listar electrodomesticos
api.get('/listar_electrodomesticos_guest',clienteController.listar_electrodomesticos_guest);

//Consultas desde nuevo calculo, calculadora
api.get('/listar_baterias',clienteController.listar_baterias)
module.exports = api;