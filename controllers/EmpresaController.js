'use strict'
var fs = require('fs');
var handlebars = require('handlebars');
var ejs = require('ejs');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var path = require('path');
var mongoose = require('mongoose');

//Encriptar Contraseñas
var bcrypt = require('bcrypt-nodejs');

//Modelos
var Empresa=require('../models/Empresa')
var panel_solar=require('../models/panel_solar')
var bateria=require('../models/bateria')
var controlador=require('../models/controlador')
var inversor=require('../models/inversor')

require('dotenv').config();// Para tarer rlas variables de entorno
//Probando con cloudinari
const cloudinary = require('cloudinary').v2
cloudinary.config(process.env.CLOUDINARY_URL)
var mongoose = require('mongoose');
const Oficina = require('../models/Oficina');
const ClienteEmpresarial = require('../models/ClienteEmpresarial');

//Inician Empresas
const create_empresa_empresa = async function (req, res) {

    if (req.user) {
        let data = req.body;
        let empresas = await Empresa.find({ nit: data.nit});

        if (empresas.length == 0) {
            var img_path = req.files.logo.path;
            var name = img_path.split('\\');
            const { secure_url } = await cloudinary.uploader.upload(img_path)
            data.logo = secure_url;
            //data.ubicacion=JSON.parse(data.coordenadas)
            data.propietario=req.user.sub
            let reg = await Empresa.create(data);
            res.status(200).send({ data: reg });
        } else {
            res.status(200).send({ data: undefined, message: 'La empresa ya existe' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const listar_empresas_empresa = async function (req, res) {
    if (req.user) {
        id = new mongoose.Types.ObjectId(req.user.sub)
        //let query={ $and: [ { estado: true }, { propietario: id}]}
        let query={ estado: true}
        const empresas = await ClienteEmpresarial.findById(id).populate('empresas');

        
       // var empresas = await Empresa.find(query);
        res.status(200).send({ data: empresas });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_empresa_empresa = async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;
        if (req.files) {
            
            //SI HAY IMAGEN
            var img_path = req.files.logo.path;
            //var name = img_path.split('\\');

            //Buscar la Imagen anterior 
            modelo = await Empresa.findById(id)//Traigo el modelo actual 
            if(modelo.logo != undefined){               
                const nombreArr = modelo.logo.split('/')
                const nombre = nombreArr[nombreArr.length - 1]
                const [public_id] = nombre.split('.')
                cloudinary.uploader.destroy(public_id) //Elimina la anterior       
            }

            const { secure_url } = await cloudinary.uploader.upload(img_path)//Cargo nueva imagen
            
           
            //Fin buscar imagen anterior

            let reg = await Empresa.findByIdAndUpdate({ _id: id }, {
                nombre:data.nombre,
                telefono:data.telefono,
                email:data.email,
                latitud:data.latitud,
                longitud:data.longitud,
                direccion:data.direccion,
                descripcion:data.descripcion,
                nit:data.nit,
                logo: secure_url,
 
            });
            res.status(200).send({ data: reg });
        } else {
            //NO HAY IMAGEN
            let reg = await Empresa.findByIdAndUpdate({ _id: id }, {
                nombre:data.nombre,
                telefono:data.telefono,
                email:data.email,
                latitud:data.latitud,
                longitud:data.longitud,
                direccion:data.direccion,
                descripcion:data.descripcion,
                nit:data.nit,

            });
            res.status(200).send({ data: reg });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}


const eliminar_empresa_empresa = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];

        let reg = await Empresa.findByIdAndUpdate(id, { estado: false }, { new: true });
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_empresa_empresa = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        try {
            var reg = await Empresa.findById({ _id: id });
            res.status(200).send({ data: reg });
        } catch (error) {
            res.status(200).send({ data: undefined });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}
//Finalizan Empresas

//Inician Sucursales
const create_sucursal_empresa = async function (req, res) {
 
    if (req.user) {
        let data = req.body;
        //Primero Creo la Sucursal
            data.ubicacion=JSON.parse(data.coordenadas)
            let reg = await Oficina.create(data);

            //Creada la sucursal se la agrego a la Empresa
            id = new mongoose.Types.ObjectId(data.id_empresa) //Id de la empresa a la que pertenecera esa oficina
            let empresa = await Empresa.findByIdAndUpdate({ _id: id }, {
                $push: {
                    oficinas: reg._id //Agrego id de la sucursal a la empresa
                }
            }, { useFindAndModify: false });
            res.status(200).send({ data: reg });
        
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const listar_sucursales_empresa = async function (req, res) {
    if (req.user) {
        var id = req.params['id']; //Id de la empresa a la que le estoy buscando sus sucursales

        id = new mongoose.Types.ObjectId(id)

        const oficinas = await Empresa.aggregate([
            { 
                $match: { _id:id } 
            },
            { $unwind: '$oficinas' },
            { $lookup: { from: 'oficinas', localField: 'oficinas', foreignField: '_id', as: 'oficina_info' } },
            { $unwind: '$oficina_info' },
            { $match: { 'oficina_info.estado': true } },

            {
                $project: {
                    _id: "$oficina_info._id",
                    nombre: "$oficina_info.nombre",
                    direccion: "$oficina_info.direccion",
                    email:"$oficina_info.email",
                    telefono:"$oficina_info.telefono",
                    // Agrega cualquier otro campo que desees mostrar
                }
            }
        ]);

        //const oficinas = await Empresa.findById(id).populate('oficinas');

        res.status(200).send({ data: oficinas });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_sucursal_empresa = async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;
        data.ubicacion=data.coordenadas
            let reg = await Oficina.findByIdAndUpdate({ _id: id }, {
                nombre: data.nombre,
                ubicacion: data.ubicacion,
                direccion: data.direccion,
                descripcion: data.descripcion,
                telefono: data.telefono,
                email: data.email,

            });
            res.status(200).send({ data: reg });
        
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}


const eliminar_sucursal_empresa = async function (req, res) {
    if (req.user) {
        var id = new mongoose.Types.ObjectId(req.params['id'])
        
        let reg = await Oficina.findByIdAndUpdate(id, { estado: false }, { new: true });
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_sucursal_empresa = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        try {
            var reg = await Oficina.findById({ _id: id });
            res.status(200).send({ data: reg });
        } catch (error) {
            res.status(200).send({ data: undefined });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

//Finalizan Sucursales u Oficinas

//Inicia actualizacion  de equipos en sucursales
const actualizar_inversor_sucursal_empresa= async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;
        try {

            const id_inversores = data.map(inversor => inversor.id);
        const reg = await Oficina.findByIdAndUpdate(
            id,
            { inversores: id_inversores },
            { new: true, useFindAndModify: false }
          );
          res.status(200).send({ data: reg });
        } catch (error) {
            console.error('Error al guardar los IDs:', error);
        } 
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}


const actualizar_controlador_sucursal_empresa= async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;
  
        try {
            const id_controladores = data.map(controlador => controlador.id);


        const reg = await Oficina.findByIdAndUpdate(
            id,
            { controladores: id_controladores },
            { new: true, useFindAndModify: false }
          );
          res.status(200).send({ data: reg });
        } catch (error) {
            console.error('Error al guardar los IDs:', error);
        } 
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_panel_sucursal_empresa= async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;
        try {

            const id_paneles = data.map(panel => panel.id);


        const reg = await Oficina.findByIdAndUpdate(
            id,
            { paneles: id_paneles },
            { new: true, useFindAndModify: false }
          );
          res.status(200).send({ data: reg });
        } catch (error) {
            console.error('Error al guardar los IDs:', error);
        } 
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_bateria_sucursal_empresa= async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;
        try {

            const id_baterias = data.map(bateria => bateria.id);


        const reg = await Oficina.findByIdAndUpdate(
            id,
            { baterias: id_baterias },
            { new: true, useFindAndModify: false }
          );
          res.status(200).send({ data: reg });
        } catch (error) {
            console.error('Error al guardar los IDs:', error);
        } 
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}
//Finaliza actualizar equipos en sucursales

//Inician los paneles solares ******************************************
const registro_panel_empresa = async function (req, res) {
    if (req.user) {
        let data = req.body;

        let productos = await panel_solar.find({ modelo: data.modelo });
        if (productos.length == 0) {
            var img_path = req.files.portada.path;
            var name = img_path.split('\\');
            // var portada_name = name[2];

            const { secure_url } = await cloudinary.uploader.upload(img_path)

            data.portada = secure_url;
            data.propietario=req.user.sub
            let reg = await panel_solar.create(data);
            res.status(200).send({ data: reg });
        } else {
            res.status(200).send({ data: undefined, message: 'El Modelo del panel ya existe' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}


const listar_paneles_empresa = async function (req, res) {
    if (req.user) {
        id = new mongoose.Types.ObjectId(req.user.sub)
        let query={ $and: [ { estado: true }, { propietario: id}]}
        var paneles = await panel_solar.find(query);
        res.status(200).send({ data: paneles });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_panel_empresa = async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;
        if (req.files) {
            //SI HAY IMAGEN
            var img_path = req.files.portada.path;
            var name = img_path.split('\\');

            //Buscar la Imagen anterior 
            modelo = await panel_solar.findById(id)//Traigo el modelo actual 
            const nombreArr = modelo.portada.split('/')
            const nombre = nombreArr[nombreArr.length - 1]
            const [public_id] = nombre.split('.')
            cloudinary.uploader.destroy(public_id) //Elimina la anterior
            //Fin buscar imagen anterior

            const { secure_url } = await cloudinary.uploader.upload(img_path)//Cargo nueva imagen

            let reg = await panel_solar.findByIdAndUpdate({ _id: id }, {
                modelo: data.modelo,
                potencia: data.potencia,
                eficiencia: data.eficiencia,
                voc: data.voc,
                peso: data.peso,
                isc: data.isc,
                descripcion: data.descripcion,
                vmpp: data.vmpp,
                impp: data.impp,
                noct: data.noct,
                tc_of_isc: data.tc_of_isc,
                tc_of_voc: data.tc_of_voc,
                tc_of_pmax: data.tc_of_pmax,
                portada: secure_url,
                tension: data.tension
            });
 
            res.status(200).send({ data: reg });
        } else {
            //NO HAY IMAGEN
            let reg = await panel_solar.findByIdAndUpdate({ _id: id }, {
                modelo: data.modelo,
                potencia: data.potencia,
                eficiencia: data.eficiencia,
                voc: data.voc,
                peso: data.peso,
                isc: data.isc,
                descripcion: data.descripcion,
                vmpp: data.vmpp,
                impp: data.impp,
                noct: data.noct,
                tc_of_isc: data.tc_of_isc,
                tc_of_voc: data.tc_of_voc,
                tc_of_pmax: data.tc_of_pmax,
                tension: data.tension

            });
            res.status(200).send({ data: reg });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}


const eliminar_panel_empresa = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        let reg = await panel_solar.findByIdAndUpdate(id, { estado: false }, { new: true });
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_panel_empresa = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        try {
            var reg = await panel_solar.findById({ _id: id });
            res.status(200).send({ data: reg });
        } catch (error) {
            res.status(200).send({ data: undefined });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}
//Finalizan los paneles soalres

//Inician Baterias
const registro_bateria_empresa = async function (req, res) {
    if (req.user) {
        let data = req.body;
        let productos = await bateria.find({ modelo: data.modelo });
        if (productos.length == 0) {
            var img_path = req.files.portada.path;
            var name = img_path.split('\\');
            // var portada_name = name[2];

            const { secure_url } = await cloudinary.uploader.upload(img_path)
            data.propietario=req.user.sub
            data.portada = secure_url;
            let reg = await bateria.create(data);
            res.status(200).send({ data: reg });
        } else {
            res.status(200).send({ data: undefined, message: 'El Modelo de bateria ya existe' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const listar_baterias_empresa = async function (req, res) {
    if (req.user) {
        id = new mongoose.Types.ObjectId(req.user.sub)
        let query={ $and: [ { estado: true }, { propietario: id}]}
        var baterias = await bateria.find(query);
        res.status(200).send({ data: baterias });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_bateria_empresa = async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;
        if (req.files) {
            //SI HAY IMAGEN
            var img_path = req.files.portada.path;
            var name = img_path.split('\\');

            //Buscar la Imagen anterior 
            modelo = await bateria.findById(id)//Traigo el modelo actual 
            const nombreArr = modelo.portada.split('/')
            const nombre = nombreArr[nombreArr.length - 1]
            const [public_id] = nombre.split('.')
            cloudinary.uploader.destroy(public_id) //Elimina la anterior
            //Fin buscar imagen anterior

            const { secure_url } = await cloudinary.uploader.upload(img_path)//Cargo nueva imagen

            let reg = await bateria.findByIdAndUpdate({ _id: id }, {
                modelo: data.modelo,
                voltaje: data.voltaje,
                amperaje: data.amperaje,
                portada: secure_url,
                descripcion: data.descripcion,
                peso: data.peso,
                tecnologia: data.tecnologia,           
            });

            res.status(200).send({ data: reg });
        } else {
            //NO HAY IMAGEN
            let reg = await bateria.findByIdAndUpdate({ _id: id }, {
                modelo: data.modelo,
                voltaje: data.voltaje,
                amperaje: data.amperaje,
                descripcion: data.descripcion,
                peso: data.peso,
                tecnologia: data.tecnologia,

            });
            res.status(200).send({ data: reg });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}


const eliminar_bateria_empresa = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        let reg = await bateria.findByIdAndUpdate(id, { estado: false }, { new: true });
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_bateria_empresa = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        try {
            var reg = await bateria.findById({ _id: id });
            res.status(200).send({ data: reg });
        } catch (error) {
            res.status(200).send({ data: undefined });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}
//Finalizan Baterias


//Inician Controladores
const registro_controlador_empresa = async function (req, res) {
 
    if (req.user) {
        let data = req.body;
        let productos = await controlador.find({ modelo: data.modelo });
        if (productos.length == 0) {
            var img_path = req.files.portada.path;
            var name = img_path.split('\\');
            // var portada_name = name[2];
            const { secure_url } = await cloudinary.uploader.upload(img_path)
            data.propietario=req.user.sub
            data.portada = secure_url;
            data.input=JSON.parse(data.input)
            let reg = await controlador.create(data);
            res.status(200).send({ data: reg });
        } else {
            res.status(200).send({ data: undefined, message: 'El Modelo de controlador ya existe' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const listar_controladores_empresa = async function (req, res) {
    if (req.user) {
        id = new mongoose.Types.ObjectId(req.user.sub)
        let query={ $and: [ { estado: true }, { propietario: id}]}
        var controladores = await controlador.find(query);
        res.status(200).send({ data: controladores });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_controlador_empresa = async function (req, res) {
    
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;
        if (req.files) {
            //SI HAY IMAGEN
            var img_path = req.files.portada.path;
            var name = img_path.split('\\');

            //Buscar la Imagen anterior 
            modelo = await controlador.findById(id)//Traigo el modelo actual 
            const nombreArr = modelo.portada.split('/')
            const nombre = nombreArr[nombreArr.length - 1]
            const [public_id] = nombre.split('.')
            cloudinary.uploader.destroy(public_id) //Elimina la anterior
            //Fin buscar imagen anterior

            const { secure_url } = await cloudinary.uploader.upload(img_path)//Cargo nueva imagen

            let reg = await controlador.findByIdAndUpdate({ _id: id }, {
                modelo: data.modelo,
                input: JSON.parse(data.input),
                amperaje: data.amperaje,
                portada: secure_url,
                descripcion: data.descripcion,
                peso: data.peso,
                tecnologia: data.tecnologia,
                
            });

            res.status(200).send({ data: reg });
        } else {
            //NO HAY IMAGEN
            let reg = await controlador.findByIdAndUpdate({ _id: id }, {
                modelo: data.modelo,
                input: data.input,
                amperaje: data.amperaje,
                descripcion: data.descripcion,
                peso: data.peso,
                tecnologia: data.tecnologia,

            });
            res.status(200).send({ data: reg });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}


const eliminar_controlador_empresa = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        let reg = await controlador.findByIdAndUpdate(id, { estado: false }, { new: true });
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_controlador_empresa = async function (req, res) {

    if (req.user) {
        var id = req.params['id'];
        try {
            var reg = await controlador.findById({ _id: id });
            res.status(200).send({ data: reg });
        } catch (error) {
            res.status(200).send({ data: undefined });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}
//Finalizan Controladores


//Inician Inversores
const registro_inversor_empresa = async function (req, res) {
    if (req.user) {
        let data = req.body;
        let productos = await inversor.find({ modelo: data.modelo });
        if (productos.length == 0) {
            var img_path = req.files.portada.path;
            var name = img_path.split('\\');
            // var portada_name = name[2];

            const { secure_url } = await cloudinary.uploader.upload(img_path)

            data.propietario=req.user.sub
            data.portada = secure_url;
            let reg = await inversor.create(data);
            res.status(200).send({ data: reg });
        } else {
            res.status(200).send({ data: undefined, message: 'El Modelo de inversor ya existe' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const listar_inversores_empresa = async function (req, res) {
    if (req.user) {

        id = new mongoose.Types.ObjectId(req.user.sub)
        let query={ $and: [ { estado: true }, { propietario: id}]}

        var inversores = await inversor.find(query);
        res.status(200).send({ data: inversores });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_inversor_empresa = async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;
        if (req.files) {
            //SI HAY IMAGEN
            var img_path = req.files.portada.path;
            var name = img_path.split('\\');

            //Buscar la Imagen anterior 
            modelo = await inversor.findById(id)//Traigo el modelo actual 
            const nombreArr = modelo.portada.split('/')
            const nombre = nombreArr[nombreArr.length - 1]
            const [public_id] = nombre.split('.')
            cloudinary.uploader.destroy(public_id) //Elimina la anterior
            //Fin buscar imagen anterior

            const { secure_url } = await cloudinary.uploader.upload(img_path)//Cargo nueva imagen

            let reg = await inversor.findByIdAndUpdate({ _id: id }, {
                modelo: data.modelo,
                voltaje: data.voltaje,
                amperaje: data.amperaje,
                portada: secure_url,
                descripcion: data.descripcion,
                peso: data.peso,
                tecnologia: data.tecnologia,
                
            });

            res.status(200).send({ data: reg });
        } else {
            //NO HAY IMAGEN
            let reg = await inversor.findByIdAndUpdate({ _id: id }, {
                modelo: data.modelo,
                voltaje: data.voltaje,
                amperaje: data.amperaje,
                descripcion: data.descripcion,
                peso: data.peso,
                tecnologia: data.tecnologia,

            });
            res.status(200).send({ data: reg });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}


const eliminar_inversor_empresa = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        let reg = await inversor.findByIdAndUpdate(id, { estado: false }, { new: true });
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_inversor_empresa = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        try {
            var reg = await inversor.findById({ _id: id });
            res.status(200).send({ data: reg });
        } catch (error) {
            res.status(200).send({ data: undefined });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}
//Finalizan Inversores





module.exports = {
    //Empresas-Empresario
    create_empresa_empresa,
    listar_empresas_empresa,
    eliminar_empresa_empresa,
    actualizar_empresa_empresa,
    obtener_empresa_empresa,

    //Sucursales U oficinas
    create_sucursal_empresa,
    listar_sucursales_empresa,
    eliminar_sucursal_empresa,
    actualizar_sucursal_empresa,
    obtener_sucursal_empresa,

    //ctualizar equipos en Sucursales
    actualizar_inversor_sucursal_empresa,
    actualizar_controlador_sucursal_empresa,
    actualizar_bateria_sucursal_empresa,
    actualizar_panel_sucursal_empresa,

    //Paneles solares
    registro_panel_empresa,
    listar_paneles_empresa,
    eliminar_panel_empresa,
    actualizar_panel_empresa,
    obtener_panel_empresa,

    //Baterias
    registro_bateria_empresa,
    listar_baterias_empresa,
    actualizar_bateria_empresa,
    eliminar_bateria_empresa,
    obtener_bateria_empresa,

    //Controladores
    registro_controlador_empresa,
    listar_controladores_empresa,
    actualizar_controlador_empresa,
    eliminar_controlador_empresa,
    obtener_controlador_empresa,

    
    //Inversores
    registro_inversor_empresa,
    listar_inversores_empresa,
    actualizar_inversor_empresa,
    eliminar_inversor_empresa,
    obtener_inversor_empresa,
}