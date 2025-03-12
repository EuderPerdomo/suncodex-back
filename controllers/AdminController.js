'use strict'
var Admin = require('../models/Admin');

var Categoria = require('../models/Categoria');

var Inventario = require('../models/Inventario');
var Producto = require('../models/Producto');
var Empresa = require('../models/Empresa')

var Contacto = require('../models/Contacto')
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../helpers/jwt');

var fs = require('fs');
var handlebars = require('handlebars');
var ejs = require('ejs');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var path = require('path');
const bateria = require('../models/bateria');
const controlador = require('../models/controlador');
const panel_solar = require('../models/panel_solar');
const inversor = require('../models/inversor');
const { response } = require('express');
const https = require("https");
const Electrodomestico = require('../models/Electrodomestico');
const CategoriaElectrodomestico = require('../models/CategoriaElectrodomestico');


require('dotenv').config();// Para tarer rlas variables de entorno
//Probando con cloudinari
const cloudinary = require('cloudinary').v2
cloudinary.config(process.env.CLOUDINARY_URL)

const login_admin = async function (req, res) {
    var data = req.body;
    var admin_arr = [];

    admin_arr = await Admin.find({ email: data.email });

    if (admin_arr.length == 0) {
        res.status(200).send({ message: 'El correo electrónico no existe', data: undefined });
    } else {
        //LOGIN
        let user = admin_arr[0];

        bcrypt.compare(data.password, user.password, async function (error, check) {
            if (check) {
                res.status(200).send({
                    data: user,
                    token: jwt.createToken(user)
                });
            } else {
                res.status(200).send({ message: 'Las credenciales no coinciden', data: undefined });
            }
        });

    }
}



