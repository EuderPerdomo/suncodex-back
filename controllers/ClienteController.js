'use strict'
var Cliente = require('../models/Cliente');
var Cliente_Instalador = require('../models/Cliente_Instalador')
var Cliente_Empresarial = require('../models/ClienteEmpresarial')
var Electrodomestico = require('../models/Electrodomestico')

var bcrypt = require('bcrypt-nodejs');
var jwt = require('../helpers/jwt');

var Categoria = require('../models/Categoria')//Agrego la categoria
//Calculadora solar
var Paneles_Solares = require('../models/panel_solar')
var Controladores_Solares = require('../models/controlador')
var Baterias_Solares = require('../models/bateria')
var Inversor = require('../models/inversor')
var Calculo = require('../models/Calculo')
var Empresa = require('../models/Empresa')
var Oficina = require('../models/Oficina')
var Notificacion = require('../models/Notificacion')


var fs = require('fs');
var handlebars = require('handlebars');
var ejs = require('ejs');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var path = require('path');
var mongoose = require('mongoose');

const https = require("https");
//const inversor = require('../models/inversor');
//const bateria = require('../models/bateria');

require('dotenv').config();// Para tarer rlas variables de entorno
//Probando con cloudinari
const cloudinary = require('cloudinary').v2
cloudinary.config(process.env.CLOUDINARY_URL)

const registro_cliente_guest = async function (req, res) {
    let data = req.body;
    var clientes_arr = [];

    try {
    clientes_arr = await Cliente.find({ email: data.email });
    empresarios_arr = await Cliente_Empresarial.find({ email: data.email });
    instaladores_arr = await Cliente_Instalador.find({ email: data.email });

    if (clientes_arr.length == 0 && empresarios_arr == 0 && instaladores_arr== 0) {
        if (data.password) {
            bcrypt.hash(data.password, null, null, async function (err, hash) {
                if (hash) {
                    data.dni = '';
                    data.password = hash;
                    var reg = await Cliente.create(data);
                    res.status(200).send({ data: reg });
                } else {
                    res.status(200).send({ message: 'ErrorServer', data: undefined });
                }
            })
        } else {
            res.status(200).send({ message: 'No hay una contraseña', data: undefined });
        }


    } else {
        res.status(200).send({ message: 'Este correo ya se encuentra registrado en nuestra base de datos', data: undefined });
    }
    } catch (error) {
      console.log('Error al registrar cliente Guest')  
    }

    
}

const registro_instalador_guest = async function (req, res) {

    try {
        let data = req.body;
        var clientes_arr = [];
        clientes_arr = await Cliente.find({ email: data.email });
        empresarios_arr = await Cliente_Empresarial.find({ email: data.email });
        instaladores_arr = await Cliente_Instalador.find({ email: data.email });
    
        if (clientes_arr.length == 0 && empresarios_arr == 0 && instaladores_arr== 0) {
            if (data.password) {
                bcrypt.hash(data.password, null, null, async function (err, hash) {
                    if (hash) {
                       // data.dni = '';
                        data.password = hash;
                        var reg = await Cliente_Instalador.create(data);
                        res.status(200).send({ data: reg });
                    } else {
                        res.status(200).send({ message: 'ErrorServer', data: undefined });
                    }
                })
            } else {
                res.status(200).send({ message: 'No hay una contraseña', data: undefined });
            }
        } else {
            res.status(200).send({ message: 'Este correo ya se encuentra registrado en nuestra base de datos', data: undefined });
        }
        
    } catch (error) {
        res.status(500).send({ message: 'Error al realizar registro' })
    }

}



const registro_cliente_empresa_guest = async function (req, res) {
    let data = req.body;
    var clientes_arr = [];

    clientes_arr = await Cliente.find({ email: data.email });
    empresarios_arr = await Cliente_Empresarial.find({ email: data.email });
    instaladores_arr = await Cliente_Instalador.find({ email: data.email });

    if (clientes_arr.length == 0 && empresarios_arr == 0 && instaladores_arr== 0) {
        if (data.password) {
            bcrypt.hash(data.password, null, null, async function (err, hash) {
                if (hash) {
                    //data.dni = '';
                    data.password = hash;

                    //Creo primero la Empresa
                    data_empresa = {
                        nombre: data.nombre_empresa,
                        nit: data.nit_empresa,
                        direccion: data.direccion_empresa,
                        telefono: data.telefono
                    }
                    var empresa = await Empresa.create(data_empresa)
                    //Ahora creo el usuario y asigno la nueva empresa al usuario recien creado
                    data_cliente = {
                        nombres: data.nombres,
                        apellidos: data.apellidos,
                        dni: data.dni,
                        email: data.email,
                        telefono: data.telefono,
                        password: data.password,
                        rol: data.rol,
                        empresas: empresa._id,
                    }

                    //Creada la empresa y el cliente crearle oficina o sucursal principal

                    var reg = await Cliente_Empresarial.create(data_cliente);

                    /*
                    
                    var reg = await Cliente_Empresarial.updateOne(
                        { "_id": id_destino, "repuestos.repuesto": data.repuesto },
                        { $inc: { "repuestos.$.cantidad": data.cantidad } }
                    )
                   */
                    res.status(200).send({ data: reg });

                    //Una vez creado el cliente debo crear la empresa y despues asignarle esa empresa al cliente


                } else {
                    res.status(200).send({ message: 'ErrorServer', data: undefined });
                }
            })
        } else {
            res.status(200).send({ message: 'No hay una contraseña', data: undefined });
        }


    } else {
        res.status(200).send({ message: 'Este correo ya se encuentra registrado en nuestra base de datos', data: undefined });
    }
}


const login_guest = async function (req, res) {
    var data = req.body;
    var clientes_arr = [];
    var empresarios_arr = [];
    var instaladores_arr = [];

    clientes_arr = await Cliente.find({ email: data.email });
    empresarios_arr = await Cliente_Empresarial.find({ email: data.email });
    instaladores_arr = await Cliente_Instalador.find({ email: data.email });



    if (clientes_arr.length != 0) {
        let user = clientes_arr[0];
        bcrypt.compare(data.password, user.password, async function (error, check) {
            if (check) {

                const tokenn = jwt.createToken(user)


                res.status(200).send({
                    data: user,
                    token: tokenn
                });
            } else {
                res.status(200).send({ message: 'La contraseña no coincide', data: undefined });
            }
        });
        //
    } else if (empresarios_arr.length != 0) {
        let user = empresarios_arr[0];
        bcrypt.compare(data.password, user.password, async function (error, check) {
            if (check) {

                const tokenn = jwt.createToken(user)

                res.status(200).send({
                    data: user,
                    token: tokenn
                });
            } else {
                res.status(200).send({ message: 'La contraseña no coincide', data: undefined });
            }
        });

    } else if (instaladores_arr != 0) {
        let user = instaladores_arr[0];
        bcrypt.compare(data.password, user.password, async function (error, check) {
            if (check) {

                const tokenn = jwt.createToken(user)

                res.status(200).send({
                    data: user,
                    token: tokenn
                });
            } else {
                res.status(200).send({ message: 'La contraseña no coincide', data: undefined });
            }
        });
    }
    else {
        res.status(200).send({ message: 'No se encontro el correo', data: undefined });
    }
}

