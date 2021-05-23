


var userDAL = {
	addNewUser: function(data,callback){
		const dbConnection = require("../db").getConnection();
		const collection = dbConnection.collection("users");
		collection.insertMany([data], (err, result)=> {
			if(err) {
				console.log("[userDAL - addNewUser]- Error", err);
				callback(err, null);
			} else {
				console.log("[userDAL - addNewUser]- result", result);
				callback(null, result);
			}
		})
	},
	deleteUser: function(data,callback){
		userDAL.deleteUser(data, (err, result)=> {
			if(err) {
				console.log("[deleteUser]- Error", err);
				callback(err, null);
			} else {
				console.log("[deleteUser]- result", result);
				callback(null, result);
			}
		})
	},
	findUsers: function(data,callback){
		userDAL.findUsers(data, (err, result)=> {
			if(err) {
				console.log("[findUsers]- Error", err);
				callback(err, null);
			} else {
				console.log("[findUsers]- result", result);
				callback(null, result);
			}
		})
	},
	updateUser: function(data,callback){
		userDAL.updateUser(data, (err, result)=> {
			if(err) {
				console.log("[updateUser]- Error", err);
				callback(err, null);
			} else {
				console.log("[updateUser]- result", result);
				callback(null, result);
			}
		})
	}
}

module.exports = userDAL;