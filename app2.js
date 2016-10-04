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
//var cfenv            = require('cfenv');
//var request          = require('request');
// var ServiceDiscovery = require('bluemix-service-discovery');
var MongoClient      = require('mongodb').MongoClient;

/******************************************************/
/* Get the app environment from Cloud Foundry         */
/******************************************************/
//var appEnv = cfenv.getAppEnv();

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
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
var host = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
console.log("Server will listen on host:port " + host + ":" + port);


/******************************************************/
/* Grab environment variables and connect to Service  */
/* Directory                                          */
/******************************************************/
console.log("DreamHomeServiceNode ==> Begin Execution");

console.log("DreamHomeServiceNode ==> Pausing for network connection");
var seconds = 10;
var waitTill = new Date(new Date().getTime() + seconds * 1000);
while(waitTill > new Date()) { }
console.log("DreamHomeServiceNode ==> Pause complete");

/*
if (process.env.VCAP_SERVICES)
{
   var env = JSON.parse(process.env.VCAP_SERVICES);
      
   console.log('**************************************************************************************************');
   //console.log('DreamHomeServiceNode ==> MongoDB name                  = ' + env['user-provided'][0].name);
   //console.log('DreamHomeServiceNode ==> MongoDB credentials           = ' + env['user-provided'][0].credentials.uri);
   console.log('DreamHomeServiceNode ==> Service Discovery name        = ' + env['service_discovery'][0].name);
   console.log('DreamHomeServiceNode ==> Service Discovery auth token  = ' + env['service_discovery'][0].credentials.auth_token);
   console.log('DreamHomeServiceNode ==> Service Discovery credentials = ' + env['service_discovery'][0].credentials.url);
   console.log('**************************************************************************************************');
      
   var discovery = new ServiceDiscovery({
       name: env['service_discovery'][0].name,
       auth_token: env['service_discovery'][0].credentials.auth_token,
       url: 'https://servicediscovery.ng.bluemix.net',
       //url: env['service_discovery'][0].credentials.url,
       version: 1
   });


   var instance = {
      service_name: 'DreamHomeServiceNodeDocker',
      ttl: 60, // 1 min
      endpoint: {
        type: 'http',
        value: process.env.IP
      },
      metadata: {
        cookie: 'crumbles'
      }
   };

   console.log("3. Before register");

   discovery.register(instance, function(err, response, body) 
   {
      if (err)
      {
         console.log("DreamHomeServiceNode ==> Error running register");
         console.log(err);
      }
      else
      {
         console.log("DreamHomeServiceNode ==> Results from register");
         console.log(body);
         var id = body.id;

         setInterval(function() 
         {
            discovery.renew(id, function(err, response) 
            {
               if (err)
               {
                  console.log("DreamHomeServiceNode ==> Heartbeak Error");
                  console.log(err);
               }
               else
               {
                  console.log("DreamHomeServiceNode ==> Heartbeak OK");
               }
            });
         }, 10000);
      }
    });
}
else
{
   console.log("DreamHomeClientNode ==> Cannot get environment variables");
}
*/
/******************************************************/
/* Path to .........                                  */
/******************************************************/
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
/******************************************************/
/* Finds one property in MongoDB                      */
/******************************************************/
app.get('/properties/:propertyID', function (req, res) 
{
   var mongoString;
   var dreamHomeDatabase = "dreamHome";

   console.log("DreamHomeServiceNode.properties/:propertyID ==> Begin");

   if (process.env.VCAP_SERVICES) 
   {
      mongoString = "mongoDB://root:169.45.196.58:27017/dreamhome";
      //mongoString = env['user-provided'][0].credentials.uri;
   }
   else
   {
      mongoString = "mongoDB://root:169.45.196.58:27017/dreamhome";
   }
   var mongoIP     = mongoString.substr(15, 13);
   var mongoPort   = mongoString.substr(29, 5); 
   var mongoURL    = "mongodb://" + mongoIP + ":" + mongoPort + "/" + dreamHomeDatabase;
  
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
/******************************************************/
/* Path to .........                                  */
/******************************************************/
app.get('/test2', function (req, res) 
{
   'use strict';
   var x = 3;
   var device = "abcdefg#Bob";
   var device2 = "abcdefg#Alice";
   console.log("Here we go!");
   console.log(device.substr(0, device.indexOf("#")));
   console.log(device.substr(device.indexOf("#") +1));
   console.log(device2.substr(device2.indexOf("#") +1));
   res.sendStatus(200);
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
