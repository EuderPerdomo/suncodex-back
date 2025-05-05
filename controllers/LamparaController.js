
'use strict'
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../helpers/jwt');
var fs = require('fs');
var handlebars = require('handlebars');
var ejs = require('ejs');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var path = require('path');
const { response } = require('express');
const https = require("https");
const Lampara = require('../models/lampara');
const CategoriaLampara = require('../models/CategoriaLampara');


require('dotenv').config();// Para tarer rlas variables de entorno
//Probando con cloudinari
const cloudinary = require('cloudinary').v2
cloudinary.config(process.env.CLOUDINARY_URL)

//Inician Electrodomesticos

const registro_lampara_admin = async function (req, res) {

    if (req.user) {

        let data = req.body;

        let lamparas = await Lampara.find({ nombre: data.nombre });
        if (lamparas.length == 0) {
           // var img_path = req.files.portada.path; >>><Añadir para poner imagen
            //var name = img_path.split('\\');
            // var portada_name = name[2];

            //const { secure_url } = await cloudinary.uploader.upload(img_path) >>><Añadir para poner imagen

          //data.portada = secure_url; //>>>Añadir para poner imagen
            let reg = await Lampara.create(data);
            res.status(200).send({ data: reg });
        } else {
            res.status(200).send({ data: undefined, message: 'El Modelo de Lampara ya existe' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}


const registro_categoriaLampara_admin = async function (req, res) {
    if (req.user) {
        let data = req.body;
        let categorias = await CategoriaLampara.find({ nombre: data.nombre });

        if (categorias.length == 0) {
            let reg = await CategoriaLampara.create(data);
            res.status(200).send({ data: reg });
        } else {
            res.status(200).send({ data: undefined, message: 'La categoria ya existe' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

const listar_lamparas_guest= async function (req, res) {
        let query = { estado: true }
        var lamparas = await Lampara.find(query).populate('categoria');
        res.status(200).send({ data: lamparas });
   
}
//Listado de lamparas cliente
const listar_lamparas_public= async function (req, res) {
    var filtro=req.params['filtro']
        let query = { estado: true }
        var lamparas = await Lampara.find(query).populate('categoria');
        res.status(200).send({ data: lamparas });
   
}

const obtener_lampara_public = async function (req, res) {
    var slug = req.params['slug'];

    try {
        var reg = await Lampara.findOne({ slug: slug }).populate('categoria');
        res.status(200).send({ data: reg });
    } catch (error) {
        res.status(200).send({ data: undefined });
    }
  }
/*
listar_electrodomesticos_admin = async function (req, res) {
    if (req.user) {
        let query = { estado: true }
        var electrodomesticos = await Electrodomestico.find(query).populate('categoria');
        res.status(200).send({ data: electrodomesticos });
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
*/
//Finalizan Electrodomesticos

module.exports={
    registro_lampara_admin,
    listar_lamparas_guest,

    //Categorias Lamparas
    registro_categoriaLampara_admin,

    //Llamado de lamparas cliente
    listar_lamparas_public,
    obtener_lampara_public,
}