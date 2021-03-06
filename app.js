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

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');

var sha1 = require('sha1');


var app = express();

var config = require('./config.json');

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

mongoose.connect(config.mongouri,{ useNewUrlParser: true, useUnifiedTopology: true })
//mongoose.connect("mongodb+srv://admin1:admin1@cluster0.1ru7w.mongodb.net/tablas?retryWrites=true&w=majority")
//mongoose.connect('mongodb://datosg:ccabreraq12@ds029901.mlab.com:29901/datosg');
//mongoose.connect('mongodb://admin:admin@ds031271.mlab.com:31271/tablas');

// formateadores de carbone

  carbone.addFormatters({
    // this formatter can be used in a template with {d.myBoolean:yesOrNo()}
    yesOrNo : function (data) { // data = d.myBoolean
      if (this.lang === 'fr-fr') {
        return data === true ? 'oui' : 'non';
      }
      return data === true ? 'yes' : 'no';
    },
	completa : function  (data, largo) {
	  if (typeof data === 'string') {
		var unir = "-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-."  
		var n = data.length;
		var m = largo - n
		var str2 = unir.substr(0, m);
		var res = data.concat(str2);
		return res;
	  }
	  return data;
	}	
  });


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

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Expose-Headers", "X-Total-Count, Content-Range");
    next();
});

Resource(app, '', 'puntos', Puntos).rest();
Resource(app, '', 'cupos', Cupos).rest();