const listar_empresas_usuario = async function (req, res) {
    if (req.user) {
        let query = { estado: true }; // Query para todas las empresas activas

        // Buscar todas las empresas
        let empresas = await Empresa.find(query);

        let empresasFavoritas;
        if (req.user.role === 'instalador') {
            // Obtener las empresas favoritas del cliente instalador
            const clienteInstalador = await Cliente_Instalador.findById(req.user.sub);
            idsEmpresasFavoritas = clienteInstalador.empresas_favoritas;
            empresasFavoritas = await Empresa.find({ _id: { $in: idsEmpresasFavoritas } });
        } else if (req.user.role === 'empresa') {
            // Obtener las empresas favoritas del cliente empresarial
            const clienteEmpresarial = await Cliente_Empresarial.findById(req.user.sub);
            idsEmpresasFavoritas = clienteEmpresarial.empresas_favoritas;

            //Sacar empresas propias de todas las empresas
            idsEmpresasPropias = clienteEmpresarial.empresas;

            empresasFavoritas = await Empresa.find({ _id: { $in: idsEmpresasFavoritas } });

            const empresasPropias = await Empresa.find({ _id: { $in: idsEmpresasPropias } });
            empresas = await Empresa.find({ _id: { $nin: idsEmpresasPropias } });
            


        }

        res.status(200).send({ todasLasEmpresas: empresas, empresasFavoritas: empresasFavoritas});
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}


const anadirEmpresaFavorita_usuario = async function (req, res) {

    if (req.user) {
        const id = req.params['id'];//Id de la empresa a agregar
        //const id = new mongoose.Types.ObjectId(req.params['id'])
        const idd = new mongoose.Types.ObjectId(req.user.sub) //Id del cliente

        if (req.user.role == 'instalador') {
            let clienteInstalador = await Cliente_Instalador.findById(idd);

            if (clienteInstalador.empresas_favoritas != undefined) {
                //Ya tiene Favoritas
                const empresasFavoritas = clienteInstalador.empresas_favoritas.map(id => id.toString());
                if (!empresasFavoritas.includes(id)) {
                    // Si no está presente, agregar el ID de la empresa a la lista de favoritos
                    let reg = await Cliente_Instalador.findByIdAndUpdate({ _id: idd }, {
                        $push: {
                            empresas_favoritas: id //Agrego id de la empresa
                        }
                    }, { useFindAndModify: false });
                    res.status(200).send({ data: reg });
                }
                else {
                    res.status(200).send({ data: undefined, message: 'Esta empresa ya esta agregada a favoritos' });
                }
            } else {
                //No tiene Favoritas, por tanto solo la agrego
                let reg = await Cliente_Instalador.findByIdAndUpdate({ _id: idd }, {
                    $push: {
                        empresas_favoritas: id //Agrego id de la empresa
                    }
                }, { useFindAndModify: false });
                res.status(200).send({ data: reg });
            }

        } else if (req.user.role == 'empresa') {
            //Busco que el id no se encuentre agregado
            let clienteEmpresa = await Cliente_Empresarial.findById(idd);
            if (clienteEmpresa.empresas_favoritas != undefined) {
                //Ya tiene Favoritas
                const empresasFavoritas = clienteEmpresa.empresas_favoritas.map(id => id.toString());
                if (!empresasFavoritas.includes(id)) {
                    // Si no está presente, agregar el ID de la empresa a la lista de favoritos
                    let reg = await Cliente_Empresarial.findByIdAndUpdate({ _id: idd }, {
                        $push: {
                            empresas_favoritas: id //Agrego id de la empresa
                        }
                    }, { useFindAndModify: false });
                    res.status(200).send({ data: reg });
                }
                else {
                    res.status(200).send({ data: undefined, message: 'Esta empresa ya esta agregada a favoritos' });
                }
            } else {
                //No tiene Favoritas, por tanto solo la agrego
                let reg = await Cliente_Empresarial.findByIdAndUpdate({ _id: idd }, {
                    $push: {
                        empresas_favoritas: id //Agrego id de la empresa
                    }
                }, { useFindAndModify: false });
                res.status(200).send({ data: reg });
            }






        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }


}


const eliminar_empresa_favorita_usuario=async function(req,res){

    if (req.user) {
        let id = req.params['id'];
        if (req.user.role == 'instalador') {


           let reg= await Cliente_Instalador.updateOne(
                { _id: req.user.sub },
                { $pull: { empresas_favoritas: id } }
              );

         
            res.status(200).send({ data: reg });

        }
        else if(req.user.role == 'empresa'){

            let reg= await Cliente_Empresarial.updateOne(
                { _id: req.user.sub },
                { $pull: { empresas_favoritas: id } }
              );

          
            res.status(200).send({ data: reg });

        }



        
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }

}

const obtener_usuario_usuario = async function (req, res) {

    idd = new mongoose.Types.ObjectId(req.user.sub)

    if (req.user.role == 'empresa') {
        empresario = await Cliente_Empresarial.find({ _id: idd });
        res.status(200).send({ data: empresario });
    } else if (req.user.role == 'usuario_final') {
        cliente = await Cliente.find({ _id: idd });
        res.status(200).send({ data: cliente });
    }
    else if (req.user.role == 'instalador') {
        instalador = await Cliente_Instalador.find({ _id: idd });
        res.status(200).send({ data: instalador });
    }
    else {
        res.status(500).send({ message: 'NoAccess' });
    }

    /*
        if (req.user) {
            var id = req.params['id'];
    
            try {
                var reg = await Cliente.findById({ _id: id });
                res.status(200).send({ data: reg });
            } catch (error) {
                res.status(200).send({ data: undefined });
            }
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
        */
}


/************************************************************************************************* */



const registro_cliente_tienda = async function (req, res) {
    let data = req.body;
    var clientes_arr = [];

    clientes_arr = await Cliente.find({ email: data.email });

    if (clientes_arr.length == 0) {
        if (data.password) {
            bcrypt.hash(data.password, null, null, async function (err, hash) {
                if (hash) {
                    data.dni = '';
                    data.password = hash;
                    var reg = await Cliente.create(data);
                    res.status(200).send({ data: reg });
                } else {
                    res.status(200).send({ message: 'ErrorServer', data: undefined });
                }
            })
        } else {
            res.status(200).send({ message: 'No hay una contraseña', data: undefined });
        }


    } else {
        res.status(200).send({ message: 'El correo ya existe, intente con otro.', data: undefined });
    }
}

const listar_clientes_tienda = async function (req, res) {
    if (req.user) {
        let query = { estado: true }
        var clientes = await Cliente.find(query);
        res.status(200).send({ data: clientes });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}




//Llamadas al cliente desde el admin
const registro_cliente = async function (req, res) {

    //
    var data = req.body;
    var clientes_arr = [];

    clientes_arr = await Cliente.find({ email: data.email });

    if (clientes_arr.length == 0) {
        if (data.password) {
            bcrypt.hash(data.password, null, null, async function (err, hash) {
                if (hash) {
                    data.dni = '';
                    data.password = hash;
                    var reg = await Cliente.create(data);
                    res.status(200).send({ data: reg });
                } else {
                    res.status(200).send({ message: 'ErrorServer', data: undefined });
                }
            })
        } else {
            res.status(200).send({ message: 'No hay una contraseña', data: undefined });
        }


    } else {
        res.status(200).send({ message: 'El correo ya existe en la base de datos', data: undefined });
    }
}

const obtener_cliente_admin = async function (req, res) {

    if (req.user) {
        var id = req.params['id'];

        try {
            var reg = await Cliente.findById({ _id: id });
            res.status(200).send({ data: reg });
        } catch (error) {
            res.status(200).send({ data: undefined });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_cliente_admin = async function (req, res) {

    if (req.user) {
        let id = req.params['id'];
        let data = req.body;

        let reg = await Cliente.findByIdAndUpdate({ _id: id }, {
            nombres: data.nombres,
            apellidos: data.apellidos,
            email: data.email,
            telefono: data.telefono,
            latitud: data.latitud,
            longitud: data.longitud,
        });
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const eliminar_cliente_admin = async function (req, res) {

    if (req.user) {
        var id = req.params['id'];

        let reg = await Cliente.findByIdAndUpdate(id, { estado: false }, { new: true });
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

//Finaliza llamadas cliente desde admin

const login_cliente = async function (req, res) {
    var data = req.body;
    var cliente_arr = [];

    cliente_arr = await Cliente.find({ email: data.email });

    if (cliente_arr.length == 0) {
        res.status(200).send({ message: 'No se encontro el correo', data: undefined });
    } else {
        //LOGIN
        let user = cliente_arr[0];
        bcrypt.compare(data.password, user.password, async function (error, check) {
            if (check) {

                const tokenn = jwt.createToken(user)


                res.status(200).send({
                    data: user,
                    token: tokenn
                });
            } else {
                res.status(200).send({ message: 'La contraseña no coincide', data: undefined });
            }
        });

    }
}

const obtener_cliente_guest = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];

        try {
            var reg = await Cliente.findById({ _id: id });

            res.status(200).send({ data: reg });
        } catch (error) {
            res.status(200).send({ data: undefined });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_perfil_cliente_guest = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        var data = req.body;

        if (data.password) {

            bcrypt.hash(data.password, null, null, async function (err, hash) {

                var reg = await Cliente.findByIdAndUpdate({ _id: id }, {
                    nombres: data.nombres,
                    apellidos: data.apellidos,
                    telefono: data.telefono,
                    f_nacimiento: data.f_nacimiento,
                    dni: data.dni,
                    password: hash,
                });
                res.status(200).send({ data: reg });
            });

        } else {

            var reg = await Cliente.findByIdAndUpdate({ _id: id }, {
                nombres: data.nombres,
                apellidos: data.apellidos,
                telefono: data.telefono,
                f_nacimiento: data.f_nacimiento,
                dni: data.dni,
            });
            res.status(200).send({ data: reg });
        }

    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

//---METODOS PUBLICOS----------------------------------------------------

const get_categorias_publico = async function (req, res) {
    var reg = await Categoria.find();
    res.status(200).send({ data: reg });
}
/*Finaliza mi Metodo para listar categorias publico */

//*********************************************************************INICIAN CONSULTAS PROPIAS DEL CALCULO*************** */
const listar_paneles = async function (req, res) {
    let reg = await Paneles_Solares.find().sort().populate('producto');

    res.status(200).send({ data: reg });
}

const listar_controladores = async function (req, res) {

    let reg = await Controladores_Solares.find().sort().populate('producto');
    
    res.status(200).send({ data: reg });
}

const listar_baterias = async function (req, res) {
    //let arr_data = [];
    let reg = await Baterias_Solares.find().sort().populate('producto');
    res.status(200).send({ data: reg });
}


//Inician Inversores
const registro_inversor_usuario = async function (req, res) {
    if (req.user) {
        let data = req.body;

        let productos = await Inversor.find({ modelo: data.modelo });
        if (productos.length == 0) {
            var img_path = req.files.portada.path;
            var name = img_path.split('\\');
            // var portada_name = name[2];

            const { secure_url } = await cloudinary.uploader.upload(img_path)

            data.portada = secure_url;
            let reg = await Inversor.create(data);
            res.status(200).send({ data: reg });
        } else {
            res.status(200).send({ data: undefined, message: 'El Modelo de Inversor ya existe' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}
//Corregir nombre
const listar_inversores_usuario = async function (req, res) {

    if (req.user) {

        let query = { estado: true }

        var inversores = await Inversor.find(query);
        res.status(200).send({ data: inversores });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const actualizar_inversor_usuario = async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;
        if (req.files) {
            //SI HAY IMAGEN
            var img_path = req.files.portada.path;
            var name = img_path.split('\\');

            //Buscar la Imagen anterior 
            modelo = await Inversor.findById(id)//Traigo el modelo actual 
            const nombreArr = modelo.portada.split('/')
            const nombre = nombreArr[nombreArr.length - 1]
            const [public_id] = nombre.split('.')
            cloudinary.uploader.destroy(public_id) //Elimina la anterior
            //Fin buscar imagen anterior

            const { secure_url } = await cloudinary.uploader.upload(img_path)//Cargo nueva imagen

            let reg = await Inversor.findByIdAndUpdate({ _id: id }, {
                voltaje_in: data.voltaje_in,
                voltaje_out: data.voltaje_out,
                modelo: data.modelo,
                portada: secure_url,
                descripcion: data.descripcion,
                peso: data.peso,
                tipo: data.tipo,
                potencia: data.potencia,
                potencia_pico: data.potencia_pico,
                eficiencia: data.eficiencia,

            });

            res.status(200).send({ data: reg });
        } else {
            //NO HAY IMAGEN
            let reg = await Inversor.findByIdAndUpdate({ _id: id }, {
                voltaje_in: data.voltaje_in,
                voltaje_out: data.voltaje_out,
                modelo: data.modelo,
                descripcion: data.descripcion,
                peso: data.peso,
                tipo: data.tipo,
                potencia: data.potencia,
                potencia_pico: data.potencia_pico,
                eficiencia: data.eficiencia,

            });
            res.status(200).send({ data: reg });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}


const eliminar_inversor_usuario = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        let reg = await Inversor.findByIdAndUpdate(id, { estado: false }, { new: true });
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const obtener_inversor_usuario = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        try {
            var reg = await Inversor.findById({ _id: id });
            res.status(200).send({ data: reg });
        } catch (error) {
            res.status(200).send({ data: undefined });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}
//Finalizan Inversores

//Inician Calculos Usuario
const registro_calculo_usuario = async function (req, res) {
    if (req.user) {
        let data = req.body;
        let usuario = req.user.sub
        data.usuario = usuario
        console.log('usuario, que guarda',req.user,"datos a Guardar", req.body)

        //Inicia consulta de cada componente
        var arregloSinDuplicados = []
        try {
            if (data.autoriza_correccion) {

                //Datos del cliente
                let panel = await Paneles_Solares.findById(data.panel)
                let controlador = await Controladores_Solares.findById(data.controlador)
                let inversor = await Inversor.findById(data.inversor)
                let bateria = await Baterias_Solares.findById(data.bateria)

                const propietarios = [
                    panel.propietario,
                    controlador.propietario,
                    inversor.propietario,
                    bateria.propietario,
                ];
           
                const arregloFiltrado = propietarios.filter(objId => objId.toString() !== usuario);
                const conjunto = new Set(arregloFiltrado.map(objId => objId.toString()));
                arregloSinDuplicados = [...conjunto];
            }

            let reg = await Calculo.create(data);        
            if (arregloSinDuplicados.length >= 1) {
                let notificar = await Notificacion.create({
                    calculo: reg._id,
                    propietarios: arregloSinDuplicados.map(id => ({ propietarioId: id, estado: true })),
                    descripcion: data.descripcion, // Descripcion suministrada por el usuario
                    telefono: '123456789', // teléfono de contacto usuario
                    correo: req.user.email, // Correo electrónico de contacto Usuario
                    ubicacion: [data.latitud, data.longitud],
                    potencia: data.total_dia,
                    interesado_nombre: req.user.nombres, //Nombre usuario interesado
                }
                );
            }
            res.status(200).send({ data: reg });
        } catch (error) {
            console.log('catch error',error)
            res.status(200).send({ data: undefined });
        }
    } else {
        console.log('Sin credenciales de acceso')
        res.status(500).send({ message: 'NoAccess' });
    }
}

const listar_calculos_usuario = async function (req, res) {

    if (req.user) {

        id_usuario = new mongoose.Types.ObjectId(req.user.sub)

        let query = { $and: [{ estado: true }, { usuario: id_usuario }] }
        //let query = { estado: true,usuario:'65ce4ad275255c4750e83a28'  }
        // var calculos = await Calculo.find(query).populate('panel').populate('bateria').populate('controlador').populate('inversor')
        var calculos = await Calculo.find(query)
        res.status(200).send({ data: calculos });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}


const actualizar_calculo_usuario = async function (req, res) {
   
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;

        let reg = await Calculo.findByIdAndUpdate({ _id: id }, {
            autoriza_correccion: data.autoriza_correccion,
            usuario: data.usuario,
            latitud: data.latitud,
            longitud: data.longitud,
            simultaneo: data.simultaneo,
            total_dia: data.total_dia,
            descripcion: data.descripcion,
            tipo: data.tipo,
            nombre: data.nombre,
            panel: data.panel,
            inversor: data.inversor,
            bateria: data.bateria,
            controlador: data.controlador,
            potencias: data.potencias,

            resultadoCalculoPanel: data.resultadoCalculoPanel,
            resultadoCalculoControlador: data.resultadoCalculoControlador,
            resultadoCalculoBateria: data.resultadoCalculoBateria,
            resultadoCalculoInversor: data.resultadoCalculoInversor,

        });
        res.status(200).send({ data: reg });

    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}
//Finaliza Calculos Usuario

//Inician Notificaciones
const listar_notificaciones_usuario = async function (req, res) {
    
    if (req.user) {
        let id_usuario = req.user.sub
        //id_usuario = new mongoose.Types.ObjectId(req.user.sub)
        let query = { $and: [{ 'propietarios.estado': true }, { 'propietarios.propietarioId': id_usuario }] }
        //let query = { estado: true,usuario:'65ce4ad275255c4750e83a28'  }
        // var calculos = await Calculo.find(query).populate('panel').populate('bateria').populate('controlador').populate('inversor')
        var notificaciones = await Notificacion.find(query)

    
        res.status(200).send({ data: notificaciones });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}
//Finalizan notificaciones


//Inicia prueba de consulta por medio de ubicacion y otros parametros
const listar_inversores_usuario_ubicacion = async function (req, res) {
    if (req.user) {
        

        //Como es usuario final la busqueda la realizo por Ubicacion
        //Punto central y amplitud del poligono
        var latitud = parseFloat(req.params['latitud'])
        let longitud = parseFloat(req.params['longitud'])
        let radio = parseInt(req.params['radio'])
        let filtro = req.params['filtro']



        if (filtro == "propios") {
            id = new mongoose.Types.ObjectId(req.user.sub)

            id = new mongoose.Types.ObjectId(req.user.sub)
            let query = { $and: [{ estado: true }, { propietario: id }] }

            var inversores = await Inversor.find(query);
            res.status(200).send({ data: inversores });
        }
        else if (filtro == 'ubicacion') {


            var inversores_oficina = await Oficina.aggregate([
                {
                    $match: {
                        ubicacion: {
                            $geoWithin: {
                                $centerSphere: [[longitud, latitud], radio / 6378.1] // radio en kilómetros 6371
                            }
                        }
                    }
                },

                {
                    $addFields: {
                        "inversoresObjectIds": {
                            $map: {
                                input: "$inversores",
                                as: "inversorId",
                                in: { $toObjectId: "$$inversorId" }
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: "inversors",
                        localField: "inversoresObjectIds",
                        foreignField: "_id",
                        as: "inversoresData"
                    }
                },
                {
                    $match: {
                        "inversoresData.estado": true
                    }
                },
                {
                    $unwind: "$inversoresData"
                },
                {
                    $project: {
                        "nombreOficina": "$nombre",
                        "_id": "$inversoresData._id",
                        "modelo": "$inversoresData.modelo",
                        "voltaje_out": "$inversoresData.voltaje_out",
                        "voltaje_in": "$inversoresData.voltaje_in",
                        "potencia": "$inversoresData.potencia",
                        "potencia_pico": "$inversoresData.potencia_pico",
                        "peso": "$inversoresData.peso",
                        "eficiencia": "$inversoresData.eficiencia",
                        "tipo": "$inversoresData.tipo",
                        "estado": "$inversoresData.estado",
                        "portada": "$inversoresData.portada",
                        "descripcion": "$inversoresData.descripcion",
                    }
                }

            ]);
     
            res.status(200).send({ data: inversores_oficina });

        }
        else if (filtro == "favoritos") {
            // Obtener las empresas favoritas del usuario
            let empresasFavoritas;
            if (req.user.role === 'instalador') {
                const clienteInstalador = await Cliente_Instalador.findById(req.user.sub);
                empresasFavoritas = clienteInstalador.empresas_favoritas;
            } else if (req.user.role === 'empresa') {
                const clienteEmpresarial = await Cliente_Empresarial.findById(req.user.sub);
                empresasFavoritas = clienteEmpresarial.empresas_favoritas;
            }

            const inversores = await Empresa.aggregate([
                { $match: { _id: { $in: empresasFavoritas } } },//Filtro empresas favoritas
                { $unwind: "$oficinas" }, //Desenroollo arreglo de Ofcinas
                {
                    $lookup: {
                        from: 'oficinas', // Busco en oficinas
                        localField: 'oficinas',
                        foreignField: '_id',
                        as: 'oficinas_info'
                    }
                },
                { $unwind: "$oficinas_info" }, //Desenroollo arreglo de  Ofcinas
                { $unwind: "$oficinas_info.inversores" }, //Desenroollo arreglo de  controladores en Ofcinas
                {
                    $lookup: {
                        from: 'inversors', // Busco en controladores
                        localField: 'oficinas_info.inversores',
                        foreignField: '_id',
                        as: 'inversores_info'
                    }
                },
                { $unwind: "$inversores_info" }, // Desenroollo arreglo de controladores_info
                { $match: { "inversores_info.estado": true } }, // Filtrar controladores con estado:true
                {
                    $group: {
                        _id: "$inversores_info._id", // Agrupar por el ID del controlador
                        inversor: { $first: "$inversores_info" }, // Tomar el primer controlador
                        nombreOficina: { $first: "$oficinas_info.nombre" }
                    }
                },
                {
                    $project: {
                        "nombreOficina": "$nombreOficina",
                        "modelo": "$inversor.modelo",
                        "_id": "$inversor._id",
                        "peso": "$inversor.peso",
                        "estado": "$inversor.estado",
                        "voltaje_in": "$inversor.voltaje_in",
                        "potencia": "$inversor.potencia",
                        "potencia_pico": "$inversor.potencia_pico",
                        "eficiencia": "$inversor.eficiencia",
                        "voltaje_out": "$inversor.voltaje_out",
                        "tipo": "$inversor.tipo",
                        "descripcion": "$inversor.descripcion",
                        "propietario": "$inversor.propietario",
                        "portada": "$inversor.portada",
                    }
                }
            ])
            res.status(200).send({ data: inversores });
        }

    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}
//Finaliza prueba de consulta por ubicación

//inicia consulta de inversores no autenticado
const listar_inversores_usuario_guest = async function (req, res) {
    var latitud = parseFloat(req.params['latitud'])
    let longitud = parseFloat(req.params['longitud'])
    let radio = parseInt(req.params['radio'])

    var inversores_oficina = await Oficina.aggregate([
        {
            $match: {
                ubicacion: {
                    $geoWithin: {
                        $centerSphere: [[longitud, latitud], radio / 6378.1] // radio en kilómetros 6371
                    }
                }
            }
        },

        {
            $addFields: {
                "inversoresObjectIds": {
                    $map: {
                        input: "$inversores",
                        as: "inversorId",
                        in: { $toObjectId: "$$inversorId" }
                    }
                }
            }
        },
        {
            $lookup: {
                from: "inversors",// antes panel_solars
                localField: "inversoresObjectIds",
                foreignField: "_id",
                as: "inversoresData"
            }
        },
        {
            $match: {
                "inversoresData.estado": true
            }
        },
        {
            $unwind: "$inversoresData"
        },
        {
            $project: {
                "nombreOficina": "$nombre",
                "_id": "$inversoresData._id",
                "modelo": "$inversoresData.modelo",
                "peso": "$inversoresData.peso",
                "voltaje_in": "$inversoresData.voltaje_in",
                "voltaje_out": "$inversoresData.voltaje_out",
                "potencia": "$inversoresData.potencia",
                "potencia_pico": "$inversoresData.potencia_pico",
                "eficiencia": "$inversoresData.eficiencia",
                "tipo": "$inversoresData.tipo",
                "estado": "$inversoresData.estado",
                "descripcion": "$inversoresData.descripcion",
                "portada": "$inversoresData.portada",
                "propietario": "$inversoresData.propietario",
            }
        }

    ]);

    res.status(200).send({ data: inversores_oficina });
}
// Finaliza Consulta inversores guest

//Inicia Consulta de controladores con filtros
const listar_cotroladores_usuario_ubicacion = async function (req, res) {


    if (req.user) {

        var latitud = parseFloat(req.params['latitud'])
        let longitud = parseFloat(req.params['longitud'])
        let radio = parseInt(req.params['radio'])
        let filtro = req.params['filtro']

        if (filtro == "propios") {
            id = new mongoose.Types.ObjectId(req.user.sub)
            let query = { $and: [{ estado: true }, { propietario: id }] }

            var controladores = await Controladores_Solares.find(query);
            res.status(200).send({ data: controladores });
        }
        else if (filtro == 'ubicacion') {


            var controladores_oficina = await Oficina.aggregate([
                {
                    $match: {
                        ubicacion: {
                            $geoWithin: {
                                $centerSphere: [[longitud, latitud], radio / 6378.1] // radio en kilómetros 6371
                            }
                        }
                    }
                },

                {
                    $addFields: {
                        "controladoresObjectIds": {
                            $map: {
                                input: "$controladores",
                                as: "controladorId",
                                in: { $toObjectId: "$$controladorId" }
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: "controladors",
                        localField: "controladoresObjectIds",
                        foreignField: "_id",
                        as: "controladoresData"
                    }
                },
                {
                    $match: {
                        "controladoresData.estado": true
                    }
                },
                {
                    $unwind: "$controladoresData"
                },
                {
                    $project: {
                        "nombreOficina": "$nombre",
                        "_id": "$controladoresData._id",
                        "modelo": "$controladoresData.modelo",
                        "amperaje": "$controladoresData.amperaje",
                        "input": "$controladoresData.input",
                        "peso": "$controladoresData.peso",
                        "tecnologia": "$controladoresData.tecnologia",
                        "estado": "$controladoresData.estado",
                        "portada": "$controladoresData.portada",
                        "descripcion": "$controladoresData.descripcion",
                    }
                }

            ]);
            //Finaliza Oficinas
            
            res.status(200).send({ data: controladores_oficina });

        }
        else if (filtro == "favoritos") {
            // Obtener las empresas favoritas del usuario
            let empresasFavoritas;
            if (req.user.role === 'instalador') {
                const clienteInstalador = await Cliente_Instalador.findById(req.user.sub);
                empresasFavoritas = clienteInstalador.empresas_favoritas;
            } else if (req.user.role === 'empresa') {
                const clienteEmpresarial = await Cliente_Empresarial.findById(req.user.sub);
                empresasFavoritas = clienteEmpresarial.empresas_favoritas;
            }

            const controladores = await Empresa.aggregate([
                { $match: { _id: { $in: empresasFavoritas } } },//Filtro empresas favoritas
                { $unwind: "$oficinas" }, //Desenroollo arreglo de Ofcinas
                {
                    $lookup: {
                        from: 'oficinas', // Busco en oficinas
                        localField: 'oficinas',
                        foreignField: '_id',
                        as: 'oficinas_info'
                    }
                },
                { $unwind: "$oficinas_info" }, //Desenroollo arreglo de  Ofcinas
                { $unwind: "$oficinas_info.controladores" }, //Desenroollo arreglo de  controladores en Ofcinas
                {
                    $lookup: {
                        from: 'controladors', // Busco en controladores
                        localField: 'oficinas_info.controladores',
                        foreignField: '_id',
                        as: 'controladores_info'
                    }
                },
                { $unwind: "$controladores_info" }, // Desenroollo arreglo de controladores_info
                { $match: { "controladores_info.estado": true } }, // Filtrar controladores con estado:true
                {
                    $group: {
                        _id: "$controladores_info._id", // Agrupar por el ID del controlador
                        controlador: { $first: "$controladores_info" }, // Tomar el primer controlador
                        nombreOficina: { $first: "$oficinas_info.nombre" }
                    }
                },
                {
                    $project: {
                        "nombreOficina":"$nombreOficina",
                        "modelo": "$controlador.modelo",
                        "_id": "$controlador._id",
                        "peso": "$controlador.peso",
                        "amperaje": "$controlador.amperaje",
                        "input": "$controlador.input",
                        "estado": "$controlador.estado",
                        "tecnologia": "$controlador.tecnologia",
                        "descripcion": "$controlador.descripcion",
                        "propietario": "$controlador.propietario",
                        "portada": "$controlador.portada",

                    }
                }
            ])
     
            res.status(200).send({ data: controladores });
        }

    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}
// Finaliza Consulta Controladores con filtros

//inicia consulta de controladores no autenticado
const listar_controladores_usuario_guest = async function (req, res) {
    var latitud = parseFloat(req.params['latitud'])
    let longitud = parseFloat(req.params['longitud'])
    let radio = parseInt(req.params['radio'])

    var controladores_oficina = await Oficina.aggregate([
        {
            $match: {
                ubicacion: {
                    $geoWithin: {
                        $centerSphere: [[longitud, latitud], radio / 6378.1] // radio en kilómetros 6371
                    }
                }
            }
        },

        {
            $addFields: {
                "controladoresObjectIds": {
                    $map: {
                        input: "$controladores",
                        as: "controladorId",
                        in: { $toObjectId: "$$controladorId" }
                    }
                }
            }
        },
        {
            $lookup: {
                from: "controladors",
                localField: "controladoresObjectIds",
                foreignField: "_id",
                as: "controladoresData"
            }
        },
        {
            $match: {
                "controladoresData.estado": true
            }
        },
        {
            $unwind: "$controladoresData"
        },
        {
            $project: {
                "nombreOficina": "$nombre",
                "_id": "$controladoresData._id",
                "modelo": "$controladoresData.modelo",
                "peso": "$controladoresData.peso",
                "amperaje": "$controladoresData.amperaje",
                "input": "$controladoresData.input",
                "tecnologia": "$controladoresData.tecnologia",
                "estado": "$controladoresData.estado",
                "descripcion": "$controladoresData.descripcion",
                "portada": "$controladoresData.portada",
                "propietario": "$controladoresData.propietario",
            }
        }

    ]);

    res.status(200).send({ data: controladores_oficina });
}
// Finaliza Consulta controladores guest



//Inicia Consulta de paneles con filtros
const listar_paneles_usuario_ubicacion = async function (req, res) {
    
    if (req.user) {
        var latitud = parseFloat(req.params['latitud'])
        let longitud = parseFloat(req.params['longitud'])
        let radio = parseInt(req.params['radio'])
        let filtro = req.params['filtro']
        let rol = req.user.role
       
        if (filtro == "propios") {
            id = new mongoose.Types.ObjectId(req.user.sub)
            let query = { $and: [{ estado: true }, { propietario: id }] }
            var paneles = await Paneles_Solares.find(query);

            res.status(200).send({ data: paneles });
            /*
                        if (paneles.length >=1){
                            
                        }else{
                            res.status(500).send({ message: 'No tiene Paneles Registrados' });
                        }
            */

        }
        else if (filtro == 'ubicacion') {
            var paneles_oficina = await Oficina.aggregate([
                {
                    $match: {
                        ubicacion: {
                            $geoWithin: {
                                $centerSphere: [[longitud, latitud], radio / 6378.1] // radio en kilómetros 6371
                            }
                        }
                    }
                },

                {
                    $addFields: {
                        "panelesObjectIds": {
                            $map: {
                                input: "$paneles",
                                as: "panelId",
                                in: { $toObjectId: "$$panelId" }
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: "panels",//Busco en paneles soalres antes panel_solars
                        localField: "panelesObjectIds",
                        foreignField: "_id",
                        as: "panelesData"
                    }
                },
                {
                    $match: {
                        "panelesData.estado": true
                    }
                },
                {
                    $unwind: "$panelesData"
                },
                {
                    $project: {
                        "nombreOficina": "$nombre",
                        "_id": "$panelesData._id",
                        "modelo": "$panelesData.modelo",
                        "potencia": "$panelesData.potencia",
                        "voc": "$panelesData.voc",
                        "isc": "$panelesData.isc",
                        "eficiencia": "$panelesData.eficiencia",
                        "tension": "$panelesData.tension",
                        "vmpp": "$panelesData.vmpp",
                        "impp": "$panelesData.impp",
                        "peso": "$panelesData.peso",
                        "noct": "$panelesData.noct",
                        "tc_of_isc": "$panelesData.tc_of_isc",
                        "tc_of_voc": "$panelesData.tc_of_voc",
                        "tc_of_pmax": "$panelesData.tc_of_pmax",
                        "estado": "$panelesData.estado",
                        "portada": "$panelesData.portada",
                        "descripcion": "$panelesData.descripcion",
                    }
                }

            ]);

            res.status(200).send({ data: paneles_oficina });

        }
        else if (filtro == "favoritos") {

            // Obtener las empresas favoritas del usuario
            let empresasFavoritas;
            if (req.user.role === 'instalador') {
                const clienteInstalador = await Cliente_Instalador.findById(req.user.sub);
                empresasFavoritas = clienteInstalador.empresas_favoritas;
            } else if (req.user.role === 'empresa') {
                const clienteEmpresarial = await Cliente_Empresarial.findById(req.user.sub);
                empresasFavoritas = clienteEmpresarial.empresas_favoritas;
            }
           

            const paneles = await Empresa.aggregate([
                { $match: { _id: { $in: empresasFavoritas } } },//Filtro empresas favoritas
                { $unwind: "$oficinas" }, //Desenroollo arreglo de Ofcinas
                {
                    $lookup: {
                        from: 'oficinas', // Busco en oficinas
                        localField: 'oficinas',
                        foreignField: '_id',
                        as: 'oficinas_info'
                    }
                },
                { $unwind: "$oficinas_info" }, //Desenroollo arreglo de  Ofcinas
                { $unwind: "$oficinas_info.paneles" }, //Desenroollo arreglo de  Paneles en Ofcinas
                {
                    $lookup: {
                        from: 'panels', // Busco en paneles
                        localField: 'oficinas_info.paneles',
                        foreignField: '_id',
                        as: 'paneles_info'
                    }
                },
                { $unwind: "$paneles_info" }, // Desenroollo arreglo de Paneles_info
                { $match: { "paneles_info.estado": true } }, // Filtrar Paneles con estado:true
                {
                    $group: {
                        _id: "$paneles_info._id", // Agrupar por el ID del Panel
                        panel: { $first: "$paneles_info" }, // Tomar el primer panel, para Evitar duplicados
                        nombreOficina: { $first: "$oficinas_info.nombre" }
                    }
                },
                {
                    $project: { 
                        "nombreOficina":"$nombreOficina",
                        "modelo": "$panel.modelo",
                       // "_id": "$panelesData._id",                 
                       "_id": "$panel._id", 
                        "potencia": "$panel.potencia",
                        "voc": "$panel.voc",
                        "isc": "$panel.isc",
                        "eficiencia": "$panel.eficiencia",
                        "tension": "$panel.tension",
                        "vmpp": "$panel.vmpp",
                        "impp": "$panel.impp",
                        "peso": "$panel.peso",
                        "noct": "$panel.noct",
                        "tc_of_isc": "$panel.tc_of_isc",
                        "tc_of_voc": "$panel.tc_of_voc",
                        "tc_of_pmax": "$panel.tc_of_pmax",
                        "estado": "$panel.estado",
                        "portada": "$panel.portada",
                        "descripcion": "$panel.descripcion",

                    }
                }
            ])
         
            res.status(200).send({ data: paneles });
        }

    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}
// Finaliza Consulta paneles con filtros


//Inicia Consulta de paneles con guest
const listar_paneles_usuario_guest = async function (req, res) {
    var latitud = parseFloat(req.params['latitud'])
    let longitud = parseFloat(req.params['longitud'])
    let radio = parseInt(req.params['radio'])

    var paneles_oficina = await Oficina.aggregate([
        {
            $match: {
                ubicacion: {
                    $geoWithin: {
                        $centerSphere: [[longitud, latitud], radio / 6378.1] // radio en kilómetros 6371
                    }
                }
            }
        },

        {
            $addFields: {
                "panelesObjectIds": {
                    $map: {
                        input: "$paneles",
                        as: "panelId",
                        in: { $toObjectId: "$$panelId" }
                    }
                }
            }
        },
        {
            $lookup: {
                from: "panels",// antes panel_solars
                localField: "panelesObjectIds",
                foreignField: "_id",
                as: "panelesData"
            }
        },
       
        {
            $unwind: "$panelesData"
        },
        {
            $match: {
                "panelesData.estado": true
            }
        },
        {
            $project: {
                "nombreOficina": "$nombre",
                "_id": "$panelesData._id",
                "modelo": "$panelesData.modelo",
                "potencia": "$panelesData.potencia",
                "voc": "$panelesData.voc",
                "isc": "$panelesData.isc",
                "eficiencia": "$panelesData.eficiencia",
                "tension": "$panelesData.tension",
                "vmpp": "$panelesData.vmpp",
                "impp": "$panelesData.impp",
                "peso": "$panelesData.peso",
                "noct": "$panelesData.noct",
                "tc_of_isc": "$panelesData.tc_of_isc",
                "tc_of_voc": "$panelesData.tc_of_voc",
                "tc_of_pmax": "$panelesData.tc_of_pmax",
                "estado": "$panelesData.estado",
                "portada": "$panelesData.portada",
                "descripcion": "$panelesData.descripcion",
            }
        }

    ]);

    res.status(200).send({ data: paneles_oficina });
}
// Finaliza Consulta paneles guest


//Inicia Consulta de baterias con filtros
const listar_baterias_usuario_ubicacion = async function (req, res) {

    if (req.user) {
        var latitud = parseFloat(req.params['latitud'])
        let longitud = parseFloat(req.params['longitud'])
        let radio = parseInt(req.params['radio'])
        let filtro = req.params['filtro']
        let rol = req.user.role

        if (filtro == "propios") {

            id = new mongoose.Types.ObjectId(req.user.sub)
            let query = { $and: [{ estado: true }, { propietario: id }] }

            var baterias = await Baterias_Solares.find(query);
            res.status(200).send({ data: baterias });
        }
        else if (filtro == 'ubicacion') {
            var baterias_oficina = await Oficina.aggregate([
                {
                    $match: {
                        ubicacion: {
                            $geoWithin: {
                                $centerSphere: [[longitud, latitud], radio / 6378.1] // radio en kilómetros 6371
                            }
                        }
                    }
                },

                {
                    $addFields: {
                        "bateriasObjectIds": {
                            $map: {
                                input: "$baterias",
                                as: "bateriaId",
                                in: { $toObjectId: "$$bateriaId" }
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: "baterias",
                        localField: "bateriasObjectIds",
                        foreignField: "_id",
                        as: "bateriasData"
                    }
                },
                
                {
                    $unwind: "$bateriasData"
                },

                {
                    $match: {
                        "bateriasData.estado": true
                    }
                },

                {
                    $project: {
                        "nombreOficina": "$nombre",
                        "_id": "$bateriasData._id",
                        "modelo": "$bateriasData.modelo",
                        "voltaje": "$bateriasData.voltaje",
                        "peso": "$bateriasData.peso",
                        "amperaje": "$bateriasData.amperaje",
                        "tecnologia": "$bateriasData.tecnologia",
                        "estado": "$bateriasData.estado",
                        "portada": "$bateriasData.portada",
                        "descripcion": "$bateriasData.descripcion",
                    }
                }

            ]);
          
            res.status(200).send({ data: baterias_oficina });

        }
        else if (filtro == "favoritos") {
            // Obtener las empresas favoritas del usuario
            let empresasFavoritas;
            if (req.user.role === 'instalador') {
                const clienteInstalador = await Cliente_Instalador.findById(req.user.sub);
                empresasFavoritas = clienteInstalador.empresas_favoritas;
            } else if (req.user.role === 'empresa') {
                const clienteEmpresarial = await Cliente_Empresarial.findById(req.user.sub);
                empresasFavoritas = clienteEmpresarial.empresas_favoritas;
            }

            const baterias = await Empresa.aggregate([
                { $match: { _id: { $in: empresasFavoritas } } },//Filtro empresas favoritas
                { $unwind: "$oficinas" }, //Desenroollo arreglo de Ofcinas
                {
                    $lookup: {
                        from: 'oficinas', // Busco en oficinas
                        localField: 'oficinas',
                        foreignField: '_id',
                        as: 'oficinas_info'
                    }
                },
                { $unwind: "$oficinas_info" }, //Desenroollo arreglo de  Ofcinas
                { $unwind: "$oficinas_info.baterias" }, //Desenroollo arreglo de  baterias en Ofcinas
                {
                    $lookup: {
                        from: 'baterias', // Busco en controladores
                        localField: 'oficinas_info.baterias',
                        foreignField: '_id',
                        as: 'baterias_info'
                    }
                },
                { $unwind: "$baterias_info" }, // Desenroollo arreglo de baterias_info
                { $match: { "baterias_info.estado": true } }, // Filtrar batyerias con estado:true
                {
                    $group: {
                        _id: "$baterias_info._id", // Agrupar por el ID del bateriar
                        bateria: { $first: "$baterias_info" }, // Tomar el primer bateria, para Evitar duplicados
                        nombreOficina: { $first: "$oficinas_info.nombre" }
                    }
                },
                {
                    $project: {
                        "nombreOficina": "$nombreOficina",
                        "_id": "$bateria._id",
                        "modelo": "$bateria.modelo",
                        "voltaje": "$bateria.voltaje",
                        "peso": "$bateria.peso",
                        "amperaje": "$bateria.amperaje",
                        "tecnologia": "$bateria.tecnologia",
                        "estado": "$bateria.estado",
                        "portada": "$bateria.portada",
                        "descripcion": "$bateria.descripcion",
                    }
                }
            ])
        
            res.status(200).send({ data: baterias });
        }

    } else {      
        res.status(500).send({ message: 'NoAccess' });
    }
}
// Finaliza Consulta Baterias con filtros

//inicia consulta de baterias no autenticado
const listar_baterias_usuario_guest = async function (req, res) {
   
    var latitud = parseFloat(req.params['latitud'])
    let longitud = parseFloat(req.params['longitud'])
    let radio = parseInt(req.params['radio'])

    var baterias_oficina = await Oficina.aggregate([
        {
            $match: {
                ubicacion: {
                    $geoWithin: {
                        $centerSphere: [[longitud, latitud], radio / 6378.1] // radio en kilómetros 6371
                    }
                }
            }
        },

        {
            $addFields: {
                "bateriasObjectIds": {
                    $map: {
                        input: "$baterias",
                        as: "bateriaId",
                        in: { $toObjectId: "$$bateriaId" }
                    }
                }
            }
        },
        {
            $lookup: {
                from: "baterias",// antes panel_solars
                localField: "bateriasObjectIds",
                foreignField: "_id",
                as: "bateriasData"
            }
        },
        
        {
            $unwind: "$bateriasData"
        },

        {
            $match: {
                "bateriasData.estado": true
            }
        },


        {
            $project: {
                "nombreOficina": "$nombre",
                "_id": "$bateriasData._id",
                "modelo": "$bateriasData.modelo",
                "voltaje": "$bateriasData.voltaje",
                "peso": "$bateriasData.peso",
                "amperaje": "$bateriasData.amperaje",
                "tecnologia": "$bateriasData.tecnologia",
                "estado": "$bateriasData.estado",
                "descripcion": "$bateriasData.descripcion",
                "portada": "$bateriasData.portada",
                "propietario": "$bateriasData.propietario",
            }
        }

    ]);

    res.status(200).send({ data: baterias_oficina });
}
// Finaliza Consulta baterias guest



const obtener_calculo_cliente = async (req, res = response) => {
    if (req.user) {
        var id = req.params['id'];
        try {
            var reg = await Calculo.findById({ _id: id }).populate('panel').populate('bateria').populate('controlador').populate('inversor');
            res.status(200).send({ data: reg });
        } catch (error) {
            res.status(200).send({ data: undefined });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

//Peticion API PVGIS RENDIMIENTO

const consulta_rendimiento_Pvgis = function (req, res) {
    console.log('Rendiiento PvGis')
    lat = req.params.lat
    lon = req.params.lon
    peakpower = req.params.peakpower
    batterysize = req.params.atterysize
    consumptionday = req.params.consumptionday
    cutoff = req.params.cutoff

    //Añado
    angle=15
    aspect=80

    //Sistemas Fotovoltaicos aislados de la red
    const ruta = 'https://re.jrc.ec.europa.eu/api/SHScalc?lat=' + lat + '&lon=' + lon + '&peakpower=' + peakpower + '&batterysize=' + batterysize + '&consumptionday=' + consumptionday + '&cutoff=' + cutoff + '&outputformat=json'
    //const ruta = 'https://re.jrc.ec.europa.eu/api/SHScalc?lat=' + lat + '&lon=' + lon + '&peakpower=' + peakpower + '&batterysize=' + batterysize + '&consumptionday=' + consumptionday + '&cutoff=' + cutoff +'&angle='+angle+'&aspect='+aspect +'&outputformat=json'

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


const consulta_rendimiento_Pvgis_Original = function (req, res) {
    console.log('Rendiiento PvGis')
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

//Listado de electrodomesticos
const listar_electrodomesticos_guest= async function (req, res) {

        let query = { estado: true }
        var electrodomesticos = await Electrodomestico.find(query).populate('categoria');
        res.status(200).send({ data: electrodomesticos });
   
}
//Finaliza listado de electrodomesticos

module.exports = {

    //Rutas cliente administarcion
    obtener_cliente_admin,
    actualizar_cliente_admin,
    eliminar_cliente_admin,


    registro_cliente_guest,
    registro_instalador_guest,
    registro_cliente_empresa_guest,
    login_guest,

    //Rutas usuario
    obtener_usuario_usuario,

    registro_cliente_tienda,
    listar_clientes_tienda,

    registro_cliente,
    login_cliente,
    obtener_cliente_guest,
    actualizar_perfil_cliente_guest,

    get_categorias_publico, //Listar categorias publico

    //Para calculadora soalr
    listar_paneles,
    listar_controladores,
    listar_baterias,


    //Inician Inversorress
    registro_inversor_usuario,
    listar_inversores_usuario,
    actualizar_inversor_usuario,
    eliminar_inversor_usuario,
    obtener_inversor_usuario,

    //Inician Calculos
    registro_calculo_usuario,
    listar_calculos_usuario,
    listar_inversores_usuario_ubicacion,
    listar_cotroladores_usuario_ubicacion,
    listar_paneles_usuario_ubicacion,
    listar_baterias_usuario_ubicacion,
    obtener_calculo_cliente,
    actualizar_calculo_usuario,

    //Empresas Favoritas
    listar_empresas_usuario,
    anadirEmpresaFavorita_usuario,
    eliminar_empresa_favorita_usuario,

    //Cuanod El usuario no esta Autenticado
    listar_paneles_usuario_guest,
    listar_baterias_usuario_guest,
    listar_controladores_usuario_guest,
    listar_inversores_usuario_guest,

    //cONSULTA aPI
    consulta_rendimiento_Pvgis,

    //Notificaciones
    listar_notificaciones_usuario,

    //Listado de electrodomesticos
    listar_electrodomesticos_guest,
}