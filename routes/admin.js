'use strict'

var express = require('express');
var AdminController = require('../controllers/AdminController');

var api = express.Router();
var auth = require('../middlewares/authenticate');
var multiparty = require('connect-multiparty');
var path = multiparty({uploadDir: './uploads/productos'});

api.post('/login_admin',AdminController.login_admin);

/*listado de categorias */
api.get('/get_categorias',auth.auth,AdminController.get_categorias);
/**Finaliza listado de categorias */

//Rutas paralos paneles
api.post('/registro_panel_admin',[auth.auth,path],AdminController.registro_panel_admin);
api.get('/listar_paneles_admin',auth.auth,AdminController.listar_paneles_admin);
api.put('/actualizar_panel_admin/:id',[auth.auth,path],AdminController.actualizar_panel_admin);
api.delete('/eliminar_panel_admin/:id',auth.auth,AdminController.eliminar_panel_admin);
api.get('/obtener_panel_admin/:id',auth.auth,AdminController.obtener_panel_admin);
//Finalizan rutas apra los paneles

//Rutas para Baterias
api.post('/registro_bateria_admin',[auth.auth,path],AdminController.registro_bateria_admin);
api.get('/listar_baterias_admin',auth.auth,AdminController.listar_baterias_admin);
api.put('/actualizar_bateria_admin/:id',[auth.auth,path],AdminController.actualizar_bateria_admin);
api.delete('/eliminar_bateria_admin/:id',auth.auth,AdminController.eliminar_bateria_admin);
api.get('/obtener_bateria_admin/:id',auth.auth,AdminController.obtener_bateria_admin);
//Finalizan rutas Baterias

//Rutas para Controladores
api.post('/registro_controlador_admin',[auth.auth,path],AdminController.registro_controlador_admin);
api.get('/listar_controladores_admin',auth.auth,AdminController.listar_controladores_admin);
api.put('/actualizar_controlador_admin/:id',[auth.auth,path],AdminController.actualizar_controlador_admin);
api.delete('/eliminar_controlador_admin/:id',auth.auth,AdminController.eliminar_controlador_admin);
api.get('/obtener_controlador_admin/:id',auth.auth,AdminController.obtener_controlador_admin);
//Finalizan rutas Controladores

//Rutas para Inversores
api.post('/registro_inversor_admin',[auth.auth,path],AdminController.registro_inversor_admin);
api.get('/listar_inversores_admin',auth.auth,AdminController.listar_inversores_admin);
api.put('/actualizar_inversor_admin/:id',[auth.auth,path],AdminController.actualizar_inversor_admin);
api.delete('/eliminar_inversor_admin/:id',auth.auth,AdminController.eliminar_inversor_admin);
api.get('/obtener_inversor_admin/:id',auth.auth,AdminController.obtener_inversor_admin);
//Finalizan rutas Inversores


//Rutas para las empresa
api.post('/registro_empresa_admin',[auth.auth,path],AdminController.registro_empresa_admin);
api.get('/listar_empresas_admin',auth.auth,AdminController.listar_empresas_admin);
api.put('/actualizar_empresa_admin/:id',[auth.auth,path],AdminController.actualizar_empresa_admin);
api.delete('/eliminar_empresa_admin/:id',auth.auth,AdminController.eliminar_empresa_admin);
api.get('/obtener_empresa_admin/:id',auth.auth,AdminController.obtener_empresa_admin);
//Finalizan rutas para las empresas

//Rutas para los productos
api.get('/obtener_producto_admin/:id',auth.auth,AdminController.obtener_producto_admin);
api.put('/actualizar_producto_admin/:id',[auth.auth,path],AdminController.actualizar_producto_admin);

api.put('/agregar_imagen_galeria_admin/:id',[auth.auth,path],AdminController.agregar_imagen_galeria_admin);
api.put('/eliminar_imagen_galeria_admin/:id',auth.auth,AdminController.eliminar_imagen_galeria_admin);
api.get('/verificar_token',auth.auth,AdminController.verificar_token);
api.get('/cambiar_vs_producto_admin/:id/:estado',auth.auth,AdminController.cambiar_vs_producto_admin);

/* Mensajes  
*/
/* Calculadora Solar  
*/
api.post('/registro_producto_calculadora_admin',auth.auth,AdminController.registro_producto_calculadora_admin)
api.post('/registro_controlador_calculadora_admin',auth.auth,AdminController.registro_controlador_calculadora_admin)
api.post('/registro_inversor_calculadora_admin',auth.auth,AdminController.registro_inversor_calculadora_admin)
api.post('/registro_panel_calculadora_admin',auth.auth,AdminController.registro_panel_calculadora_admin)

api.get('/listar_productos_calculadora_admin',auth.auth,AdminController.listar_productos_calculadora_admin);
api.get('/obtener_producto_calculadora_admin/:id/:tipo',auth.auth,AdminController.obtener_producto_calculadora_admin);

api.put('/actualizar_controlador_calculadora_admin/:id',[auth.auth,path],AdminController.actualizar_controlador_calculadora_admin);
api.put('/actualizar_panel_calculadora_admin/:id',[auth.auth,path],AdminController.actualizar_panel_calculadora_admin);
api.put('/actualizar_inversor_calculadora_admin/:id',[auth.auth,path],AdminController.actualizar_inversor_calculadora_admin);
api.put('/actualizar_bateria_calculadora_admin/:id',[auth.auth,path],AdminController.actualizar_bateria_calculadora_admin);

api.get('/consulta_Pvgis/:lat/:lon/:peakpower/:atterysize/:consumptionday/:cutoff',AdminController.consulta_Pvgis)
api.get('/consulta_hsp/:lat/:lon/:angle',AdminController.consulta_hsp)
api.get('/consultar_radiacion_diaria/:lat/:lon/:angle',AdminController.consultar_radiacion_diaria)
api.get('/consultar_radiacion_diaria_plano_Horizontal/:lat/:lon/:angle',AdminController.consultar_radiacion_diaria_plano_Horizontal)

//Rutas electrodomesticos
api.post('/registro_electrodomestico_admin',[auth.auth,path],AdminController.registro_electrodomestico_admin);
api.get('/listar_electrodomesticos_admin',auth.auth,AdminController.listar_electrodomesticos_admin);

//Categorias
api.get('/get_categoriasElectrodomesticos',auth.auth,AdminController.get_categoriasElectrodomesticos);
api.post('/registro_categoriaElectrodomestico_admin',[auth.auth,path],AdminController.registro_categoriaElectrodomestico_admin);
module.exports = api;