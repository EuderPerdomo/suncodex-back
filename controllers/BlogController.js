'use-stric'
var Blog = require('../models/blog')
var PostEtiquetaRelacion = require('../models/postEtiquetaRelacion')
var PostEtiqueta = require('../models/postEtiqueta')
var fs = require('fs')
var mongoose = require('mongoose');
//const { post } = require('../routes/blog')


require('dotenv').config();// Para tarer rlas variables de entorno
const cloudinary = require('cloudinary').v2
cloudinary.config(process.env.CLOUDINARY_URL)

const registro_blog_admin = async function (req, res) {
    if (req.user) {

        try {
            let data = req.body;
            let blogs = await Blog.find({ titulo: data.titulo });
            let arr_etiquetas = JSON.parse(data.etiquetas);

            if (blogs.length == 0) {

                var img_path = req.files.portada.path;
                //var name = img_path.split('\\');
                //var portada_name = name[2];

                data.slug = data.titulo.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                //const {secure_url}= await cloudinary.uploader.upload(img_path) //Opcional: .then(result=>console.log(result));

                const { secure_url } = await cloudinary.uploader.upload(img_path, {
                    folder: 'CuteMakeup'
                })

                data.portada = secure_url;
                let reg = await Blog.create(data);
                if (arr_etiquetas.length >= 1) {
                    for (var item of arr_etiquetas) {
                        await PostEtiquetaRelacion.create({
                            etiqueta: item.etiqueta,
                            blog: reg._id,
                        });
                    }
                }
                res.status(201).send({
                    message: 'Blog registrado correctamente',
                    data: reg,
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl,
                    status: 201
                });
            } else {
                res.status(409).send({
                    message: 'El Titulo de Blog ya existe',
                    error: 'Titulo Dupicado',
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl,
                    status: 409
                });
            }

        } catch (error) {
            res.status(500).send({
                message: 'Server Error',
                error: error.message,
                timestamp: new Date().toISOString(),
                path: req.originalUrl,
                status: 500
            });
        }

    } else {
        res.status(401).send({
            message: 'Not Authorized',
            error: error.message,
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
            status: 401
        });
    }
}


