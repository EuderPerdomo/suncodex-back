'use-stric'
var express=require('express')
var auth=require('../middlewares/authenticate')

var multiparty=require('connect-multiparty')
var path =multiparty({uploadDir:'./uploads/productos'})


var blogController=require('../controllers/BlogController')
var api=express.Router()


//***************************  Metodos Privados    *********************** */
api.post('/registro_blog_admin',[auth.auth,path],blogController.registro_blog_admin);
api.put('/actualizar_post_admin/:id',[auth.auth,path],blogController.actualizar_blog_admin);
api.get('/listar_blog_admin',auth.auth,blogController.listar_blogs_admin);
api.get('/obtener_blog_admin/:id',auth.auth,blogController.obtener_blog_admin)
api.put('/cambiar_visibilidad_post_admin/:id',auth.auth,blogController.cambiar_visibilidad_post_admin)
//Etiquetas
//api.delete('/eliminar_etiqueta_post_admin/:id',auth.auth,blogController.eliminar_etiqueta_producto_admin);
api.post('/crear_etiqueta_post_global_admin',auth.auth,blogController.crear_etiqueta_post_global_admin);
api.get('/listar_etiquetas_post_global_admin',auth.auth,blogController.listar_etiquetas_post_global_admin);
api.delete('/eliminar_etiqueta_post_global_admin/:id',auth.auth,blogController.eliminar_etiqueta_post_global_admin);

api.get('/listar_etiquetas_post_admin/:id',auth.auth,blogController.listar_etiquetas_post_admin);
//api.delete('/eliminar_etiqueta_post_admin',auth.auth,blogController.eliminar_etiqueta_post_admin);
api.delete('/eliminar_etiqueta_post_admin/:id_post/:id_etiqueta',auth.auth,blogController.eliminar_etiqueta_post_admin);
api.post('/agregar_etiqueta_post_admin',auth.auth,blogController.agregar_etiqueta_post_admin);


//******************************************************** Metodos Publicos ***************************
api.get('/listar_posts_public/:filtro?',blogController.listar_posts_public)
api.get('/obtener_post_public/:slug',blogController.obtener_post_public)
api.get('/listar_post_recomendado_public/:categoria/:postId',blogController.listar_post_recomendado_public)
api.get('/listar_blog_nuevos_publico',blogController.listar_blogs_nuevos_public);

//Etiquetas
api.get('/listar_etiquetas_post_guest/:id',auth.auth,blogController.listar_etiquetas_post_guest);

//Comentar un post
api.post('/enviar_comentario_post_guest/:id',blogController.enviar_comentario_post_guest);
api.get('/obtener_comentarios_post_guest/:postId',blogController.obtener_comentarios_post_guest);
module.exports= api;