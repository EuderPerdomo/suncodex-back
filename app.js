'use strict'

var express = require('express');
var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var port = process.env.PORT || 4201;
var app = express();

var server = require('http').createServer(app);

var cliente_routes = require('./routes/cliente');
var admin_routes = require('./routes/admin');
var empresa_routes = require('./routes/empresa');

var panelSolar_routes=require('./routes/panelSolar')
var controlador_routes=require('./routes/controlador')
var inversor_routes=require('./routes/inversor')
var bateria_routes=require('./routes/bateria')

var lampara_routes=require('./routes/lampara')

var blog_routes = require('./routes/blog');
var config_routes = require('./routes/config');


//Cambiar la base de datos a   calculadoraSolar 	

//mongoose.connect('mongodb://127.0.0.1:27017/calculadoraSolar',{useUnifiedTopology: true, useNewUrlParser: true}, (err,res)=>{
mongoose.connect('mongodb://127.0.0.1:27017/calculadoraSolar',{useUnifiedTopology: true, useNewUrlParser: true}, (err,res)=>{
    if(err){  
        throw err;
        console.log(err);
    }else{
        console.log("Corriendo....");
        server.listen(port, function(){
            console.log("Servidor " + port );
        });

    }
});

app.use(bodyparser.urlencoded({limit: '50mb',extended:true}));
app.use(bodyparser.json({limit: '50mb', extended: true}));


app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*'); 
    res.header('Access-Control-Allow-Headers','Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods','GET, PUT, POST, DELETE, OPTIONS');
    res.header('Allow','GET, PUT, POST, DELETE, OPTIONS');
    next();
});

app.use('/api',cliente_routes);
app.use('/api',admin_routes);
app.use('/api',empresa_routes)

app.use('/api',panelSolar_routes)
app.use('/api',controlador_routes)
app.use('/api',inversor_routes)
app.use('/api',bateria_routes)

app.use('/api',lampara_routes)
app.use('/api',blog_routes);
app.use('/api',config_routes)

module.exports = app;