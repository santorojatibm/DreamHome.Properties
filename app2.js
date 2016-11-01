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
/*             mods for OpenShift by: Sal Carceller
/*                                                                              */
/********************************************************************************/
var http             = require('http');
var express          = require('express');
var bodyParser       = require('body-parser');
var request          = require('request');
var MongoClient      = require('mongodb').MongoClient;

// configuration parms
var port = process.env.PORT || 8088;
var mongoURL = "mongodb://169.45.196.58:27017/dreamHome";

/******************************************************/
/* Set up express                                     */
/******************************************************/
var app = express();
var server = http.createServer(app);
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json()); // for parsing application/json


/******************************************************/
/* Grab environment variables and connect to Service  */
/* Directory                                          */
/******************************************************/
console.log("DreamHomeServiceNode ==> Begin Execution");

/******************************************************/
/* Finds one property in MongoDB                      */
/******************************************************/
app.get('/properties/:propertyID', function (req, res) 
{
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
  retjson.success = "John says hello from EC2 at Dream Home service!";
  res.status(statusCode).json(retjson);
  res.end;

  return;
});

/**********************************************/
/* Start the server                           */ 
/**********************************************/ 
server.listen(port);
console.log("Server started on port " + port );