const listar_blogs_admin = async function (req, res) {
    if (req.user) {
        var blog = await Blog.find();
        res.status(200).send({ data: blog });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

//Lista todos los post 
const listar_posts_public = async function (req, res) {
    var filtro = req.params['filtro']
    var blog = await Blog.find({
        titulo: new RegExp(filtro, 'i'),
        estado: 'Publicado'
    }).populate('categoria').sort({ createdAt: -1 })
    res.status(200).send({ data: blog });
}

const obtener_blog_admin = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        try {
            var reg = await Blog.findById({ _id: id });
            res.status(200).send({ data: reg });
        } catch (error) {
            res.status(200).send({ data: undefined });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_blog_admin = async function (req, res) {

    if (req.user) {
        let id = req.params['id'];
        let data = req.body;
        if (req.files) {
            //SI HAY IMAGEN
            var img_path = req.files.portada.path;
            var name = img_path.split('\\');

            //Buscar la Imagen anterior 
            modelo = await Blog.findById(id)//Traigo el modelo actual 
            const nombreArr = modelo.portada.split('/')
            const nombre = nombreArr[nombreArr.length - 1]
            const [public_id] = nombre.split('.')
            cloudinary.uploader.destroy(public_id) //Elimina la anterior
            //Fin buscar imagen anterior

            const { secure_url } = await cloudinary.uploader.upload(img_path)//Cargo nueva imagen
            data.slug = data.titulo.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            let reg = await Blog.findByIdAndUpdate({ _id: id }, {
                titulo: data.titulo,
                descripcion: data.descripcion,
                categoria: data.categoria,
                contenido: data.contenido,
                portada: secure_url,
                slug: data.slug

            });

            fs.stat('./uploads/productos/' + reg.portada, function (err) {
                if (!err) {
                    fs.unlink('./uploads/productos/' + reg.portada, (err) => {
                        if (err) throw err;
                    });
                }
            })

            res.status(200).send({ data: reg });
        } else {
            //NO HAY IMAGEN
            data.slug = data.titulo.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            let reg = await Blog.findByIdAndUpdate({ _id: id }, {

                titulo: data.titulo,
                descripcion: data.descripcion,
                categoria: data.categoria,
                contenido: data.contenido,
                slug: data.slug


            });
            res.status(200).send({ data: reg });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

//Obtiene un solo Post
const obtener_post_public = async function (req, res) {
    console.log('Llego a aobtener post Public', req.params['slug'])
    var slug = req.params['slug'];
    try {
        var reg = await Blog.findOne({ slug: slug }).populate('categoria');
        //Ordenación d elos comentarios
        reg.comentarios.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.status(200).send({ data: reg });
    } catch (error) {
        res.status(200).send({ data: undefined });
    }
}

//Post recomendados o relacionados
const listar_post_recomendado_public = async function (req, res) {
    var filtro = req.params['categoria']
    var postId = req.params['postId'] //Descartar el post Actual
    var posts = await Blog.find({ categoria: filtro, _id: { $ne: postId } }).sort({ createdAt: -1 }).limit(2).populate('categoria');
    res.status(200).send({ data: posts });
}

//Etiquetas
//Globales
const crear_etiqueta_post_global_admin = async function (req, res) {
    if (req.user) {
        let data = req.body;
        data.slug = data.titulo.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        var reg = await PostEtiqueta.create(data);
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}
const listar_etiquetas_post_global_admin = async function (req, res) {
    if (req.user) {
        var reg = await PostEtiqueta.find();
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const eliminar_etiqueta_post_global_admin = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];//Id de la etiqueta a eliminar
        let deletiqueta = await PostEtiqueta.findByIdAndDelete(({ _id: id }));
        let relaciones = await PostEtiquetaRelacion.deleteMany(({ etiqueta: id }));
        res.status(200).send({ data: deletiqueta });

    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}
//Locales
const agregar_etiqueta_post_admin = async function (req, res) {
    if (req.user) {
        let data = req.body;
        try {
            // Verifica si la etiqueta ya está asociada con el Post
            let etiquetaExistente = await PostEtiquetaRelacion.findOne({
                blog: data.blog,
                etiqueta: data.etiqueta
            });

            if (etiquetaExistente) {
                // Si ya existe, envía un mensaje indicando que la etiqueta ya está agregada
                res.status(200).send({ message: 'La etiqueta ya está agregada a este Post.' });
            } else {
                // Si no existe, crea una nueva asociación
                var reg = await PostEtiquetaRelacion.create(data);
                res.status(201).send({ data: reg });
            }
        } catch (error) {

            res.status(500).send({ message: 'Error en el servidor', error });
        }
    } else {
        res.status(401).send({ message: 'Sin acceso' });
    }
};


const eliminar_etiqueta_post_admin = async function (req, res) {

    if (req.user) {
        const blog = req.params['id_post']
        const etiqueta = req.params['id_etiqueta']
        try {
            const resultado = await PostEtiquetaRelacion.deleteMany({ blog, etiqueta });
            res.status(200).send({ data: resultado });
        } catch (error) {

            res.status(500).send({
                message: 'Error al eliminar etiquetas',
                error: error.message,
            });
        }
    } else {
        res.status(401).send({ message: 'NoAccess' });
    }
};


const listar_etiquetas_post_admin = async function (req, res) {

    if (req.user) {
        var id = req.params['id'];
        var etiquetas = await PostEtiquetaRelacion.find({ blog: id }).populate('etiqueta');
        const etiquetasResult = etiquetas.map(rel => rel.etiqueta);

        res.status(200).send({ data: etiquetasResult });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const listar_etiquetas_post_guest = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        var etiquetas = await PostEtiquetaRelacion.find({ post: id }).populate('etiqueta');

        res.status(200).send({ data: etiquetas });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const enviar_comentario_post_guest = async function (req, res) {

    let data = req.body;
    let id_post = req.params['id'];

    try {

        //1 Busco Post
        let post = await Blog.findOne({
            _id: id_post,
        });

        let reg = await Blog.findByIdAndUpdate({ _id: id_post }, {
            $push: {
                comentarios: data
            }
        }, { useFindAndModify: false });
        res.status(200).send({ data: reg });

    } catch (error) {
        res.status(500).send({
            message: 'Server Error',
            error: error.message,
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
            status: 500
        });

    }
}

const obtener_comentarios_post_guest = async function (req, res) {
    const postId = req.params['postId'];
    if (mongoose.isValidObjectId(postId)) {
        var id = new mongoose.Types.ObjectId(postId);

        var comentarios = await Blog.findById(id, 'comentarios');

        const comentariosOrdenados = comentarios.comentarios.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).send({ data: comentariosOrdenados });

    } else {
        // ID invalido
        res.status(400).send({ message: 'ID inválido' });
    }

}


const listar_blogs_nuevos_public = async function (req, res) {
    let reg = await Blog.find({ estado: 'Publicado' }).sort({ createdAt: -1 }).limit(8);
    res.status(200).send({ data: reg });
}

const cambiar_visibilidad_post_admin = async function (req, res) {

    if (req.user) {
        let data = req.body

        let id = req.params['id']
        let estado = data.estado

        if (estado == 'Edicion') {

            let reg = await Blog.findByIdAndUpdate({ _id: id }, { estado: 'Publicado' })
            res.status(200).send({ data: reg })
        }
        if (estado == 'Publicado') {
            let reg = await Blog.findByIdAndUpdate({ _id: id }, { estado: 'Edicion' })
            res.status(200).send({ data: reg })
        }

    } else {
        res.status(500).send({ message: 'No Acces' })
    }

}

module.exports = {
    //Blog
    registro_blog_admin,
    listar_blogs_admin,
    obtener_blog_admin,
    actualizar_blog_admin,
    cambiar_visibilidad_post_admin,

    //Metodos Publicos
    listar_posts_public,
    obtener_post_public,
    listar_post_recomendado_public,
    listar_blogs_nuevos_public,


    //Etiquetas de Post
    //Globales
    crear_etiqueta_post_global_admin,
    listar_etiquetas_post_global_admin,
    eliminar_etiqueta_post_global_admin,

    //Locales
    agregar_etiqueta_post_admin,
    listar_etiquetas_post_admin,
    eliminar_etiqueta_post_admin,

    //Guest
    listar_etiquetas_post_guest,
    enviar_comentario_post_guest,
    obtener_comentarios_post_guest,

}