Resource(app, '', 'users', Users).rest({
  before: function(req, res, next) {
    //console.log(req.body)
	next();
  },
  afterPost:function(req, res, next) {
    //console.log(res.resource)
	//console.log(res.resource.item)
    var reg = {"id_usuario": res.resource.item._id,
    "cupo_prepago": 0,
    "cupo_total": 0,
    "cupo_prueba": 5,
    "cupo_postpago": 0,
    "cupo_mensual": 0,
    "tipo": [
        "cupo_prueba"
    ]}	
	
	Cupos.create(reg, function (err, small) {
	  if (err) return handleError(err);
	  // saved!
	});
	
	next();
  },
  afterDelete:function(req, res, next) {
    //console.log(res.resource)
	//console.log(res.resource.item)
    var reg = {"id_usuario": res.resource.item._id}
	Cupos.deleteOne(reg, function (err) {
	  if(err) console.log(err);
	  console.log("Successful deletion");
	});	
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

//const resource4 = Resource(app, '/test', 'resource4', Resource4Model)
const queris = Resource(app, '/test', 'queris', Firma_doc)
  .virtual({
    path: 'totales',
    before: maxPrice
  })


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
        			//f_mail(mensajesms1,email,userResponse.content.data);
					f_mail_sedngrid(mensajesms1,email,{},{},"d-b16f6f624b8b4b1697767f2875d32ced",userResponse.content.data);

					
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
					
					//gen_pdf(reg_doc.nombre, reg_doc.rect,mail)  // devo enviar el documento t el registro de firmas
					
					f_crea_final(reg_doc.nombre,reg_doc) 
					
					
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
		//console.log(req.body);	
        console.log("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB")
		console.log(req.body);	
		
		var clave = req.body._id
		
		// inicia logica de negocio, aca seria el contro si tiene habilitacion para el servicio
		var logicaok = false;
		var tipo = {}
		var tipos_cupos
		run_cupos().catch(err => console.log(err));

		async function run_cupos() {
			var clavex1 = req.body.usuario			
			var usuario = await Users.find({ _id: req.body.usuario}).exec();	
			if (usuario[0].padre) {
				clavex1 = usuario[0].padre
			}
				
			var xreg_cupo = await Cupos.findOne({id_usuario: clavex1}).exec();	    
			tipos_cupos = xreg_cupo.tipo
			console.log(xreg_cupo)
			for (x of tipos_cupos) {
				console.log(xreg_cupo[x])

				if (xreg_cupo[x] > 0) {
                   logicaok = true;
				   tipo[x] = xreg_cupo[x] -1

				}				
			}

		     console.log(tipo)
			 console.log(logicaok)
			if (logicaok) {
			
				var firmantes = req.body.firmantes
				var x;

				for (x of firmantes) {
						  envia1(x);;
				}
				
				// dispara mail o sms de conexion del firmante con el link a el proceso de verificar documento y firmarlo
				  async function envia1(reg) {
					  
					  console.log("aaaaaaaaaaareg")
				  
					//var mensajesms1 = "mensaje para firma de documento "+"https://app-firmas1-from.herokuapp.com/#/Baz/"+clave+"/"+reg.annotation
					//var mensajesms1 = ""+config.cliente_url+"#/Baz/"+clave+"/"+reg.annotation
					var mensajesms1 = config.cliente_url+"#/Baz/"+clave+"/"+reg.annotation
					var env_sms = await f_sms(mensajesms1,"57"+reg.content.celular);
					//var env_mail = await f_mail(mensajesms1,reg.content.email,"");
					var env_mail = await f_mail_sedngrid(mensajesms1,reg.content.email,reg.content,req.body,"d-a3cf9047d9394c04bdb8154b8a69d15a","");
					
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
	    carbone.render_datos('./public/prueba1.docx', function(err, result){
			if (err) {
			  //return console.log(err);
			  console.log(err)
			}
		
				var x;
				var pp = result[0];
				var cc = []
				
 				
				var firmantes = {
				  "type": "array",
				  "title": "Firmantes",
				  "items": {
					"type": "object",
					"required": [
					  "nombres"
					],
					"properties": {
					  "cedula": {
						"type": "string",
						"title": "Cedula",
						"description": "Cedula de ciudadania"
					  },
					  "nombres": {
						"type": "string",
						"title": "Nombres",
						"description": "nombres del firmante"
					  },
					  "apellidos": {
						"type": "string",
						"title": "Apellidos",
						"description": "apellidos del firmante"
					  },
					  "celular": {
						"type": "string",
						"title": "Celular",
						"description": "celular del firmante"
					  },
					  "email": {
						"type": "string",
						"title": "Email",
						"description": "email del firmante"
					  }
					}
				  }
				
				}
  

				
				var dd = { "type": "object",  "required": [],  "properties": {firmantes:firmantes}}
				var campo_buscar
				function check_existe(campo) {
				  return campo === campo_busca;
				}

				for (x of pp) {
						 
					 var resp = x.name
				 if (resp.substr(0, 18) !== "_root.d.firmantes[") {
					 
  				     if (resp.substr(0, 8) !== "_root.c.") {
						 var resp1 = resp.replace("_root.d.","")
						 //var resp1 = resp1.replace("_root.c.","")
						  var n = resp1.search(":");
						  if ( n > 0 ){
							  var resp2 = resp1.substr(0, n);
							  campo_busca = resp2
                              if (dd.required.find(check_existe) === undefined ) {							  
								  dd.properties[resp2] = {"type": "string","title": resp2}
								  dd.required.push(resp2);
							  }
						  } else {
							  campo_busca = resp1
                              if (dd.required.find(check_existe) === undefined) {							  
								  dd.properties[resp1] = {"type": "string","title": resp1}
								  dd.required.push(resp1);
							  }
						  }
						  console.log(dd);	
					 }	
					 }					 
				}
			    res.send ({schema:dd,firmantes:[{},{}]})

		    });
	    });
	});
	
	
app.post("/crea_template", bodyParser.json(), function(req, res){
	
	   //////////////////////////// generacion de docx con variables
      var data = req.body.datos
	  var clave = req.body.id
	  var firmantes = req.body.firmantes
	  console.log(data)
	  
	// inicia logica de negocio, aca seria el contro si tiene habilitacion para el servicio
	var logicaok = false;
	var tipo = {}
	var tipos_cupos
	run_cupos().catch(err => console.log(err));

	async function run_cupos() {
		var clavex1 = req.body.usuario			
		var usuario = await Users.find({ _id: req.body.usuario}).exec();	
		if (usuario[0].padre) {
			clavex1 = usuario[0].padre
		}
		
		var xreg_cupo = await Cupos.findOne({id_usuario: clavex1}).exec();	    
		//var xreg_cupo = await Cupos.findOne({id_usuario: req.body.usuario}).exec();	    
		tipos_cupos = xreg_cupo.tipo
		console.log(xreg_cupo)
		for (x of tipos_cupos) {
			console.log(xreg_cupo[x])

			if (xreg_cupo[x] > 0) {
			   logicaok = true;
			   tipo[x] = xreg_cupo[x] -1

			}				
		}

		 console.log(tipo)
		 console.log(logicaok)
	if (logicaok) {
		options =	{
					  //convertTo    : 'pdf',           // String|Object, to convert the document (pdf, xlsx, docx, ods, csv, txt, ...)
					  //lang         : 'en-us',         // String, output lang of the report
					  complement   : {propietario:"PEDRO GOMEZ", fecha: new Date()},              // Object|Array, extra data accessible in the template with {c.} instead of {d.}
					  variableStr  : '{#def = d.id}', // String, predefined alias string, see designer's documentation
					  //reportName   : '{d.date}.odt',  // String, dynamic file name, output in third argument of the callback
					  enums        : {                // Object, list of enumerations, use it in reports with `convEnum` formatters
						'ORDER_STATUS' : ['open', 'close'],
						'SPEED' : {
						  10 : 'slow',
						  20 : 'fast'
						}
					  },
					  //translations : {                // Object, dynamically overwrite all loaded translations for this rendering
					  //	'fr-fr' : {'one':'un' },
					  //	'es-es' : {'one':'uno'}
					  //},
					  //hardRefresh: false              // If true, the report content is refreshed at the end of the rendering process. To use this option, `convertTo` has to be defined.
			}

	  carbone.render('./public/prueba1.docx', data, options, function(err, result){
		if (err) {
		  //return console.log(err);
		  console.log(err)
		}
		console.log(result)
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
                  url: "http://localhost:8080/firma_doc",

                  body: JSON.stringify(registro),
				  headers: {
                    //'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXByZXNhIjoiOTAxMTU4NzQ4IiwidXN1YXJpbyI6InVzckVudGVySWQiLCJmZWNoYSI6IjMwLzAzLzIwMjAgNTo0NzozMiBwLiBtLiJ9.aecPmVvFLIQzi-d9fBPQ9G5lP4vsW0ooOzbiF35r9mE',
					'Content-Type': 'application/json'
				  }				  
                 };
	
	            //console.log(options)
					request(options, (error, response, body) => {
					  if (response) {
						  
						console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
						console.log(response.body)
						res.status(200).send({pdf:""})

						var reg1 = response.body
						//reg1._id = reg1.usuario
					    var options = { method: 'POST',
						  url: "http://localhost:8080/inicia_firmas",

						  body: reg1,
						  headers: {
							//'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXByZXNhIjoiOTAxMTU4NzQ4IiwidXN1YXJpbyI6InVzckVudGVySWQiLCJmZWNoYSI6IjMwLzAzLzIwMjAgNTo0NzozMiBwLiBtLiJ9.aecPmVvFLIQzi-d9fBPQ9G5lP4vsW0ooOzbiF35r9mE',
							'Content-Type': 'application/json'
						  }				  
						};

						//console.log(options)
						//	request(options, (error, response1, body) => {
						//	  if (response1) {
						//         //console.log(body)
						//		//return resolve(body);
						//		res.status(200).send({pdf:""})
						//	  }
						//	  if (error) {
						//		//return reject(error);
						//		res.status(500).send(error);
						//	  }
						//    })
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
	  
	} else {
		res.status(400).send("no se perimite la transaccion");
		
	}
	  
	
	}
	
})
app.get("/verifica_user", function(req, res){
    var celularx = req.query.usuario;
	var xxusuario,szx
	
		run().catch(err => res.send(err));

		async function run() {
			var usuario = await Users.find({ cedula: celularx}).exec();
			
			if (usuario.length == 0) {
				xxusuario = 'sss'
				szx = xxusuario.toString()
				res.status(401).send([]);
			} else {
				 xxusuario = usuario[0]._id
				 szx = xxusuario.toString()			
			
				var q = Firma_doc.find({usuario: xxusuario}).sort({'fecha_creacion': -1}).limit(5);
				var registx = await q.exec();
				
				//var fetch(API_URL+'/firma_doc?limit=5&skip=0&sort=-fecha_creacion&usuario='+authProvider.getUser());
			   //res.status(200).send({pdf:env_template});
				var xx = await Firma_doc.aggregate([{ $match : {usuario: szx } },{ $group: { _id : "$status",count: { $sum: 1}}}]).exec()
				var result = {usuario:usuario,registros:registx,totales:xx}
			   res.status(200).send(result);
			}
		   
		}	
		
	
})

app.get("/verifica_cupos", function(req, res){
    var pusuario = req.query.usuario;
	var usuario = mongoose.Types.ObjectId(pusuario)
	var xusuario,szx
	
		run().catch(err => res.send(err));

		async function run() {
			var xusuario = await Users.find({ _id: usuario}).exec();
			
			if (xusuario.length == 0) {
				res.status(401).send([]);
			} else {
				
				var clavex1 = usuario			
				if (xusuario[0].padre) {
					clavex1 = xusuario[0].padre
				}
				
				
				var q = await Cupos.find({ id_usuario: clavex1}).exec();
				//var q = await Cupos.find({ id_usuario: usuario}).exec();
				
				var q1 = Firma_doc.find({usuario: pusuario}).sort({'fecha_creacion': -1}).limit(5);
				var registx = await q1.exec();
							
				var xx = await Firma_doc.aggregate([{ $match : {usuario: pusuario } },{ $group: { _id : "$status",count: { $sum: 1}}}]).exec()
				var result = {usuario:xusuario[0],cupos:q[0],registros:registx,totales:xx}
			   res.status(200).send(result);
			}
		   
		}	
})

app.get("/totales_documentos", function(req, res){
    var usuariox = req.query.usuario;
	Firma_doc.aggregate([
    { $match : {usuario:usuariox } },
	{ $group: { _id : "$status",count: { $sum: 1}}}

	 ],    function(err, result) {
      if (err) {
        res.send(err);
      } else {
        res.json(result);
      }

	})	
})	
	
	

app.get("/totales_documentos1", function(req, res){
	
var start = new Date("2020-01-01T00:00:00.000Z");
var finish = new Date("2020-10-10T00:00:00.000Z");

Firma_doc.aggregate([
{ $match: { $and: [ { fecha_creacion: { $gt: start, $lt: finish } }
     ] } },
    { $project: {
        "_id":1,
        "fecha_creacion":"$fecha_creacion",
        "nombres":"$rect.type"
        }
    },
    { $out: "tempPruebaCarlos"}],    function(err, result) {
    //{ $out: {  db :  "tablas" ,  coll :  "movi"  }}],    function(err, result) {
      if (err) {
        res.send(err);
      } else {
        res.json(result);
      }
    })

 });

var maxPrice = function(req, res, next) {
  req.modelQuery = Firma_doc.aggregate(
    [
	   { $group: { _id : "$status"},total: {count: { $sum: 5}}},	  
    ]
  );
  return next();
};

app.post('/link_pago', function(request, res) {

	run().catch(err => res.send(err));

	async function run() {
		var xusuario = await f_link_pago(request.body);
		
		if (xusuario.length == 0) {
			res.status(401).send('');
		} else {
		   res.status(200).send(xusuario);
		}
	   
	}	
	
});	

app.post('/envia_invitacion', function(request, res) {

	run().catch(err => res.send(err));

	async function run() {
		var xusuario = await f_link_pago(request.body);
		
		var mensajesms1 = config.cliente_url+"#/registro_invitacion/"+request.body.id+"/"+request.body.cedula_i+"|"+request.body.nombres_i+"|"+request.body.apellidos_i+"|"+request.body.email_i+"|"+request.body.celular
		var env_mail = await f_mail_sedngrid(mensajesms1,request.body.email_i,{},request.body,"d-a3cf9047d9394c04bdb8154b8a69d15a","");
		
		if (env_mail.length == 0) {
			res.status(401).send('');
		} else {
		   res.status(200).send(env_mail);
		}
	   
	}	
	
});	

	
	
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
	const  f_mail_sedngrid = function (mensaje,mail,firmante,datos,template,adjunto) {
		console.log(mail)
		console.log(firmante)		
		console.log(datos)
		console.log(mensaje)
		
     if (adjunto === "") {      
		var msg = {
			  to: mail,
			  from: 'notificacion@tucarpeta.in', // Use the email address or domain you verified above
			  template_id: template,
			  dynamic_template_data: {conexion:mensaje,cliente:"Carlos Cabrera",nombre:datos.nombre,descripcion:datos.descripcion,fecha:datos.fecha_creacion,firmante:firmante.nombres+' '+firmante.apellidos},
			  //text: 'and easy to do anywhere, even with Node.js',
			  //html: '<strong>and easy to do anywhere, even with Node.js</strong>',
			};
	 } else {
		var msg = {
			  to: mail,
			  from: 'notificacion@tucarpeta.in', // Use the email address or domain you verified above
			  template_id: template,
			  dynamic_template_data: datos,
			  //text: 'and easy to do anywhere, even with Node.js',
			  //html: '<strong>and easy to do anywhere, even with Node.js</strong>',
              attachments: [{content:Buffer.from(adjunto).toString('base64') ,filename:"documento.pdf"}]
			};
		 
	 }
			
		sgMail
		  .send(msg)
		  .then(() => {}, error => {
			console.error(error);

			if (error.response) {
			  console.error(error.response.body)
			}
		  });
	};
	

	// envio sms por infobit 
	const f_mail = function(mensaje,mail,adjunto) {
		
		
    //var acs = '<h1>FirmaFacil</h1><p>This is a paragraph.</p><p>Edit the code in the window to the left, and click to view the result.</p>'
    var acs = '<h1 style="text-align: center;">FirmaFacil</h1><p></p><p>Te han incluido entre los firmantes de un documento digital, por favor ingresa a es link para que puedas revisar y firmar el documento:</p><p><a href="http://pre.nodeapps.transfiriendo.com:8087/#/Baz/5fc11cabd0dd240017360207/9765efba-9925-4482-9c35-8045ec1d144c">&nbsp;------- ACCESO AL DOCUMENTO----------</a></p><div class="a3s aiL ">Muchas Gracia.</div>'	
    var htmlx = "<HTML>\r\n<p>Estimado(a) "+"aaa"+",</p>\r\n"+
             "<p>Ya tenemos listo su SOAT, nuestra Ã¡rea de servicio a DOMICILIO  en breve lo contactara para verificar datos y programar la entrega.</p>"+
             "<p></p>"+
             "<p>Una vez verificados los datos el tiempo de entrega en la Ciudad de Cali es aproximadamente en 3 (tres)  hrs</p>"+
             "<p></p>"+
             "<p>Si tiene alguna pregunta no dude en comunicarse con nosotros. Recuerde que en PENTAINNOVA estamos para servirle. Cordialmente, </p>"+
             "<p>Domicilios - Pentainnova</p>"+
             "<p>Cel: 3004568738, Email: lcabrera@pentainnova.com</p>"+
             "\r\n</HTML>\r\n"
	
	
     if (adjunto === "") {      
        var dataxx7 = '{"identificadorTransaccion":"xxx",'+
		 '"perfil":"enter-id",'+
 		 '"destinatario":["'+mail+'"],'+
		 '"canal":"EMAIL",'+
		 '"mensaje":{"asunto":"notificacion de firma de documento","cuerpo":"FirmaFacil, le ha enviado un documento para su revision y firma, por favor entrar a este enlace:  '+mensaje+'"}}'
		 //'"mensaje":{"asunto":"notificacion para firma de documento","cuerpo":"'+acs+'"}}'
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
	
	const f_crea_final = function(file, doc) {
		
         //doc = {"_id":{"$oid":"6029bcfa7fa7db38680b5591"},"rect":[{"type":"area","x":69.33333333333333,"y":425.3333333333333,"width":252.66666666666669,"height":69.33333333333337,"backgroundColor":"red","status":"pendiente","class":"Annotation","uuid":"ecee3f73-3320-4b1c-a500-48ab36234adc","page":7},{"type":"area","x":340.6666666666667,"y":425.3333333333333,"width":231.33333333333331,"height":73.33333333333337,"backgroundColor":"red","status":"pendiente","class":"Annotation","uuid":"94ba245f-b0f3-438c-8f07-350f49a8bfb1","page":7}],"firmantes":[{"class":"Comment","uuid":"3f9f8dbe-fba6-4103-80b3-f0529988fbb6","annotation":"ecee3f73-3320-4b1c-a500-48ab36234adc","content":{"cedula":"79299848","nombres":"Carlos","apellidos":"Cabrera","celular":"3204903664","email":"test@example.com","status":"pendiente"}},{"class":"Comment","uuid":"4ccf2410-8d5f-4f00-a57a-3eb725a29f8f","annotation":"94ba245f-b0f3-438c-8f07-350f49a8bfb1","content":{"cedula":"79299848","nombres":"Carlos","apellidos":"Cabrera","celular":"3204903664","email":"test@example.com","status":"pendiente"}}],"usuario":"5ef0eafa50fb8041d446173d","nombre":"F88888","descripcion":"F888","otro":"","url":"uploads/user1_aa.pdf","fecha_creacion":{"$date":{"$numberLong":"1613348090122"}},"status":"sin iniciar","num_firmantes":{"$numberInt":"2"},"num_firmados":{"$numberInt":"0"},"__v":{"$numberInt":"0"}}

        //var reg1 = {"_id":{"$oid":"6029bcfa7fa7db38680b5591"},"rect":[{"type":"area","x":69.33333333333333,"y":425.3333333333333,"width":{"$numberDouble":"252.66666666666669"},"height":{"$numberDouble":"69.33333333333337"},"backgroundColor":"red","status":"pendiente","class":"Annotation","uuid":"ecee3f73-3320-4b1c-a500-48ab36234adc","page":7},{"type":"area","x":340.6666666666667,"y":425.3333333333333,"width":{"$numberDouble":"231.33333333333331"},"height":{"$numberDouble":"73.33333333333337"},"backgroundColor":"red","status":"pendiente","class":"Annotation","uuid":"94ba245f-b0f3-438c-8f07-350f49a8bfb1","page":7}],"firmantes":[{"class":"Comment","uuid":"3f9f8dbe-fba6-4103-80b3-f0529988fbb6","annotation":"ecee3f73-3320-4b1c-a500-48ab36234adc","content":{"cedula":"79299848","nombres":"Carlos","apellidos":"Cabrera","celular":"3204903664","email":"test@example.com","status":"pendiente"}},{"class":"Comment","uuid":"4ccf2410-8d5f-4f00-a57a-3eb725a29f8f","annotation":"94ba245f-b0f3-438c-8f07-350f49a8bfb1","content":{"cedula":"79299848","nombres":"Carlos","apellidos":"Cabrera","celular":"3204903664","email":"test@example.com","status":"pendiente"}}],"usuario":"5ef0eafa50fb8041d446173d","nombre":"F88888","descripcion":"F888","otro":"","url":"uploads/user1_aa.pdf","fecha_creacion":{"$date":{"$numberLong":"1613348090122"}},"status":"sin iniciar","num_firmantes":{"$numberInt":"2"},"num_firmados":{"$numberInt":"0"},"__v":{"$numberInt":"0"}}		
		var reg1 = doc.reg
		
		run().catch(err => console.log(err));

		async function run() {
			
			//oc.files.getFile('/dos/uploads/'+file+'.pdf', 'public/uploads/'+file+'.pdf').then(status => {
			//	response.send(status);
			//}).catch(error => {
			//	response.send(error);
			//});
			
		  //const xfile = await PDFDocument.load(fs.readFileSync('./public/uploads/'+file+'.pdf'));
		  const image_firma_no = await PDFDocument.load(fs.readFileSync('./public/uploads/FIRMA_PDF_NO.pdf'));
		  const image_firma_si = await PDFDocument.load(fs.readFileSync('./public/uploads/FIRMA_PDF_SI.pdf'));
			
		  // Load a PDFDocument from the existing PDF bytes
		  const pdfDoc = await PDFDocument.load(fs.readFileSync('./public/uploads/'+file+'.pdf'));

		  const [firma_no] = await pdfDoc.embedPdf(image_firma_no);
		  const firma_no_Dims = firma_no.scale(0.45);

		  const [firma_si] = await pdfDoc.embedPdf(image_firma_si);
		  const firma_si_Dims = firma_si.scale(0.45);
		  
		  // Get the first page of the document
		  const pages = pdfDoc.getPages();
		  //const firstPage = pages[3];
		  //const stPage = pages[6];

		  // Get the width and height of the first page
		  //const { width, height } = firstPage.getSize();
		  
				var rect = doc.rect
				var x;
				var pagss

				for (x of rect) {
					 crea_firma(x);;
				}
				
				// dispara mail o sms de conexion del firmante con el link a el proceso de verificar documento y firmarlo
				  async function crea_firma(reg) {
					  pagss = pages[reg.page-1];
					  pagss.drawPage(firma_si, {
						...firma_si_Dims,
						x: reg.x - 5,
						y: 710 - (312 + reg.y)
					  });
				  }
		  
		  
          const pdfBytes = await pdfDoc.save();

					await fs.writeFile("public/uploads/"+file+"_final.pdf", pdfBytes, {
						
					
					}, function (err) {
						console.log("captured page written to " + file);
                        //resolve("erro");				
						
					});
					
		         		var fir = doc.firmantes
						var y;
						
						for (y of fir) {
							 envia_doc_mail(y);;
						}
						
						// dispara mail o sms de conexion del firmante con el link a el proceso de verificar documento y firmarlo
						  async function envia_doc_mail(reg) {

							// ojo debo enviar correo a todos los firmantes copiandoles el documento pdf firmado digitalmente
							var mensajesms1 = "se envia documento final, del proceso de firmas"
							 //console.log(email)
							//f_mail(mensajesms1,email,userResponse.content.data);
							f_mail_sedngrid(mensajesms1,reg.content.email,reg.content,doc,"d-b16f6f624b8b4b1697767f2875d32ced",pdfBytes);							

						  }
						  
						await oc.files.putFile('/dos/uploads/'+file+'_final.pdf', './public/uploads/'+file+'_final.pdf').then(status => {
							//res.status(200).send(err);
							//response.send(status);
							
						}).catch(error => {
							console.log(error)
							//res.status(500).send(error);
							//response.send(error);
							return ''
						});	  

					
					return ''
		  
		  
		  // Write the PDF to a file
		  //fs.writeFileSync('./public/uploads/xx1.pdf', await doc.save());
		}		
	};
	
	const f_link_pago = function(data) {
	
        //try {
            //var requestbody = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ProcesarReferenciasCoe xmlns="http://tempuri.org/"><pProcesarReferenciasRq>&lt;ProcesarReferenciasRq&gt;&lt;PersonaDeudora&gt;&lt;Nombre&gt;VARNOMBRE&lt;/Nombre&gt;&lt;TipoIdentificacion&gt;VARTIPOIDENTIFICACION&lt;/TipoIdentificacion&gt;&lt;NumeroIdentificacion&gt;VARNUMEROIDENTIFICACION&lt;/NumeroIdentificacion&gt;&lt;Email&gt;VARCOREO&lt;/Email&gt;&lt;/PersonaDeudora&gt;&lt;IdentificadorCompania&gt;VARCOMPANIA&lt;/IdentificadorCompania&gt;&lt;Referencias&gt;&lt;Referencia&gt;&lt;Cabecera&gt;&lt;NumeroReferencia&gt;VARNUMERORFERENCIA&lt;/NumeroReferencia&gt;&lt;NumeroReferenciaOrigen&gt;VARNUMEROREFRENCIAORIGEN&lt;/NumeroReferenciaOrigen&gt;&lt;Moneda&gt;COP&lt;/Moneda&gt;&lt;ImporteTotal&gt;VARIMPORTETOTAL&lt;/ImporteTotal&gt;&lt;ImporteSubtotal&gt;VARIMPORTESUBTOTAL&lt;/ImporteSubtotal&gt;&lt;ImporteIva&gt;VARIMPORTEIVA&lt;/ImporteIva&gt;&lt;FechaEmision&gt;VARFECHAEMISION&lt;/FechaEmision&gt;&lt;FechaVencimiento&gt;VARFECHAVENCIMIENTO&lt;/FechaVencimiento&gt;&lt;/Cabecera&gt;&lt;/Referencia&gt;&lt;/Referencias&gt;&lt;/ProcesarReferenciasRq&gt;</pProcesarReferenciasRq><pClaveControl>' + sha1(data.compania + "1") + '</pClaveControl></ProcesarReferenciasCoe></soap:Body></soap:Envelope>'
            var requestbody = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ProcesarReferenciasCoe xmlns="http://tempuri.org/"><pProcesarReferenciasRq>&lt;ProcesarReferenciasRq&gt;&lt;PersonaDeudora&gt;&lt;Nombre&gt;VARNOMBRE&lt;/Nombre&gt;&lt;TipoIdentificacion&gt;VARTIPOIDENTIFICACION&lt;/TipoIdentificacion&gt;&lt;NumeroIdentificacion&gt;VARNUMEROIDENTIFICACION&lt;/NumeroIdentificacion&gt;&lt;Email&gt;VARCOREO&lt;/Email&gt;&lt;/PersonaDeudora&gt;&lt;IdentificadorCompania&gt;VARCOMPANIA&lt;/IdentificadorCompania&gt;&lt;Referencias&gt;&lt;Referencia&gt;&lt;Cabecera&gt;&lt;NumeroReferencia&gt;VARNUMERORFERENCIA&lt;/NumeroReferencia&gt;&lt;NumeroReferenciaOrigen&gt;VARNUMEROREFRENCIAORIGEN&lt;/NumeroReferenciaOrigen&gt;&lt;Moneda&gt;COP&lt;/Moneda&gt;&lt;ImporteTotal&gt;VARIMPORTETOTAL&lt;/ImporteTotal&gt;&lt;ImporteSubtotal&gt;VARIMPORTESUBTOTAL&lt;/ImporteSubtotal&gt;&lt;ImporteIva&gt;VARIMPORTEIVA&lt;/ImporteIva&gt;&lt;FechaEmision&gt;VARFECHAEMISION&lt;/FechaEmision&gt;&lt;FechaVencimiento&gt;VARFECHAVENCIMIENTO&lt;/FechaVencimiento&gt;&lt;/Cabecera&gt;&lt;/Referencia&gt;&lt;/Referencias&gt;&lt;Extras&gt;&lt;Ref1&gt;&lt;/Ref1&gt;&lt;Ref2&gt;&lt;/Ref2&gt;&lt;Ref3&gt;&lt;/Ref3&gt;&lt;Ref4&gt;&lt;/Ref4&gt;&lt;Ref5&gt;VARREF5&lt;/Ref5&gt;&lt;/Extras&gt;&lt;/ProcesarReferenciasRq&gt;</pProcesarReferenciasRq><pClaveControl>' + sha1(data.compania + "1") + '</pClaveControl></ProcesarReferenciasCoe></soap:Body></soap:Envelope>'
            requestbody = requestbody.replace("VARNOMBRE", data.nombre);
            requestbody = requestbody.replace("VARCOMPANIA", data.compania); 
            requestbody = requestbody.replace("VARTIPOIDENTIFICACION", data.tipoidentificacion); 
            requestbody = requestbody.replace("VARNUMEROIDENTIFICACION", data.numeroidentificacion);
            requestbody = requestbody.replace("VARCOREO", data.correo);
            requestbody = requestbody.replace("VARIMPORTETOTAL", data.importetotal);
            requestbody = requestbody.replace("VARIMPORTESUBTOTAL", data.importesubtotal);
            requestbody = requestbody.replace("VARIMPORTEIVA", data.importeiva);
            requestbody = requestbody.replace("VARFECHAEMISION", data.fechaemision); 
            requestbody = requestbody.replace("VARFECHAVENCIMIENTO", data.fechavencimiento);  
            requestbody = requestbody.replace("VARNUMERORFERENCIA", data.numeroreferencia);
            requestbody = requestbody.replace("VARNUMEROREFRENCIAORIGEN", data.numeroreferenciaorigen);
			
            //requestbody = requestbody.replace("VARREF5", data.ref5);
			
			var coeurl = "https://pre.irecaudocoe.transfiriendo.com:456/"

			console.log(requestbody)
            var options = {
                method: 'POST',
                url: coeurl + 'Irecaudocoe/WebServices/Public/PublicServices.asmx',
                headers: {
                    soapaction: 'http://tempuri.org/ProcesarReferenciasCoe',
                    'content-type': 'text/xml'
                },
                body: requestbody
            };
            console.log("//////////////////////////////////");
            console.log(requestbody);
            console.log("//////////////////////////////////");
			
			
			  return new Promise((resolve, reject) => {

				request(options, (error, response, body) => {
				  if (response) {
					console.log(body)
					  
                    var inicio = body.search("&lt;IdentificadorTransaccion&gt;") + 32;
                    var fin = body.search("&lt;/IdentificadorTransaccion&gt;");
                    var IdentificadorTransaccion = body.substring(inicio, fin);
                    body1 = {
                        "IdentificadorTransaccion": IdentificadorTransaccion,
                        "Link": coeurl + "IRecaudoCoe/WebForms/Pago/Views/GenerarTransaccion.aspx?input=" + IdentificadorTransaccion
                    };
					console.log(inicio)
					console.log(fin)
                    if (inicio > 0 && fin > 0) {
                        return resolve(body1)
                    } else {
						//return reject( "no se genero la refrencia de pago") 
                    body1 = {
                        "IdentificadorTransaccion": "no se genero la refrencia de pago",
                        "Link": ""
                    };
						
						return resolve(body1)
                     }

					  //return resolve(dato1);
					
				  }
				  if (error) {
					  //console.log(error)
					return reject(error);
					//return resolve(error)
				  }
				});  
						  
			  }); 
			
			
			
			
			
         //} catch (err) {
		//	return (err);
        //}
    }	
	
	
app.get("/docxx", function(req, res){
    var file = req.query.file;
	f_crea_final(file)
	res.json({});

})		
	

module.exports = app;
