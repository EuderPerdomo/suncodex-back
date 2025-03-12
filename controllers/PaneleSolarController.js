'use strict'
var PanelSolar = require('../models/panel_solar');

var Categoria = require('../models/Categoria');

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

require('dotenv').config();// Para tarer rlas variables de entorno
//Probando con cloudinari
const cloudinary = require('cloudinary').v2
cloudinary.config(process.env.CLOUDINARY_URL)

const listar_paneles = async function (req, res) {
        let query = { estado: true }
        var paneles = await PanelSolar.find(query);
        console.log('listado de paneles')
        res.status(200).send({ data: paneles });
}

module.exports = {
    listar_paneles,
}