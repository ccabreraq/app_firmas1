var createError = require('http-errors');
var express = require('express');
var path = require('path');
var request = require("request");

var cookieParser = require('cookie-parser');
var logger = require('morgan');
const multer = require('multer');
var mongoose = require('mongoose');
var Resource = require('resourcejs');
var cors = require('cors')
 var bodyParser = require('body-parser');    
var phantomJsCloud = require("phantomjscloud");
var fs = require('fs');

const carbone = require('carbone');
var convertapi = require('convertapi')('UWYxOg2XOY7eboVI');

const { PDFDocument } = require('pdf-lib');
var generate = require('generate-schema');
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);

var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

var owncloud = require('js-owncloud-client');
var rurl = 'https://pre.dinicloud.transfiriendo.com/';
var rurlwebdav = rurl + "remote.php/webdav/";

var oc = new owncloud(rurl);
oc.login('Adm_000000000', 'casaauto');
//var clientx = createClient(rurlwebdav,'Adm_000000000', 'casaauto');


  var app = express();


const storage = multer.diskStorage({
    destination:path.join(__dirname,'public/uploads'),
    filename:(req,file,cb)=>{
        //cb(null,file.originalname);
        cb(null,"user1"+"_aa.pdf");
    }
});
//var storage = multer.memoryStorage()

var upload = multer({ storage: storage })
var upload1 = multer()



mongoose.connect('mongodb://datosg:ccabreraq12@ds029901.mlab.com:29901/datosg');



// load the database models
const Firma_doc = require('./mongoose/doc-model')
const Puntos = require('./mongoose/puntos-model')
const Users = require('./mongoose/user-model')
const Formatos = require('./mongoose/formato-model')
const Templates = require('./mongoose/template-model')
const Cupos = require('./mongoose/cupos-model')



// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
//app.use('/users', usersRouter);

// catch 404 and forward to error handler
//app.use(function(req, res, next) {
//  next(createError(404));
//});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(cors({
			 //exposedHeaders: ['X-Total-Count', 3],

			}));



Resource(app, '', 'puntos', Puntos).rest();
Resource(app, '', 'users', Users).rest({
  before: function(req, res, next) {
    console.log(req.body)
	next();
  }
});
Resource(app, '', 'formatos', Formatos).rest();
Resource(app, '', 'templates', Templates).rest();


Resource(app, '', 'firma_doc', Firma_doc).rest({
  afterPost: function(req, res, next) {
	  
		//var remotePath = request.query.remotePath;
		//var localPath = request.query.localPath;
		//var keepMTime = request.query.keepMTime;
		var file = req.body.nombre

        console.log(req.body)
		oc.files.putFile('/dos/uploads/'+file+'.pdf', './public/uploads/user1_aa.pdf').then(status => {
			res.status(200).send(err);
			//response.send(status);
			
		}).catch(error => {
			res.status(500).send(error);
			//response.send(error);
		});	  
		  
		//fs.copyFile('./public/uploads/user1_aa.pdf', './public/uploads/user1_archivo.pdf', (err) => {
		//  if (err) throw err;
		//  console.log('archivo copiado')
		//  //return res.status(200).send({});
		//}); 
        next()		
	  }
});	

Resource(app, '', 'cupos', Cupos).rest();


