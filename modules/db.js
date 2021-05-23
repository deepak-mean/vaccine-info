var MongoClient = require('mongodb').MongoClient;
var mainDBConnectionSingleton = function mainDBConnectionSingleton(){

	var conn = {};

	this.getConnection = function (){
		console.log("..db getConnection", conn);
		return conn;
	};

	this.initializeConnection = function(cb){
		const uri = process.env.MONGO_URL;
		// const client = new MongoClient();
		conn = MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true },function(err, db) {						
			if(err){
				console.error('Error in MongoDb connection: ' + err);
				process.exit();				
			}
			else{					
				console.log("Connected correctly to Mongo DB Server");
				conn = db.db("projectVSN");
				// console.log("..db conected", conn.db("projectVSN"));
				db.on('error', function (error) {
					console.log('Database connection error.Error:',error);	
					process.exit();				
				});
				db.on('timeout', function (error) {
					console.log('Database connection timeout.Error:',error);						
				});
				db.on('parseError', function (error) {
					console.log('Database connection parseError.Error:',error);						
				});
				db.on('reconnect', function (result) {
					console.log('Database connection reconnect');						
				});
				
				db.on('close', function (error) {
					console.log('Database connection closed.Error:',error);	
					process.exit();				
				});
				// db.listCollections().toArray(function(err, res) {
				// 	console.log(err,res)
				// })	
				
			}
		});			
	}

	if(mainDBConnectionSingleton.caller != mainDBConnectionSingleton.getInstance)
					throw new Error ("Wrong instance as the class is singleton ");
}

mainDBConnectionSingleton.instance = null;

mainDBConnectionSingleton.getInstance = function() {
	if(this.instance == null) {
		this.instance = new mainDBConnectionSingleton();
	}
	return this.instance;
}

module.exports = mainDBConnectionSingleton.getInstance();