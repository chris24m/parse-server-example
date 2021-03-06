// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var bodyParser = require('body-parser');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  },
   // The public URL of your app.
  // This will appear in the link that is used to verify email addresses and reset passwords.
  // Set the mount path as it is in serverURL
  publicServerURL: 'http://themusicmuse.co.uk/',
  // Your apps name. This will appear in the subject and body of the emails that are sent.
  appName: 'scalewise',
  emailAdapter: {
    module: 'parse-server-simple-mailgun-adapter',
    options: {
      // The address that your emails come from
      fromAddress: 'admin@themusicmuse.co.uk',
      // Your domain from mailgun.com
      domain: 'themusicmuse.co.uk',
      // Your API key from mailgun.com
      apiKey: 'key-c56362d14a3cd2e6e8632b809b8f3e0f',
    }
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json());

app.use(function(req,res,next){
  res.header('Access-Control-Allow-Origin',"*");
  res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers",'Content-Type');
  next();
})

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

app.get('/env',function(req,res){
  res.send(process.env);
})
// Params :
// @token as String
// @email as String
app.post('/tokenVerify',function(req,res){
  var token = req.body.token;
  var email = req.body.email;

  MongoClient.connect(process.env.DATABASE_URI,function(err,db){
    if ( err ) {
      res.status(400).send("Connection error");
    } else {
      var UserCollection = db.collection('_User');
      UserCollection.find({email:email,_perishable_token:token}).toArray(function(err,docs){
        if ( err ) {
          res.status(400).send("DB error");
        } else {
          if ( docs.length != 0) {
            res.status(200).send({token:true});
          } else {
            res.status(200).send({token:false});
          }
        }
      })
    }
  })
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