async function gen_pdf(file,rect,email) {

    var apiKey = 'ak-e1b1d-chnt0-ra0y7-yemfh-ahrdt'; //leave undefined to use a demo key.  get a free key at https://Dashboard.PhantomJsCloud.com
    console.log("qqq")
 //   var myPromise = () => {
 //      return new Promise((resolve, reject) => {

			var browser = new phantomJsCloud.BrowserApi(apiKey);
			
			const file_name = file+'.pdf'

            console.log(file_name)
			var pageRequest = { url:"https://app-firmas1.herokuapp.com/index4.html?file="+file_name+"&datos="+JSON.stringify(rect), renderType: "pdf",renderSettings: {pdfOptions: {format: "Letter",emulateMedia:"print"}} };
			//   var pageRequest = { url:'https://app-firmas1.herokuapp.com/index4.html?file=user1_archivo.pdf&datos=[{"type":"area","x":38.34586466165413,"y":629.3233082706766,"width":539.0977443609023,"height":64.66165413533838,"backgroundColor":"red","status":"firmado","class":"Annotation","uuid":"17cce481-bb0e-4fda-a8c5-a4499a376968","page":1,"content":{"cedula":"79299848","nombres":"Carlos ","apellidos":"Cabrera","celular":"3204903664","email":"ccabreraq@gmail.com","status":"firmado","fecha":"2020-07-13T02:48:00.781Z"}},{"type":"area","x":41.35338345864662,"y":711.2781954887217,"width":534.5864661654135,"height":65.41353383458659,"backgroundColor":"red","status":"firmado","class":"Annotation","uuid":"1bb2582e-da01-490a-a384-e97db146a7cf","page":1,"content":{"cedula":"79299847","nombres":"Santiago","apellidos":"Cabrera","celular":"3204903664","email":"ccabrera@transfiriendo.com","status":"firmado","fecha":"2020-07-13T03:20:42.010Z"}}]', renderType: "pdf",renderSettings: {pdfOptions: {format: "Letter",emulateMedia:"print"}} };

			   //console.log("about to request page from PhantomJs Cloud.  request =", JSON.stringify(pageRequest, null, "\t"));
			browser.requestSingle(pageRequest, function (err, userResponse) {
				//console.log("qqqqqwwww")
				if (userResponse.statusCode != 200) {
					console.log(" errror invalid status code" + userResponse.statusCode);
					reject("err") 
					return ("error")
				} else {
					console.log("userResponse.content")
					
				
					fs.writeFile("public/uploads/prueba1.pdf", userResponse.content.data, {
						encoding: userResponse.content.encoding,
						
                        //resolve("ok");	
						
						
					}, function (err) {
						console.log("captured page written to " + userResponse.content.name);
                        //resolve("erro");				
						
					});
					//resolve(userResponse.content.data);
					//console.log(userResponse.content.data)
					
					// ojo debo enviar correo a todos los firmantes copiandoles el documento pdf firmado digitalmente
					var mensajesms1 = "se envia documento final, del proceso de firmas"
                     console.log(email)
        			f_mail(mensajesms1,email,userResponse.content.data);

					
					return userResponse.content.data

				}
			});
	   //})
    //};
	
   //var result = await myPromise();
   ////console.log(result)
   ////continue execution
   //return result;   
	
};

	app.post('/cambia_pass', function(request, response) {

	var hash = bcrypt.hashSync(request.body.pass1, salt);
	//var reg = request.body
	//reg.encryptedPassword = hash;
	
		//Users.replaceOne({_id: request.body.id}, reg, 
		//		  null, function (err, docs) { 
		//	if (err){ 
		//		console.log(err) 
		//	} 
		//	else{ 
		//		console.log("Original Doc : ", docs); 
		//	} 
		//}); 		
		//response.send(200);
		
		var logica = true;
		// logica previa
		if (logica) {
			Users.updateOne(
			  {_id: request.body.id},{encryptedPassword: hash}
			).then((rawResponse) => {
				console.log(rawResponse)
				response.status(200).send(rawResponse);
			})
			.catch((err) => {
			  // manejar error
			  response.status(500).send(err);
			});		
		} else {
		    response.status(400).send("error de logica");	
		}
		
	});	


	app.post('/upload', upload.single('file'), (req, res) => {
	  if (!req.file.mimetype.startsWith('application/*')) {
		  console.log(req.file)
		  
			//oc.files.putFileContents('/dos/aa.pdf', req.file.buffer).then(status => {
			//	//response.send(status);
			//	console.log(status)
			//}).catch(error => {
			//	//response.send(error);}
			//	console.log(error)
			//});
		  
		  
		//return res.status(422).json({
		//  error :'El archivo debe ser PDF'
		//});
	  }

	  //const dimensions = sizeOf(req.file.path);
	  //
	  //if ((dimensions.width < 640) || (dimensions.height < 480)) {
	  //  return res.status(422).json({
	//	  error :'The image must be at least 640 x 480px'
	//	});
	//  }
	 //
	  return res.status(200).send(req.file);
	});
	
	app.get('/getFileContents', function(request, response) {
		//var remotePath = request.query.remotePath;
		var file = request.query.file;
		console.log(file)
		
		if (file !== 'uploads/user1_aa.pdf') {

			oc.files.getFile('/dos/'+file, 'public/'+file).then(status => {
				response.send(status);
			}).catch(error => {
				response.send(error);
			});
		} else {
			response.send(true);
		}

		//oc.files.getFileContents('/dos/node-js-upload-file-to-server.pdf').then(content => {
		//	response.send(content);
		//}).catch(error => {
		//	response.send(error);
		//});
	});	
	
	app.get('/getFile', function(request, response) {
		var remotePath = request.query.remotePath;
		var localPath = request.query.localPath;


		oc.files.getFile(remotePath, localPath).then(status => {
			response.send(status);
		}).catch(error => {
			response.send(error);
		});
	});	
	
	app.post("/firma_doc_per", bodyParser.json(), function(req, res){
		console.log(req.body);
						
		var clave = req.body._id;
		var vuuid = req.body.uuid;
		var vdatos = req.body.datos;  // son los datos capturados en el cuadro de la firma del respectivo firmante
		
		Firma_doc.find({_id: clave}).
		  then(reg_docg => {              
			console.log(reg_docg); // 'A'

			var reg_doc = reg_docg[0];
            var content = {};
			var cel = "";
			var cedula = "";
			var y;
			var rect = reg_doc.rect;
			var firmantes = reg_doc.firmantes

			for (y of firmantes) {
				  if (vuuid == y.annotation) {
					 //vstatus = rect.status  
					 cel = y.content.celular
					 cedula = y.content.cedula					 
				  }
			}
			envia3()
			async function envia3() {
			  // se envia sms y se verifica  cedula
			  var verifica_otp = await f_verifica_otp(vuuid,vdatos.ping);
			  console.log(verifica_otp)
			  
			if (cedula == vdatos.cedula && verifica_otp.esExitoso) {  

			
				// recooro vetor de personas buscando el que debe cambia
				var x;
				var cant_firmantes = 0
				var mail = ""

				for (x of firmantes) {
						  cambia_firmantes(x, clave);;
				}

				// recorro vector de rect buscando el que debo cambiar, lo cambio y dejo el vector listo para rememplazar
				//var y;
				for (y of rect) {
						  cambia_rect(y, clave);;
				}
				
				  async function cambia_firmantes(reg, clave) {						  
					  if (vuuid == reg.annotation) {
						 reg.content.status = 'firmado' 
						 reg.content.fecha = new Date(); 
						 content = reg.content
						 mail = reg.content.email
					  }
					  if (reg.content.status == 'firmado') {
						 cant_firmantes = cant_firmantes + 1; 
					  }
						 //mail = mail+","+reg.content.email
			  
				  }

				  async function cambia_rect(reg, clave) {						  
					  if (vuuid == reg.uuid) {
						 reg.status = 'firmado' 
						 reg.content = content;
					  }
				  }
				  
				// reviso si ya se firmaron todos los personas y si es asi cambio el status del registro,
				var vstatus = reg_doc.status
				if ( reg_doc.num_firmantes == cant_firmantes ) {
					// ojo debo generar el pdf final
					gen_pdf(reg_doc.nombre, reg_doc.rect,mail)  // devo enviar el documento t el registro de firmas
					// ojo debo firmarlo digitalmente 
					// evaluar, poner a el documento en cada caja el dia y la hora de la firma digital y qr de verificacion
					

					vstatus = "finalizado"
				}
				// tengo que cambiar el total de firmas ya realizadas
				reg_camb = {status: vstatus, rect: reg_doc.rect, firmantes: reg_doc.firmantes, num_firmados: cant_firmantes}
				
				Firma_doc.updateOne(
				  {_id: clave},
				  //{status: "en firmas",firmantes[0].content.status: "enviado"}
				  //{status: "en firmas"}
				  reg_camb
				).then((rawResponse) => {
					console.log(rawResponse)
					res.status(200).send(rawResponse);

				})
				.catch((err) => {
				  // manejar error
				  res.status(500).send(err);
				});		
			
			} else {
				  res.status(200).send("err");
				
			}
			}
			
		  })				
		// cambia status a "en firmas"
		
		
		//res.status(200).send();
	})

	app.post("/verifica_firma_per", bodyParser.json(), function(req, res){
		console.log(req.body);
				
		var clave = req.body._id;
		var vuuid = req.body.uuid;
		var  vstatus = "";
		var cel = ""
		
		
		Firma_doc.find({_id: clave}).
		  then(reg_docg => {              
			console.log(reg_docg); // 'A'

			var reg_doc = reg_docg[0];
            var content = {}
			
			// recorro vector de rect buscando el que debo cambiar, lo cambio y dejo el vector listo para rememplazar
			var rect = reg_doc.rect;
			
			var firmantes = reg_doc.firmantes
			var y;

			for (y of firmantes) {
				  if (vuuid == y.annotation) {
					 vstatus =y.content.status  
					 cel = y.content.celular
					 cedula = y.content.cedula					 
				  }
			}
			
			
			//for (y of rect) {
			//		  cambia_rect1(y, clave);;
			//}
			//
			//  async function cambia_rect1(reg, clave) {						  
			//	  if (vuuid == reg.uuid) {
			//		 vstatus = reg.status  
			//		 cel = reg.content.celular
			//	  }
			//  }
			
			  console.log(vstatus)
			if ( vstatus === "firmado") {
				res.status(200).send("OK");
				
			} else {
				
	    	  async function envia2() {
				  // se envia sms y se verifica  cedula
				  var env_otp = await f_otp(vuuid,"57"+cel);
				  console.log(env_otp)
			  }
			  envia2();
			  
			
				res.status(200).send("NO");			
			}
		  })				
		
		
		//res.status(200).send();
	})
	
	
	app.post("/inicia_firmas", bodyParser.json(), function(req, res){
		console.log(req.body);				
		var clave = req.body._id
		
		// inicia logica de negocio, aca seria el contro si tiene habilitacion para el servicio
		var logicaok = false;
		var tipo = {}
		var tipos_cupos
		run_cupos().catch(err => console.log(err));

		async function run_cupos() {
			var xreg_cupo = await Cupos.findOne({id_usuario: req.body.usuario}).exec();	    
			tipos_cupos = xreg_cupo.tipo
			console.log(xreg_cupo)
			for (x of tipos_cupos) {
				console.log(xreg_cupo[x])

				if (xreg_cupo[x] > 0) {
                   logicaok = true;
				   tipo[x] = xreg_cupo[x] -1

				}				
			}

		
			if (logicaok) {
			
				var firmantes = req.body.firmantes
				var x;

				for (x of firmantes) {
						  envia1(x);;
				}
				
				// dispara mail o sms de conexion del firmante con el link a el proceso de verificar documento y firmarlo
				  async function envia1(reg) {
					  
					  console.log("aaaaaaaaaaareg")
				  
					var mensajesms1 = "mensaje para firma de documento "+"https://app-frimas1-from.herokuapp.com/#/Baz/"+clave+"/"+reg.annotation
					var env_sms = await f_sms(mensajesms1,"57"+reg.content.celular);
					var env_mail = await f_mail(mensajesms1,reg.content.email,"");
					//var env_mail = await f_mail(reg,req.body )
					console.log(env_sms)
					console.log(env_mail)
				  }
				
				
				// cambia status a "en firmas"
				
				Firma_doc.updateOne(
				  {_id: clave},
				  //{status: "en firmas",firmantes[0].content.status: "enviado"}
				  {status: "en firmas"}
				).then((rawResponse) => {
					
					Cupos.updateOne(
					  {_id: xreg_cupo._id},
					  //{status: "en firmas",firmantes[0].content.status: "enviado"}
					  tipo
					).then((rawResponse) => {
						
						
						
						res.status(200).send(rawResponse);

					})
					.catch((err) => {
					  // manejar error
					  res.status(500).send(err);
					});		

					
					//res.status(200).send(rawResponse);

				})
				.catch((err) => {
				  // manejar error
				  res.status(500).send(err);
				});		
				
			} else {
				res.status(400).send("no se perimite la transaccion");
				
			}
		}
				
	})
	
	app.post("/agrega_pagina", bodyParser.json(), function(req, res){
	

		run().catch(err => console.log(err));

		async function run() {
		  // Load cover and content pdfs
		  const cover = await PDFDocument.load(fs.readFileSync('./public/uploads/user1_aa.pdf'));
		  const content = await PDFDocument.load(fs.readFileSync('./public/uploads/pagina_firmas.pdf'));

		  // Create a new document
		  const doc = await PDFDocument.create();

		  // Add the cover to the new doc
		  const coverPage = await doc.copyPages(cover,cover.getPageIndices());
		  for (const page of coverPage) {
			doc.addPage(page);
		  }

		  // Add individual content pages
		  const contentPages = await doc.copyPages(content, content.getPageIndices());
		  for (const page of contentPages) {
			doc.addPage(page);
		  }

		  // Write the PDF to a file
		  await fs.writeFileSync('./public/uploads/user1_aa.pdf', await doc.save());
		  res.status(200).send({});
		  
		}	
	
	})
	
	app.get("/get/b", function(req, res){
		//console.log(req);
		gen_pdf()
		res.send("GET res sent from webpack dev server")
	})
	

	app.get("/crea_schema1", function(req, res){
		
        var Templatex = req.query.template;
		var Formatox = req.query.formato;
		Templates.find({nom_template: Templatex}).
		  then(reg_template => {  
                var xmodelo = reg_template[0]
                 //console.log(xmodelo.usuario)
				var entity = [{
				  "branchAddr1": "value1",
				  "branchAddr2": "value2",
				  "branchState": "value3",
				  "branchZIP": "value4",
				  "branchPhone": "value5",
				  "branchEmail": "value6",
				  "companyDivision": "value7",
				  "returnAddr1": "value8",
				  "returnAddr2": "value9",
				  "returnState": "value10",
				  "returnZIP": "value11",
				  "returnDate": "value12",
				  "employeeName": "value13",
				  "positionTitle": "value14",
				  "includeReportingPerson": "true",
				  "reportingPersonName": "value15",
				  "reportingPersonTitle": "value16",
				  "positionLocation": "value17",
				  "salary": "value18",
				  "paymentFrequency": "value19",
				  "firstPaymentDate": "value20",
				  "annualLeaveDays": "value21",
				  "weeklyHours": "value22",
				  "probationNoticePeriod": "value23",
				  "noticePeriod": "value24",
				  "includeConf": "true",
				  "includeOutside": "true",
				  "includeAfterLeaving": "true",
				  "restraintPeriod": "value25"
				}];
			var schema = generate.json(Templatex+'  -  '+Formatox, entity)
			res.send ({schema:schema.items})
		  })
	})
	
	app.post("/crea_template1", bodyParser.json(), function(req, res){


	  var clave = req.body._id
		

		run().catch(err => console.log(err));

		async function run() {
			var xtemp = await Templates.find({ nom_template: req.body.nom_template}).exec();
            var xdata = JSON.stringify({"accessKey":"ZDRiNGJlNTUtNzNjYS00ZjY1LThkMWQtODg1ZTA4NzBkZDJkOjc3MTM4MDA","templateName":'ContractTemplate.docx', "outputName":"result.pdf", "data":req.body.datos})
             //console.log(xtemp)
			var env_template = await f_template_doc(xdata);
			console.log(env_template)
		  // Write the PDF to a file
		   await fs.writeFileSync('./public/uploads/user1_aa.pdf', await env_template);
		   res.status(200).send({pdf:env_template});
		  
		}	
	
	})
	
	app.get("/crea_schema", function(req, res){
		
        var Templatex = req.query.template;
		var Formatox = req.query.formato;
		Templates.find({nom_template: Templatex}).
		  then(reg_template => {  
                var xmodelo = reg_template[0]
                 //console.log(xmodelo.usuario)
				var entity = [{
				  "firstname": "value1",
				  "lastname": "value2"
				}];
			var schema = generate.json(Templatex+'  -  '+Formatox, entity)
			res.send ({schema:schema.items})
		  })
	})
	
	
