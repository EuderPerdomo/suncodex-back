
 'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var controaldorSchema = new mongoose.Schema({
    controlador_tension:{type:Number,required:true},//Tension de trabajo elegida
    controlador_max_input_power:{type:Number,required:true},//maxima potencia arreglo deacuerdo a la tension seleccionada
    controlador_max_pv_input_voltaje:{type:Number,required:true},// maximo voltaje de entrada soalr soportado
    controlador_cantidad_paralelo:{type:Number,required:true},//cantidad de paneles en paralelo
    minVoltageControlador:{type:Number,required:true},//minimo voltaje necesario calculado
    minCorrienteControlador:{type:Number,required:true},//Minimo amperaje calculado
});

var bateriaSchema = new mongoose.Schema({
    baterias_serie:{type:Number,required:true},
    baterias_paralelo:{type:Number,required:true},
    total_baterias:{type:Number,required:true},
    batterysize:{type:Number,required:true},
    cuttoff:{type:Number,required:true},
});

var inversorSchema = new mongoose.Schema({
    voltaje_in_inversor:{type:Number,required:true},
    voltaje_out_inversor:{type:String, required:true},
    potencia_inversor:{type:Number,required:true},
    potencia_pico_inversor:{type:Number,required:true},
});



var panelSchema = new mongoose.Schema({
    potencia_arreglo_fv:{type:Number, required:true},
    cantidad_paneles:{type:Number,required:true},
    paneles_serie:{type:Number,required:true},
    paneles_paralelo:{type:Number,required:true},
    voltaje_array_fv:{type:Number,required:true},
    amperaje_array_fv:{type:Number,required:true},

});

var CalculoSchema = Schema({
    //Del usuario
    usuario: {type: Schema.ObjectId, ref: 'usuario', required: true},//Usuario que creo el calculo
    panel:{type:Schema.ObjectId,ref:'panel', required:true},//Panel Usado
    inversor:{type:Schema.ObjectId,ref:'inversor', required:true},//Inversor USado
    bateria:{type:Schema.ObjectId,ref:'bateria', required:true},//Bateria usada
    controlador:{type:Schema.ObjectId,ref:'controlador', required:true},//Controlador Usado

    latitud:{type:Number, required: true},
    longitud:{type:Number, required: true},
    tipo:{type:String,required:true}, //Debe indicar si es por potencias, servicio pubblico, o consumos predefinidos
    descripcion:{type:String,required:false}, //Apuntes addicionales que el cliente desee agregar
    autoriza_correccion:{type:Boolean,default:false},// Autoriza a que sea visible por otros usuarios
    nombre:{type:String,required:true}, //Nombre del Calculo
    total_dia:{type:Number, required: true},//total diario
    simultaneo:{type:Number, required: true},//consumo simultaneo
    tension_sistema:{type:Number, required: true},//Tension de trabajo elegida opara el sistema
    
    radio_busqueda:{type:Number, required: true},//Amplitud del radio de busqueda
    filtro:{type:String,required:true},//Tipo de filtro a aplicar a la busqueda, propios,ubicacion, favoritos

    //De las potencias
    potencias:[{type: Object, required: true}], //Potencias utilizadas en el calculo o datos mensuales

    //Del controlador
    resultadoCalculoControlador:[controaldorSchema] ,// info del controlador y caracteristicas seleccionadas 

    //Del Inversor
    resultadoCalculoInversor:[inversorSchema], // info del Inversor y caracteristicas seleccionadas 


    //De los paneles
    resultadoCalculoPanel:[panelSchema], // info del panel y caracteristicas seleccionadas 


    //De las baterias
    resultadoCalculoBateria:[bateriaSchema],  // info de baterias y caracteristicas seleccionadas 

    
    estado:{type:Boolean,default:true}, //Activo o eliminado true/false
    createdAt: {type:Date, default: Date.now, require: true} //fecha de Creación
});

module.exports =  mongoose.model('calculo',CalculoSchema); 