'use-stric'
var express=require('express')
var auth=require('../middlewares/authenticate')
var configController=require('../controllers/ConfigController')
var multiparty=require('connect-multiparty')
var path =multiparty({uploadDir:'./uploads/productos'})


var api=express.Router()

//Categorias
api.get('/get_categorias_publico',configController.get_categorias_publico)
//api.post('/registro_categoria_admin',[auth.auth,path],configController.registro_categoria_admin);
//api.put('/actualizar_categoria_admin/:id',[auth.auth,path],configController.actualizar_categoria_admin);

//Banner
/*api.post('/registro_imagen_banner_admin/:id_banner',[auth.auth,path],configController.registro_imagen_banner_admin);
api.post('/crear_banner_admin',[auth.auth,path],configController.crear_banner_admin);
api.get('/obtener_banner_admin',[auth.auth],configController.obtener_banner_admin)
api.get('/obtener_banner_public',configController.obtener_banner_public)
api.put('/actualizar_item_banner_admin/:id_item/:id_banner',[auth.auth,path],configController.actualizar_item_banner_admin);
api.delete('/eliminar_item_banner_admin/:id_banner/:id_item',[auth.auth,path],configController.eliminar_item_banner_admin);*/
module.exports= api;