app.post("/crea_template", bodyParser.json(), function(req, res){
	
	   //////////////////////////// generacion de docx con variables
      var data = req.body.datos
	  var clave = req.body.id
	  var firmantes = req.body.firmantes

	  carbone.render('./public/prueba1.docx', data, function(err, result){
		if (err) {
		  //return console.log(err);
		  console.log(err)
		}
		// write the result
		fs.writeFileSync('./public/result1.docx', result);
		
		//////////////////////// conversor de docx to pdf
		
		convertapi.convert('pdf', { File: './public/result1.docx' })
		  .then(function(result) {
			// get converted file url
			console.log("Converted file url: " + result.file.url);

			// save to file
			return result.file.save('./public/uploads/user1_aa.pdf');
			//res.status(200).send({pdf:result.file.save('./public/result1.pdf')})
		  })
		  .then(function(file) {
			console.log("File saved: " + file);
			
			/////////////////////////////////// crea registro de documento
			// ojo 
			//nombre  - tenemos que ponerle un nombre al archivo, una descricion tambien, y otros
			// url no se cual poner
			// rect// firmantes
			// numero de firmantes es la suma de los firmantes
			  var registro = {usuario: clave, nombre:'prueba2',descripcion:'prueba2 - cedula xx',otro:'',url:'',fecha_creacion:new Date(), rect:req.body.rect ,firmantes:firmantes, status: 'sin iniciar', num_firmantes:firmantes.length , num_firmados:0 , html: ''}
               
               var options = { method: 'POST',
                  url: "https://app-frimas1-from.herokuapp.com/firma_doc",

                  body: JSON.stringify(registro),
				  headers: {
                    //'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXByZXNhIjoiOTAxMTU4NzQ4IiwidXN1YXJpbyI6InVzckVudGVySWQiLCJmZWNoYSI6IjMwLzAzLzIwMjAgNTo0NzozMiBwLiBtLiJ9.aecPmVvFLIQzi-d9fBPQ9G5lP4vsW0ooOzbiF35r9mE',
					'Content-Type': 'application/json'
				  }				  
                 };
	
	            console.log(options)
					request(options, (error, response, body) => {
					  if (response) {
						  
						//var dato1 = JSON.parse(body); 
						//console.log(body)
						//var dato1 = JSON.parse(datoxx17);
						
						//return resolve(body);
						res.status(200).send({pdf:""})
						
					  }
					  if (error) {
						//return reject(error);
						res.status(500).send(error);
					  }
					});  
			
		  })
		  .catch(function(e) {
			console.error(e.toString());
			res.status(500).send(e);
		  });	
		
		

	  });
	
	
	
})
	
	///////////////////////////////////////////////////// funciones generales /////////////////////////////////////////////////////////	
	// genera pdf de template y datos enviados
	const f_template_doc = function(mensaje) {

              
                // llamo funcion de verificacion de vigencia de poliza

                  if (process.env.NODE_ENV == 'produccion') {
					  var vurl = 'https://us.dws3.docmosis.com/api/render';
                  }else{
					  var vurl = 'https://us.dws3.docmosis.com/api/render';

                  }


                var options = { method: 'POST',
                  url: vurl,
                  body: mensaje,
				  headers: {
					//'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJlbXByZXNhIjoiMTIzNDU2Nzg5IiwidXN1YXJpbyI6Imlkb2N1bWVudG9zdXNlciIsImZlY2hhIjoiMzAvMTAvMjAxOSA0OjM3OjA1IGEuIG0uIn0.ZzLu6G7_r4Snyhk4ev_tBFpSuKBZUO0M4yN__Qrkam3puwnZ2ZqP2zHlATZD29nCH7mWS_K1Cl5FgzPReoA_Zg',
                    //'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXByZXNhIjoiOTAxMjg1NDY2IiwidXN1YXJpbyI6InVzcnZlc2VndXJvIiwiZmVjaGEiOiIzMC8wMy8yMDIwIDU6NDc6MzIgcC4gbS4ifQ.VzCWa5I9Clyx6ubf8dpikq2JKa0PvtWMsrcb1FGdhV4',
                    //'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXByZXNhIjoiOTAxMTU4NzQ4IiwidXN1YXJpbyI6InVzckVudGVySWQiLCJmZWNoYSI6IjMwLzAzLzIwMjAgNTo0NzozMiBwLiBtLiJ9.aecPmVvFLIQzi-d9fBPQ9G5lP4vsW0ooOzbiF35r9mE',
					'Content-Type': 'application/json'
				  }				  
                 };
				 console.log(options)
				  return new Promise((resolve, reject) => {
	
					request(options, (error, response, body) => {
					  if (response) {
						  
						//var dato1 = JSON.parse(body); 
						//console.log(body)
						//var dato1 = JSON.parse(datoxx17);
						return resolve(body);
						
					  }
					  if (error) {
						return reject(error);
					  }
					});  
							  
				  }); 
				 
				 

	};	
	// envio sms por infobit 
	const f_sms = function(mensaje,numero) {

              
		//var dataxx7 ='{ "NumberPlate":"'+ result.Vehicle.NumberPlate+'"}';
        var dataxx7 = '{"identificadorTransaccion":"xxx",'+
		 '"perfil":"enter-id",'+
		 '"destinatario":['+numero+'],'+
		 '"canal":"sms",'+
		 '"mensaje":"'+mensaje+'",'+
		 '"argumentosPersonalizados":{"nit":"12345"}}'  


		 
		 //console.log(dataxx7)
                

                // llamo funcion de verificacion de vigencia de poliza

                  if (process.env.NODE_ENV == 'produccion') {
                      //var vurl = 'https://pre-idocumentos-mensajeria.azurewebsites.net/api/mensajeria/enviar';
					  var vurl = 'https://pro-apis-mensajeria-transfiriendo.azurewebsites.net/api/mensajeria/enviar';
                  }else{
                     // var vurl = 'http://pruebas.seguros.transfiriendo.com:8090/soatnetseapi/api/Vehicle/GetVehicle';
                      //var vurl = 'https://pre-idocumentos-mensajeria.azurewebsites.net/api/mensajeria/enviar';
					  var vurl = 'https://pro-apis-mensajeria-transfiriendo.azurewebsites.net/api/mensajeria/enviar';

                  }


                var options = { method: 'POST',
                  url: vurl,
                  body: dataxx7,
				  headers: {
					//'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJlbXByZXNhIjoiMTIzNDU2Nzg5IiwidXN1YXJpbyI6Imlkb2N1bWVudG9zdXNlciIsImZlY2hhIjoiMzAvMTAvMjAxOSA0OjM3OjA1IGEuIG0uIn0.ZzLu6G7_r4Snyhk4ev_tBFpSuKBZUO0M4yN__Qrkam3puwnZ2ZqP2zHlATZD29nCH7mWS_K1Cl5FgzPReoA_Zg',
                    //'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXByZXNhIjoiOTAxMjg1NDY2IiwidXN1YXJpbyI6InVzcnZlc2VndXJvIiwiZmVjaGEiOiIzMC8wMy8yMDIwIDU6NDc6MzIgcC4gbS4ifQ.VzCWa5I9Clyx6ubf8dpikq2JKa0PvtWMsrcb1FGdhV4',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXByZXNhIjoiOTAxMTU4NzQ4IiwidXN1YXJpbyI6InVzckVudGVySWQiLCJmZWNoYSI6IjMwLzAzLzIwMjAgNTo0NzozMiBwLiBtLiJ9.aecPmVvFLIQzi-d9fBPQ9G5lP4vsW0ooOzbiF35r9mE',
					'Content-Type': 'application/json'
				  }				  
                 };
				 
				  return new Promise((resolve, reject) => {
	
					request(options, (error, response, body) => {
					  if (response) {
						  
						var dato1 = JSON.parse(body); 
						//console.log(dato1)
						//var dato1 = JSON.parse(datoxx17);
						return resolve(dato1);
						
					  }
					  if (error) {
						return reject(error);
					  }
					});  
							  
				  }); 
				 
				 

	};	

	// envio sms por infobit 
	const f_mail = function(mensaje,mail,adjunto) {

     if (adjunto === "") {      
        var dataxx7 = '{"identificadorTransaccion":"xxx",'+
		 '"perfil":"enter-id",'+
 		 '"destinatario":["'+mail+'"],'+
		 '"canal":"EMAIL",'+
		 '"mensaje":{"asunto":"notificacion para firma de documento","cuerpo":"por favor entrar a este enlace:  '+mensaje+'"}}'
	 } else {
        var dataxx7 = '{"identificadorTransaccion":"xxx",'+
		 '"perfil":"enter-id",'+
 		 '"destinatario":["'+mail+'"],'+
		 '"canal":"EMAIL",'+
		 '"mensaje":{"asunto":"envio de documento final firmado por las partes","cuerpo":": '+mensaje+'"},'+
		 '"adjuntos":[{"nombre":"documento.pdf","contenido":"{{'+adjunto+'}}"}]}'       

	 }	 
		 
		 //console.log(mensaje)
		 
		 //console.log(dataxx7)
                

                // llamo funcion de verificacion de vigencia de poliza

                  if (process.env.NODE_ENV == 'produccion') {
                      //var vurl = 'https://pre-idocumentos-mensajeria.azurewebsites.net/api/mensajeria/enviar';
					  var vurl = 'https://pro-apis-mensajeria-transfiriendo.azurewebsites.net/api/mensajeria/enviar';
                  }else{
                     // var vurl = 'http://pruebas.seguros.transfiriendo.com:8090/soatnetseapi/api/Vehicle/GetVehicle';
                      //var vurl = 'https://pre-idocumentos-mensajeria.azurewebsites.net/api/mensajeria/enviar';
					  var vurl = 'https://pro-apis-mensajeria-transfiriendo.azurewebsites.net/api/mensajeria/enviar';

                  }


                var options = { method: 'POST',
                  url: vurl,
                  body: dataxx7,
				  headers: {
					//'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJlbXByZXNhIjoiMTIzNDU2Nzg5IiwidXN1YXJpbyI6Imlkb2N1bWVudG9zdXNlciIsImZlY2hhIjoiMzAvMTAvMjAxOSA0OjM3OjA1IGEuIG0uIn0.ZzLu6G7_r4Snyhk4ev_tBFpSuKBZUO0M4yN__Qrkam3puwnZ2ZqP2zHlATZD29nCH7mWS_K1Cl5FgzPReoA_Zg',
                    //'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXByZXNhIjoiOTAxMjg1NDY2IiwidXN1YXJpbyI6InVzcnZlc2VndXJvIiwiZmVjaGEiOiIzMC8wMy8yMDIwIDU6NDc6MzIgcC4gbS4ifQ.VzCWa5I9Clyx6ubf8dpikq2JKa0PvtWMsrcb1FGdhV4',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXByZXNhIjoiOTAxMTU4NzQ4IiwidXN1YXJpbyI6InVzckVudGVySWQiLCJmZWNoYSI6IjMwLzAzLzIwMjAgNTo0NzozMiBwLiBtLiJ9.aecPmVvFLIQzi-d9fBPQ9G5lP4vsW0ooOzbiF35r9mE',
					'Content-Type': 'application/json'
				  }				  
                 };
				 
				  return new Promise((resolve, reject) => {
	
					request(options, (error, response, body) => {
					  if (response) {
						  
						var dato1 = JSON.parse(body); 
						console.log(dato1)
						//var dato1 = JSON.parse(datoxx17);
						return resolve(dato1);
						
					  }
					  if (error) {
						return reject(error);
					  }
					});  
							  
				  }); 
				 
				 

	};		
	
	const f_otp = function(clave,numero) {

              
		//var dataxx7 ='{ "NumberPlate":"'+ result.Vehicle.NumberPlate+'"}';
        var dataxx7 = '{"identificadorTransaccion":"xxx",'+
		 '"plantilla":"OTP simple",'+
		 '"TTL":320000,'+
		 '"tipo":"NUMERICO",'+
		 '"destinatario":"'+numero+'",'+
		 '"canal":"sms",'+
		'"llave":"'+clave+'"}'
		 
//var raw = JSON.stringify({"llave":"1-1015448115","plantilla":"OTP simple","TTL":320000,"tipo":"NUMERICO","canal":"SMS","destinatario":"573143277989"});


		 
		 console.log(dataxx7)
                

                // llamo funcion de verificacion de vigencia de poliza

                  if (process.env.NODE_ENV == 'produccion') {
 					  var vurl = 'https://pre-apis-tranfiriendo.azurewebsites.net/otp/api/otp/generar';
                  }else{
					  var vurl = 'https://pre-apis-tranfiriendo.azurewebsites.net/otp/api/otp/generar';

                  }


                var options = { method: 'POST',
                  url: vurl,
                  body: dataxx7,
				  headers: {
					//'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJlbXByZXNhIjoiMTIzNDU2Nzg5IiwidXN1YXJpbyI6Imlkb2N1bWVudG9zdXNlciIsImZlY2hhIjoiMzAvMTAvMjAxOSA0OjM3OjA1IGEuIG0uIn0.ZzLu6G7_r4Snyhk4ev_tBFpSuKBZUO0M4yN__Qrkam3puwnZ2ZqP2zHlATZD29nCH7mWS_K1Cl5FgzPReoA_Zg',
                     //'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXByZXNhIjoiOTAxMjg1NDY2IiwidXN1YXJpbyI6InVzcnZlc2VndXJvIiwiZmVjaGEiOiIzMC8wMy8yMDIwIDU6NDc6MzIgcC4gbS4ifQ.VzCWa5I9Clyx6ubf8dpikq2JKa0PvtWMsrcb1FGdhV4',
		           'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJlbXByZXNhIjoiODYwMDAyNDAwIiwidXN1YXJpbyI6IkNDNDIxNzQwNSIsInVzZXJDbGllbnRlIjoiQ0M0MjE3NDA1IiwibnVtZXJvRG9jdW1lbnRvIjoiNDIxNzQwNSIsImNvcnJlbyI6IndpbHNvbnBlZHJhemFAZ21haWwuY29tIiwidGVsZWZvbm8iOiIzMTMyMjI1NzE5IiwidGlwb0RvY3VtZW50byI6IjEiLCJiZWFyZXIiOiJCZWFyZXIgZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKSVV6VXhNaUo5LmV5SmxiWEJ5WlhOaElqb2lPRFl3TURBeU5EQXdJaXdpZFhOMVlYSnBieUk2SWtORE5ESXhOelF3TlNJc0ltWmxZMmhoSWpvaU1qVXZNRE12TWpBeU1DQTFPalUzT2pFeUlHRXVJRzB1SW4wLkxpcjJkNml6bDN1OVNDRzZfcnJrRDJpcjRWYmxWVW4yVjU1UER5UGF2VURaaUxwNDFyWFhZRUE1ZWNwZzNjRDRxeVpuQzB3QjZLeWk1OHVHQ1JKdFdnIiwiaWRlbnRpZmljYWRvclRyYW5zYWNjaW9uIjoiZTJlNGNiNWU5M2E2NDk4YjhkMjE2ZTU2OWYzMmFkNmMiLCJuYW1lVXNlciI6IldpbHNvbiAgUGVkcmF6YSAifQ.lAaX4IDpKRnxa_DnbhDlDeWOpEQQKORskUf3x1nAfqQ-rb2QXIpAB9PSwWIeUMbhYu3PPRGrUzpTzPAJ9x1rCQ',
					'Content-Type': 'application/json'
				  }				  
                 };
				 
				  return new Promise((resolve, reject) => {
	
					request(options, (error, response, body) => {
					  if (response) {
						  
						var dato1 = JSON.parse(body); 
						//console.log(dato1)
						//var dato1 = JSON.parse(datoxx17);
						return resolve(dato1);
						
					  }
					  if (error) {
						return reject(error);
					  }
					});  
							  
				  }); 
				 
				 

	};	
	
	const f_verifica_otp = function(clave,numero) {

              
		//var dataxx7 ='{ "NumberPlate":"'+ result.Vehicle.NumberPlate+'"}';
        var dataxx7 = '{"identificadorTransaccion":"xxx",'+
		 '"OTP":"'+numero+'",'+
		'"llave":"'+clave+'"}'
		
//var raw = JSON.stringify({"identificadorTransaccion":"2b66ab4d-0825-447f-926c-9e7500a71486","llave":"1-1015448115","OTP":"115783"});
		 
		 
		 console.log(dataxx7)
                

                // llamo funcion de verificacion de vigencia de poliza

                  if (process.env.NODE_ENV == 'produccion') {
 					  var vurl = 'https://pre-apis-tranfiriendo.azurewebsites.net/otp/api/otp/verificar';
                  }else{
					  var vurl = 'https://pre-apis-tranfiriendo.azurewebsites.net/otp/api/otp/verificar';

                  }


                var options = { method: 'POST',
                  url: vurl,
                  body: dataxx7,
				  headers: {
					//'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJlbXByZXNhIjoiMTIzNDU2Nzg5IiwidXN1YXJpbyI6Imlkb2N1bWVudG9zdXNlciIsImZlY2hhIjoiMzAvMTAvMjAxOSA0OjM3OjA1IGEuIG0uIn0.ZzLu6G7_r4Snyhk4ev_tBFpSuKBZUO0M4yN__Qrkam3puwnZ2ZqP2zHlATZD29nCH7mWS_K1Cl5FgzPReoA_Zg',
                    //'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXByZXNhIjoiOTAxMjg1NDY2IiwidXN1YXJpbyI6InVzcnZlc2VndXJvIiwiZmVjaGEiOiIzMC8wMy8yMDIwIDU6NDc6MzIgcC4gbS4ifQ.VzCWa5I9Clyx6ubf8dpikq2JKa0PvtWMsrcb1FGdhV4',
                    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJlbXByZXNhIjoiODYwMDAyNDAwIiwidXN1YXJpbyI6IkNDNDIxNzQwNSIsInVzZXJDbGllbnRlIjoiQ0M0MjE3NDA1IiwibnVtZXJvRG9jdW1lbnRvIjoiNDIxNzQwNSIsImNvcnJlbyI6IndpbHNvbnBlZHJhemFAZ21haWwuY29tIiwidGVsZWZvbm8iOiIzMTMyMjI1NzE5IiwidGlwb0RvY3VtZW50byI6IjEiLCJiZWFyZXIiOiJCZWFyZXIgZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKSVV6VXhNaUo5LmV5SmxiWEJ5WlhOaElqb2lPRFl3TURBeU5EQXdJaXdpZFhOMVlYSnBieUk2SWtORE5ESXhOelF3TlNJc0ltWmxZMmhoSWpvaU1qVXZNRE12TWpBeU1DQTFPalUzT2pFeUlHRXVJRzB1SW4wLkxpcjJkNml6bDN1OVNDRzZfcnJrRDJpcjRWYmxWVW4yVjU1UER5UGF2VURaaUxwNDFyWFhZRUE1ZWNwZzNjRDRxeVpuQzB3QjZLeWk1OHVHQ1JKdFdnIiwiaWRlbnRpZmljYWRvclRyYW5zYWNjaW9uIjoiZTJlNGNiNWU5M2E2NDk4YjhkMjE2ZTU2OWYzMmFkNmMiLCJuYW1lVXNlciI6IldpbHNvbiAgUGVkcmF6YSAifQ.lAaX4IDpKRnxa_DnbhDlDeWOpEQQKORskUf3x1nAfqQ-rb2QXIpAB9PSwWIeUMbhYu3PPRGrUzpTzPAJ9x1rCQ',
					'Content-Type': 'application/json'
				  }				  
                 };
				 
				  return new Promise((resolve, reject) => {
	
					request(options, (error, response, body) => {
					  if (response) {
						  
						var dato1 = JSON.parse(body); 
						//console.log(dato1)
						//var dato1 = JSON.parse(datoxx17);
						return resolve(dato1);
						
					  }
					  if (error) {
						return reject(error);
					  }
					});  
							  
				  }); 
				 
				 

	};	

module.exports = app;
