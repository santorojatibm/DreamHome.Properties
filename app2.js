/*eslint-env node */
/********************************************************************************/
/* Name:       DreamHomeServiceNode                                             */
/*                                                                              */
/* Purpose:    Microservice that retrieves real estate property information.    */
/*             This code registers with IBM Service Discovery and sends heart-  */
/*             beats to it every 10 seconds.                                    */
/*                                                                              */
/* Interfaces: IBM Service Discovery service                                    */
/*             MongoDB database                                                 */
/*                                                                              */
/* Author:     Jim Williams                                                     */
/*                                                                              */
/********************************************************************************/
var http             = require('http');
var express          = require('express');
var bodyParser       = require('body-parser');
var request          = require('request');
var MongoClient      = require('mongodb').MongoClient;

/******************************************************/
/* Set up express                                     */
/******************************************************/
var app = express();
var server = http.createServer(app);
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json()); // for parsing application/json

// The IP address of the Cloud Foundry DEA (Droplet Execution Agent) that hosts this application:
//var host = (process.env.VCAP_APP_HOST || 'localhost'); 
// The port on the DEA for communication with the application:
//var port = (process.env.VCAP_APP_PORT || 3000);
//var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
//var host = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
var port = process.env.OPENSHIFT_NODEJS_PORT;
var host = process.env.OPENSHIFT_NODEJS_IP;
console.log("Server will listen on host:port " + host + ":" + port);

/******************************************************/
/* Grab environment variables and connect to Service  */
/* Directory                                          */
/******************************************************/
console.log("DreamHomeServiceNode ==> Begin Execution");

/*
console.log("DreamHomeServiceNode ==> Pausing for network connection");
var seconds = 10;
var waitTill = new Date(new Date().getTime() + seconds * 1000);
while(waitTill > new Date()) { }
console.log("DreamHomeServiceNode ==> Pause complete");
*/

/******************************************************/
/* Path to .........                                  */
/******************************************************/
/*
app.get('/showInstances', function (req, res) 
{
   console.log("DreamHomeServiceNode.showInstances ==> Begin");

   discovery.getInstances(function(err, response, body) 
   {
      if (err)
      {
         console.log("DreamHomeServiceNode.showInstances ==> Error running getInstances");
         console.log(err);
         res.sendStatus(500);
         return;
      }
      else
      {
         console.log("DreamHomeServiceNode.showInstances ==> Results from getInstances");
         console.log(body);
         res.sendStatus(200);
         return;
      }
   });
});
*/

/******************************************************/
/* Finds one property in MongoDB                      */
/******************************************************/
app.get('/properties/:propertyID', function (req, res) 
{
   var mongoURL = "mongodb://169.45.196.58:27017/dreamHome";
   console.log("MongoDB URL: " + mongoURL);

   MongoClient.connect(mongoURL, function(err, db)
   {
      if(err) 
      {
         console.log("DreamHomeServiceNode.properties/:propertyID ==> Error connecting to MongoDB");
         console.log(err);
         res.sendStatus(500);
         return;
      }
      else
      {
         console.log("DreamHomeServiceNode.properties/:propertyID ==> Connected to MongoDB");
         var collection = db.collection('dh');
         var document = {propertyId:req.params.propertyID};
         console.log(document);
         collection.findOne(document, function(err, item) 
         {
            if(err) 
            {
               console.log("DreamHomeServiceNode.properties/:propertyID ==> Error doing findOne in MongoDB");
               console.log(err);
               res.sendStatus(500);
               return;
            }
            else
            {
               console.log("DreamHomeServiceNode.properties/:propertyID ==> Good return from findOne in MongoDB");
               //console.log(item);
               res.status(200).json(item);
               return
            }
         });

      }
  });
});

app.get('/hello', function (req, res) 
{
  console.log("app.get(./hello function has been called.");

  var retjson = {"RC":0};          // assume a good json response
  var statusCode = 200;            // assume valid http response code=200 (OK, good response)

  // send the http response message
  retjson.success = "Hello from Dream Home service!";
//  helper.httpJsonResponse(res,statusCode,retjson);
  res.status(statusCode).json(retjson);
  res.end;

  return;
});

/**********************************************/
/* Start the server                           */ 
/**********************************************/ 
//server.listen(port, host);
server.listen(port);
console.log("Server started on host:port " + host + ":" + port );
//server.listen();
//console.log("Server started on host:port " + server.address().hostname + ":" + server.address().port);
