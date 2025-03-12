'use-stric'
var Admin = require('../models/Admin')
var bcrypt = require('bcrypt-nodejs')
var jwt = require('../helpers/jwt')
var Cliente = require('../models/Cliente')
var Producto = require('../models/Producto')
var Categoria = require('../models/Categoria')
//var Banner = require('../models/banner')
//var Etiqueta = require('../models/productoEtiqueta')
//var ProductoEtiqueta = require('../models/productoEtiquetaRelacion')
var path = require('path');
var fs = require('fs')
var mongoose = require('mongoose');

require('dotenv').config();// Para tarer rlas variables de entorno
const cloudinary = require('cloudinary').v2
cloudinary.config(process.env.CLOUDINARY_URL)

/*
const registro_categoria_admin = async function (req, res) {

  if (req.user) {

    try {
      let data = req.body;
      let categorias = await Categoria.find({ titulo: data.titulo });

      if (categorias.length == 0) {

        var img_path = req.files.portada.path;

        data.slug = data.titulo.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const { secure_url } = await cloudinary.uploader.upload(img_path, {
          folder: 'CuteMakeup'
        })

        data.portada = secure_url;
        let reg = await Categoria.create(data);
        res.status(201).send({
          message: 'Categoria Registrada correctamente',
          data: reg,
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
          status: 201
        });
      } else {
        res.status(409).send({
          message: 'El Titulo de Categoria ya existe',
          error: 'categoria Duplicada',
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

const actualizar_categoria_admin = async function (req, res) {
  if (req.user) {
      let id = req.params['id'];
      let data = req.body;
      if (req.files) {
          //SI HAY IMAGEN
          var img_path = req.files.portada.path;
          var name = img_path.split('\\');
          //Buscar la Imagen anterior 
          modelo = await Categoria.findById(id)//Traigo el modelo actual 
          const nombreArr = modelo.portada.split('/')
          const nombre = nombreArr[nombreArr.length - 1]
          const [public_id] = nombre.split('.')
          cloudinary.uploader.destroy(public_id) //Elimina la anterior
          //Fin buscar imagen anterior

          const { secure_url } = await cloudinary.uploader.upload(img_path)//Cargo nueva imagen
          data.slug = data.titulo.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
          let reg = await Categoria.findByIdAndUpdate({ _id: id }, {
              titulo: data.titulo,
              slug: data.slug,
              portada: secure_url,
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

          let reg = await Categoria.findByIdAndUpdate({ _id: id }, {
            titulo: data.titulo,
            slug: data.slug,
          });
          res.status(200).send({ data: reg });
      }
  } else {
      res.status(500).send({ message: 'NoAccess' });
  }
}
*/
const get_categorias_publico = async function (req, res) {
  var reg = await Categoria.find();
  res.status(200).send({ data: reg });
}
/*

const crear_banner_admin = async function (req, res) {
  if (req.user) {
    let data = req.body;
    //data.slug = data.titulo.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    var reg = await Banner.create(data);
    res.status(200).send({ data: reg });
  } else {
    res.status(500).send({ message: 'NoAccess' });
  }
}

const registro_imagen_banner_admin = async function (req, res) {
  if (req.user) {
    let data = req.body;
    let id_banner = req.params['id_banner'];
    try {
      var img_path = req.files.imagen.path;

      //data.slug = data.titulo.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

      const { secure_url } = await cloudinary.uploader.upload(img_path, {
        folder: 'CuteMakeup'
      })

      data.imagen = secure_url;

      let reg = await Banner.findByIdAndUpdate({ _id: id_banner }, {
        $push: {
          galeria: data
        }
      }, { useFindAndModify: false });

      res.status(200).send({ data: reg });


      //2 Busco si tienen Variedades

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
    res.status(401).send({ message: 'Sin acceso' });
  }

}




const obtener_banner_admin = async function (req, res) {
  var reg = await Banner.find();
  res.status(200).send({ data: reg });
}

const obtener_banner_public = async function (req, res) {
  var reg = await Banner.find();
  res.status(200).send({ data: reg });
}


const actualizar_item_banner_admin = async function (req, res) {

  if (req.user) {
    let data = req.body;
    let id_banner = req.params['id_banner'];
    let id_item = req.params['id_item'];
    try {
      //con imagen o sin imagen
      if (req.files) {
        //SI HAY IMAGEN
        var img_path = req.files.imagen.path;
        //var name = img_path.split('\\');


        //Buscar la Imagen anterior 
        const item = await Banner.findOne(
          { _id: id_banner, 'galeria._id': id_item },
          { 'galeria.$': 1 } // Proyección para obtener solo el item que coincide
        );
        const nombreArr = item.galeria[0].imagen.split('/')
        const nombre = nombreArr[nombreArr.length - 1]
        const [public_id] = nombre.split('.')
        cloudinary.uploader.destroy(public_id) //Elimina la anterior
        //Fin buscar imagen anterior

        const { secure_url } = await cloudinary.uploader.upload(img_path)//Cargo nueva imagen

        const registro = await Banner.findOneAndUpdate(
          {
            _id: id_banner,
            'galeria._id': id_item,
          },
          {
            $set: {
              'galeria.$[elem].titulo': data.titulo,
              'galeria.$[elem].subtitulo': data.subtitulo,
              'galeria.$[elem].tituloBoton': data.tituloBoton,
              'galeria.$[elem].enlace': data.enlace,
              'galeria.$[elem].imagen': secure_url
            }
          },
          {
            arrayFilters: [{ 'elem._id': id_item }], // Filtrar para actualizar solo el item correcto
            new: true // Opcional: Devuelve el documento actualizado
          }
        );

        res.status(200).send({ data: registro });


      } else {
        const registro = await Banner.findOneAndUpdate(
          {
            _id: id_banner,
            'galeria._id': id_item,
          },
          {
            $set: {
              'galeria.$[elem].titulo': data.titulo,
              'galeria.$[elem].subtitulo': data.subtitulo,
              'galeria.$[elem].tituloBoton': data.tituloBoton,
              'galeria.$[elem].enlace': data.enlace,
              //'galeria.$[elem].imagen': data.imagen
            }
          },
          {
            arrayFilters: [{ 'elem._id': id_item }], // Filtrar para actualizar solo el item correcto
            new: true // Opcional: Devuelve el documento actualizado
          }
        );

        res.status(200).send({ data: registro });
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
    res.status(401).send({ message: 'Sin Acceso' });
  }

}

const eliminar_item_banner_admin = async function (req, res) {

  if (req.user) {
    try {
      var id_banner = req.params['id_banner']
      var id_item = req.params['id_item']


//Eliminar Imagen Antigua
const item = await Banner.findOne(
  { _id: id_banner, 'galeria._id': id_item },
  { 'galeria.$': 1 } // Proyección para obtener solo el item que coincide
);
const nombreArr = item.galeria[0].imagen.split('/')
const nombre = nombreArr[nombreArr.length - 1]
const [public_id] = nombre.split('.')
cloudinary.uploader.destroy(public_id) //Elimina la anterior
//Finaliza Eliminar Imagen

      const bannerActualizado = await Banner.findByIdAndUpdate(
        { _id: id_banner },
        { $pull: { galeria: { _id: id_item } } },
        { new: true } // Esta opción devuelve el documento actualizado
      );
      if (!bannerActualizado) {
        return res.status(404).send({ message: 'banner no encontrado' });
      }

      res.status(200).send({
        message: 'Item eliminado correctamente',
        data: bannerActualizado
      });
    } catch (error) {
      res.status(500).send({ message: 'Error al eliminar el Item', error });
    }
  } else {
    res.status(500).send({ message: 'Usuario No Autorizado' });
  }
}

*/
module.exports = {
  get_categorias_publico,
  //registro_categoria_admin,
  //actualizar_categoria_admin,


  //Administracion del Banner
  //crear_banner_admin,
  //obtener_banner_admin,
  //registro_imagen_banner_admin,
  //obtener_banner_public,
  //actualizar_item_banner_admin,
  //eliminar_item_banner_admin,
}