/*Metodo que lista categorias */
const get_categorias = async function (req, res) {
    if (req.user) {
        var reg = await Categoria.find();
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}
/**Finaliza  metodo que lista categorias */

const listar_productos_admin = async function (req, res) {
    if (req.user) {
        var productos = await Producto.find();
        res.status(200).send({ data: productos });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_producto_admin = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];

        try {
            var reg = await Producto.findById({ _id: id });
            res.status(200).send({ data: reg });
        } catch (error) {
            res.status(200).send({ data: undefined });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}


const obtener_portada = async function (req, res) {
    var img = req.params['img'];
    fs.stat('./uploads/productos/' + img, function (err) {
        if (!err) {
            let path_img = './uploads/productos/' + img;
            res.status(200).sendFile(path.resolve(path_img));
        } else {
            let path_img = './uploads/default.jpg';
            res.status(200).sendFile(path.resolve(path_img));
        }
    })
}

const actualizar_producto_admin = async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;
        if (req.files) {
            //SI HAY IMAGEN
            var img_path = req.files.portada.path;
            var name = img_path.split('\\');
            var portada_name = name[2];

            //Buscar la Imagen anterior 
            modelo = await Producto.findById(id)//Traigo el modelo actual 
            const nombreArr = modelo.portada.split('/')
            const nombre = nombreArr[nombreArr.length - 1]
            const [public_id] = nombre.split('.')
            cloudinary.uploader.destroy(public_id) //Elimina la anterior
            //Fin buscar imagen anterior

            const { secure_url } = await cloudinary.uploader.upload(img_path)//Cargo nueva imagen

            let reg = await Producto.findByIdAndUpdate({ _id: id }, {
                titulo: data.titulo,
                stock: data.stock,
                precio_antes_soles: data.precio_antes_soles,
                precio_antes_dolares: data.precio_antes_dolares,
                precio: data.precio,
                precio_dolar: data.precio_dolar,
                peso: data.peso,
                sku: data.sku,
                categoria: data.categoria,
                visibilidad: data.visibilidad,
                descripcion: data.descripcion,
                contenido: data.contenido,
                //portada: portada_name
                portada: secure_url,
                tipo: data.tipo,
                usar_en_calculadora: data.usar_en_calculadora
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
            let reg = await Producto.findByIdAndUpdate({ _id: id }, {
                titulo: data.titulo,
                stock: data.stock,
                precio_antes_soles: data.precio_antes_soles,
                precio_antes_dolares: data.precio_antes_dolares,
                precio: data.precio,
                precio_dolar: data.precio_dolar,
                peso: data.peso,
                sku: data.sku,
                categoria: data.categoria,
                visibilidad: data.visibilidad,
                descripcion: data.descripcion,
                contenido: data.contenido,
                tipo: data.tipo,
                usar_en_calculadora: data.usar_en_calculadora

            });
            res.status(200).send({ data: reg });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const agregar_imagen_galeria_admin = async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;

        var img_path = req.files.imagen.path;
        var name = img_path.split('\\');
        var imagen_name = name[2];

        const { secure_url } = await cloudinary.uploader.upload(img_path)

        let reg = await Producto.findByIdAndUpdate({ _id: id }, {
            $push: {
                galeria: {
                    //imagen: imagen_name,
                    imagen: secure_url,
                    _id: data._id
                }
            }
        }, { useFindAndModify: false });

        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const eliminar_imagen_galeria_admin = async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;

        //Buscar la Imagen anterior 
        //NOTA: debo buscarla en la agleria
        modelo = await Producto.findById(id)//Traigo el modelo actual 
        const nombreArr = modelo.portada.split('/')
        const nombre = nombreArr[nombreArr.length - 1]
        const [public_id] = nombre.split('.')
        let reg = await cloudinary.uploader.destroy(public_id) //Elimina la anterior
        //Fin buscar imagen anterior

        let test = await Producto.findByIdAndUpdate({ _id: id }, { $pull: { galeria: { _id: data._id } } });



        //let reg =await Producto.findByIdAndUpdate({_id:id},{$pull: {galeria: {_id:data._id}}});
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const verificar_token = async function (req, res) {

    if (req.user) {
        res.status(200).send({ data: req.user });
    } else {

        res.status(500).send({ message: 'NoAccess' });
    }
}

const cambiar_vs_producto_admin = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        var estado = req.params['estado'];

        try {
            if (estado == 'Edicion') {
                await Producto.findByIdAndUpdate({ _id: id }, { estado: 'Publicado' });
                res.status(200).send({ data: true });
            } else if (estado == 'Publicado') {
                await Producto.findByIdAndUpdate({ _id: id }, { estado: Edicion });
                res.status(200).send({ data: true });
            }
        } catch (error) {
            res.status(200).send({ data: undefined });
        }

    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}















/* Inician Mensajes*/


const obtener_mensajes_admin = async function (req, res) {
    if (req.user) {
        let data = req.body
        let reg = await Contacto.find().sort({ createdAt: -1 })
        res.status(200).send({ data: reg })
    } else {
        res.status(500).send({ message: 'No Acces' })
    }
}

const cerrar_mensaje_admin = async function (req, res) {
    if (req.user) {
        let data = req.body
        let id = req.params['id']
        let reg = await Contacto.findByIdAndUpdate({ _id: id }, { estado: 'Cerrado' })
        res.status(200).send({ data: reg })
    } else {
        res.status(500).send({ message: 'No Acces' })
    }
}


/*Finaliza mensajes */


/**Inicia Calculadora Solar */

const registro_producto_calculadora_admin = async function (req, res) {
    if (req.user) {
        let data = req.body;
        var reg = await bateria.create(data);
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}


const registro_controlador_calculadora_admin = async function (req, res) {

    if (req.user) {
        let data = req.body;
        var reg = await controlador.create(data);
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const registro_panel_calculadora_admin = async function (req, res) {
    if (req.user) {
        let data = req.body;

        var buscar = await panel_solar.find({ producto: data.producto })
        if (buscar == undefined) {
            var reg = await panel_solar.create(data);
            res.status(200).send({ data: reg });
        } else {

            res.status(500).send({ message: 'Ya se registraron parametros para este panel solar' });
        }


    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const registro_inversor_calculadora_admin = async function (req, res) {
    if (req.user) {
        let data = req.body;
        var reg = await inversor.create(data);
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}





//listar_productos_calculadora_admin
const listar_productos_calculadora_admin = async function (req, res) {
    if (req.user) {
        var productos = await Producto.find({ "usar_en_calculadora": "Si" });
        res.status(200).send({ data: productos });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}


const obtener_producto_calculadora_admin = async function (req, res) {
    var id = req.params['id'];
    if (req.user) {
        if (req.params.tipo == 'controlador') {
            try {
                var reg = await controlador.find({ producto: id }).populate('producto');
                res.status(200).send({ data: reg });
            } catch (error) {
                res.status(200).send({ data: undefined });
            }

        }

        if (req.params.tipo == 'panel_solar') {

            try {
                var reg = await panel_solar.find({ producto: id }).populate('producto');

                res.status(200).send({ data: reg });
            } catch (error) {
                res.status(200).send({ data: undefined });
            }

        }

        if (req.params.tipo == 'inversor') {

            try {
                var reg = await inversor.find({ producto: id }).populate('producto');
                res.status(200).send({ data: reg });
            } catch (error) {
                res.status(200).send({ data: undefined });
            }
        }

        if (req.params.tipo == 'bateria') {

            try {
                var reg = await bateria.find({ producto: id }).populate('producto');
                res.status(200).send({ data: reg });
            } catch (error) {
                res.status(200).send({ data: undefined });
            }
        }

    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_controlador_calculadora_admin = async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;
        if (req.files) {
        } else {
            //NO HAY IMAGEN
            let reg = await controlador.findByIdAndUpdate({ _id: id }, {
                producto: data.producto,
                tipo: data.tipo,
                amperaje: data.amperaje,
                max_potencia_paneles: data.max_potencia_paneles

            });
            res.status(200).send({ data: reg });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_panel_calculadora_admin = async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;

        let reg = await panel_solar.findByIdAndUpdate({ _id: id }, {
            //producto: data.producto,
            vmp: data.vmp,
            imp: data.imp,
            voc: data.voc,
            isc: data.isc,
            eficiencia: data.eficiencia,
            tension: data.tension,
            potencia: data.potencia

        });
        res.status(200).send({ data: reg });

    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_inversor_calculadora_admin = async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;

        let reg = await inversor.findByIdAndUpdate({ _id: id }, {
            //producto: data.producto,

            salida_ac: data.salida_ac,
            entrada_dc: data.entrada_dc,
            potencia: data.potencia
        });
        res.status(200).send({ data: reg });

    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_bateria_calculadora_admin = async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;

        let reg = await bateria.findByIdAndUpdate({ _id: id }, {
            //producto: data.producto,

            voltaje: data.voltaje,
            amperaje: data.amperaje,
            tecnologia: data.tecnologia
        });
        res.status(200).send({ data: reg });

    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

//Peticiones API
const consulta_Pvgis = function (req, res) {
    lat = req.params.lat
    lon = req.params.lon
    peakpower = req.params.peakpower
    batterysize = req.params.atterysize
    consumptionday = req.params.consumptionday
    cutoff = req.params.cutoff

    //Sistemas Fotovoltaicos aislados de la red
    const ruta = 'https://re.jrc.ec.europa.eu/api/SHScalc?lat=' + lat + '&lon=' + lon + '&peakpower=' + peakpower + '&batterysize=' + batterysize + '&consumptionday=' + consumptionday + '&cutoff=' + cutoff + '&outputformat=json'
    const promesa = new Promise((resolve, reject) => {

        https.get(ruta, res => {
            let data = ""

            res.on("data", d => {
                data += d
            })
            res.on("end", () => {
                resolve(data)
            })
        })
    })

    promesa.then(respuesta => {
        res.status(200).send({ data: JSON.parse(respuesta) })
        //res.status(200).send({data:respuesta})
    })
        .catch(error => {
            res.status(500).send({ message: 'Error al realizar la consulta de eficiencias' })
        })
}

//Inicia consulta de HSP
const consulta_hsp = function (req, res) {
    lat = req.params.lat
    lon = req.params.lon
    angle = req.params.angle
    //Consulta la radiacion Mensual
    //https://re.jrc.ec.europa.eu/api/MRcalc?lat=45&lon=8&horirrad=1&outputformat=json&startyear=2016
    const ruta = 'https://re.jrc.ec.europa.eu/api/MRcalc?lat=' + lat + '&lon=' + lon + '&selectrad=1' + '&angle=' + angle + '&outputformat=json&startyear=2015'
    const promesa = new Promise((resolve, reject) => {
        https.get(ruta, res => {
            let data = ""
            res.on("data", d => {
                data += d
            })
            res.on("end", () => {
                resolve(data)
            })
        })
    })

    promesa.then(respuesta => {
        res.status(200).send({ data: JSON.parse(respuesta) })
    })
        .catch(error => {
            res.status(500).send({ message: 'Error al realizar la consulta de HSP' })
        })
}


const consultar_radiacion_diaria = function (req, res) {

    //Consulta la radiacion Diaria para un plano con inclinacion Optima

    lat = req.params.lat
    lon = req.params.lon
    angle = req.params.angle
    console.log('Consulta radiacion diaria Con inclinacion Optima',lat,lon)
    //https://re.jrc.ec.europa.eu/api/DRcalc?lat=4.582&lon=-74.22&month=0&global=1&localtime=1&showtemperatures=1
    //const ruta = 'https://re.jrc.ec.europa.eu/api/DRcalc?lat=' + lat + '&lon=' + lon + '&month=0&global=1&localtime=1&showtemperatures=1&outputformat=json'
    const ruta = 'https://re.jrc.ec.europa.eu/api/DRcalc?lat=' + lat + '&lon=' + lon + '&angle=' + angle + '&month=0&global=1&localtime=1&showtemperatures=1&outputformat=json'
    const promesa = new Promise((resolve, reject) => {
        https.get(ruta, res => {
            let data = ""
            res.on("data", d => {
                data += d
            })
            res.on("end", () => {
                resolve(data)
            })
        })
    })

    promesa.then(respuesta => {
        res.status(200).send({ data: JSON.parse(respuesta) })
    })
        .catch(error => {
            res.status(500).send({ message: 'Error al realizar la consulta de radiación diaria' })
        })

}

const consultar_radiacion_diaria_plano_Horizontal = function (req, res) {
    console.log('Consulta radiacion diaria Con inclinacion Optima')
    //Consulta la radiacion Diaria para un plano con inclinacion Optima

    lat = req.params.lat
    lon = req.params.lon
    //angle = req.params.angle
    //https://re.jrc.ec.europa.eu/api/DRcalc?lat=4.582&lon=-74.22&month=0&global=1&localtime=1&showtemperatures=1
    const ruta = 'https://re.jrc.ec.europa.eu/api/DRcalc?lat=' + lat + '&lon=' + lon + '&month=0&global=1&localtime=1&showtemperatures=1&outputformat=json'
    const promesa = new Promise((resolve, reject) => {
        https.get(ruta, res => {
            let data = ""
            res.on("data", d => {
                data += d
            })
            res.on("end", () => {
                resolve(data)
            })
        })
    })

    promesa.then(respuesta => {
        res.status(200).send({ data: JSON.parse(respuesta) })
    })
        .catch(error => {
            res.status(500).send({ message: 'Error al realizar la consulta de radiación diaria' })
        })

}

/**Finaliza Calculadora Solar */


//Inician panneles Solares
const registro_panel_admin = async function (req, res) {
    if (req.user) {
        let data = req.body;
        let productos = await panel_solar.find({ modelo: data.modelo });
        if (productos.length == 0) {
            var img_path = req.files.portada.path;
            var name = img_path.split('\\');
            // var portada_name = name[2];

            const { secure_url } = await cloudinary.uploader.upload(img_path)

            data.portada = secure_url;
            let reg = await panel_solar.create(data);
            res.status(200).send({ data: reg });
        } else {
            res.status(200).send({ data: undefined, message: 'El Modelo del panel ya existe' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const listar_paneles_admin = async function (req, res) {

    if (req.user) {

        let query = { estado: true }
        var paneles = await panel_solar.find(query);
        res.status(200).send({ data: paneles });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_panel_admin = async function (req, res) {
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
            /*
                        fs.stat('./uploads/productos/'+reg.portada, function(err){
                            if(!err){
                                fs.unlink('./uploads/productos/'+reg.portada, (err)=>{
                                    if(err) throw err;
                                });
                            }
                        })
            */
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


const eliminar_panel_admin = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];

        let reg = await panel_solar.findByIdAndUpdate(id, { estado: false }, { new: true });
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_panel_admin = async function (req, res) {
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
//Finalizan Paneles Solares

//Inician Baterias
const registro_bateria_admin = async function (req, res) {
    if (req.user) {
        let data = req.body;
        let productos = await bateria.find({ modelo: data.modelo });
        if (productos.length == 0) {
            var img_path = req.files.portada.path;
            var name = img_path.split('\\');
            // var portada_name = name[2];

            const { secure_url } = await cloudinary.uploader.upload(img_path)

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

const listar_baterias_admin = async function (req, res) {
    if (req.user) {
        let query = { $and: [{ estado: true }, { usuario: req.user.sub }] }
        var baterias = await bateria.find(query);
        res.status(200).send({ data: baterias });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_bateria_admin = async function (req, res) {
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


const eliminar_bateria_admin = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        let reg = await bateria.findByIdAndUpdate(id, { estado: false }, { new: true });
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_bateria_admin = async function (req, res) {
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
const registro_controlador_admin = async function (req, res) {
    if (req.user) {
        let data = req.body;
        let productos = await controlador.find({ modelo: data.modelo });
        if (productos.length == 0) {
            var img_path = req.files.portada.path;
            var name = img_path.split('\\');
            // var portada_name = name[2];

            const { secure_url } = await cloudinary.uploader.upload(img_path)

            data.portada = secure_url;
            data.input = JSON.parse(data.input)
            let reg = await controlador.create(data);
            res.status(200).send({ data: reg });
        } else {
            res.status(200).send({ data: undefined, message: 'El Modelo de controlador' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const listar_controladores_admin = async function (req, res) {
    if (req.user) {

        let query = { estado: true }
        var controladores = await controlador.find(query);
        res.status(200).send({ data: controladores });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_controlador_admin = async function (req, res) {

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


const eliminar_controlador_admin = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        let reg = await controlador.findByIdAndUpdate(id, { estado: false }, { new: true });
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_controlador_admin = async function (req, res) {
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
const registro_inversor_admin = async function (req, res) {
    if (req.user) {
        let data = req.body;
        let productos = await inversor.find({ modelo: data.modelo });
        if (productos.length == 0) {
            var img_path = req.files.portada.path;
            var name = img_path.split('\\');
            // var portada_name = name[2];

            const { secure_url } = await cloudinary.uploader.upload(img_path)

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

const listar_inversores_admin = async function (req, res) {
    if (req.user) {

        let query = { estado: true }
        var inversores = await inversor.find(query);
        res.status(200).send({ data: inversores });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_inversor_admin = async function (req, res) {
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


const eliminar_inversor_admin = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        let reg = await inversor.findByIdAndUpdate(id, { estado: false }, { new: true });
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_inversor_admin = async function (req, res) {
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



//Inician Empresas
const registro_empresa_admin = async function (req, res) {
    if (req.user) {
        let data = req.body;
        let empresas = await Empresa.find({ nit: data.nit });
        //
        if (data.password) {
            bcrypt.hash(data.password, null, null, async function (err, hash) {
                if (hash) {
                    data.password = hash;
                } else {
                    res.status(200).send({ message: 'ErrorServer', data: undefined });
                }
            })
        } else {
            res.status(200).send({ message: 'No hay una contraseña', data: undefined });
        }
        //
        if (empresas.length == 0) {
            var img_path = req.files.logo.path;
            var name = img_path.split('\\');
            const { secure_url } = await cloudinary.uploader.upload(img_path)
            data.logo = secure_url;
            data.ubicacion = JSON.parse(data.coordenadas)
            let reg = await Empresa.create(data);
            //res.status(200).send({ data: reg });
        } else {
            res.status(200).send({ data: undefined, message: 'La empresa ya existe' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const listar_empresas_admin = async function (req, res) {
    if (req.user) {
        let query = { estado: true }
        var empresas = await Empresa.find(query);
        res.status(200).send({ data: empresas });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_empresa_admin = async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;
        if (req.files) {
            //SI HAY IMAGEN
            var img_path = req.files.logo.path;
            var name = img_path.split('\\');

            //Buscar la Imagen anterior 
            modelo = await Empresa.findById(id)//Traigo el modelo actual 
            const nombreArr = modelo.logo.split('/')
            const nombre = nombreArr[nombreArr.length - 1]
            const [public_id] = nombre.split('.')
            cloudinary.uploader.destroy(public_id) //Elimina la anterior
            //Fin buscar imagen anterior

            const { secure_url } = await cloudinary.uploader.upload(img_path)//Cargo nueva imagen

            let reg = await Empresa.findByIdAndUpdate({ _id: id }, {
                nombre: data.nombre,
                telefono: data.telefono,
                email: data.email,
                latitud: data.latitud,
                longitud: data.longitud,
                direccion: data.direccion,
                descripcion: data.descripcion,
                nit: data.nit,
                logo: secure_url,

            });
            res.status(200).send({ data: reg });
        } else {
            //NO HAY IMAGEN
            let reg = await Empresa.findByIdAndUpdate({ _id: id }, {
                nombre: data.nombre,
                telefono: data.telefono,
                email: data.email,
                latitud: data.latitud,
                longitud: data.longitud,
                direccion: data.direccion,
                descripcion: data.descripcion,
                nit: data.nit,

            });
            res.status(200).send({ data: reg });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}


const eliminar_empresa_admin = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];

        let reg = await Empresa.findByIdAndUpdate(id, { estado: false }, { new: true });
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_empresa_admin = async function (req, res) {
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


//Inician Electrodomesticos

const registro_electrodomestico_admin = async function (req, res) {

    if (req.user) {

        let data = req.body;

        let electrodomesticos = await Electrodomestico.find({ nombre: data.nombre });
        if (electrodomesticos.length == 0) {
            var img_path = req.files.portada.path;
            var name = img_path.split('\\');
            // var portada_name = name[2];

            const { secure_url } = await cloudinary.uploader.upload(img_path)

            data.portada = secure_url;
            let reg = await Electrodomestico.create(data);
            res.status(200).send({ data: reg });
        } else {
            res.status(200).send({ data: undefined, message: 'El Modelo de Electrodomestico ya existe' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const listar_electrodomesticos_admin = async function (req, res) {
    if (req.user) {
        let query = { estado: true }
        var electrodomesticos = await Electrodomestico.find(query).populate('categoria');
        res.status(200).send({ data: electrodomesticos });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const registro_categoriaElectrodomestico_admin = async function (req, res) {
    if (req.user) {
        let data = req.body;
        let categorias = await CategoriaElectrodomestico.find({ nombre: data.nombre });

        if (categorias.length == 0) {
            let reg = await CategoriaElectrodomestico.create(data);
            res.status(200).send({ data: reg });
        } else {
            res.status(200).send({ data: undefined, message: 'La categoria ya existe' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const get_categoriasElectrodomesticos = async function (req, res) {
    if (req.user) {
        var reg = await CategoriaElectrodomestico.find();
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

//Finalizan Electrodomesticos

module.exports = {

    //Paneles
    registro_panel_admin,
    listar_paneles_admin,
    actualizar_panel_admin,
    eliminar_panel_admin,
    obtener_panel_admin,
    //Fin paneles

    //Baterias
    registro_bateria_admin,
    listar_baterias_admin,
    actualizar_bateria_admin,
    eliminar_bateria_admin,
    obtener_bateria_admin,
    //Fin pbaterias

    //Baterias
    registro_controlador_admin,
    listar_controladores_admin,
    actualizar_controlador_admin,
    eliminar_controlador_admin,
    obtener_controlador_admin,
    //Fin Controladoress

    //Inversores
    registro_inversor_admin,
    listar_inversores_admin,
    actualizar_inversor_admin,
    eliminar_inversor_admin,
    obtener_inversor_admin,
    //Fin Inversores

    //Empresas
    registro_empresa_admin,
    listar_empresas_admin,
    actualizar_empresa_admin,
    eliminar_empresa_admin,
    obtener_empresa_admin,
    //Fin Empresa

    //Inician Electrodomesticos
    registro_electrodomestico_admin,
    listar_electrodomesticos_admin,

    registro_categoriaElectrodomestico_admin,
    get_categoriasElectrodomesticos,
    //Finalizan Electrodomesticos


    login_admin,

    get_categorias,/**Añadido para listar categorias */


    listar_productos_admin,

    obtener_producto_admin,

    obtener_portada,
    actualizar_producto_admin,


    agregar_imagen_galeria_admin,
    eliminar_imagen_galeria_admin,
    verificar_token,
    cambiar_vs_producto_admin,

    /*Calculadora*/
    registro_producto_calculadora_admin,
    registro_controlador_calculadora_admin,
    registro_panel_calculadora_admin,
    registro_inversor_calculadora_admin,

    listar_productos_calculadora_admin,
    obtener_producto_calculadora_admin,

    actualizar_controlador_calculadora_admin,
    actualizar_panel_calculadora_admin,
    actualizar_inversor_calculadora_admin,
    actualizar_bateria_calculadora_admin,

    consulta_Pvgis,
    consulta_hsp,
    consultar_radiacion_diaria, //Con inclinacion optima
    consultar_radiacion_diaria_plano_Horizontal,//Horizontal
}