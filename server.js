const express = require('express');
const path = require('path');
const states = require("./constants/states");
const https = require('https');
// const fast2sms = require('fast-two-sms');
const moment = require('moment');

const app = express();


require('dotenv').config();
app.use((req, res, next) => {
  // console.log('Time: ', Date.now());
  next();
});

app.use(express.static(path.join(__dirname, 'app')))


app.get('/', (req, res) => {
  // res.send('Successful response.');
  res.sendFile(path.join(__dirname, '/app/index.html'));
});

app.get('/getStates', (req, res) => {
	var statesData = [];
	if(states && states.states && states.states.length > 0){
		statesData = states.states;
	}
	res.send({data : statesData, status: 1});
});

app.get('/getDistricts/:state_id', (req, res) => {
	console.log("..state id is", req.params.state_id);
	if(req.params && req.params.state_id){
		var id = req.params.state_id;
		var url = "https://cdn-api.co-vin.in/api/v2/admin/location/districts/" + id;
		https.get(url, (resp) => {
		 	let data = '';

			// A chunk of data has been received.
		  	resp.on('data', (chunk) => {
		    	data += chunk;
		  	});

		  	// The whole response has been received. Print out the result.
	  		resp.on('end', () => {
		    	console.log("response..",data);
		    	res.send({data: data, status : 1});
		  	});

		}).on("error", (err) => {
		  console.log("Error: " + err.message);
		  res.send({status: -1, error: err});
		});
	}
	// res.send("done");
});


function fetchSlotData(districtId, date, cb){
	var url = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=' + districtId + '&date=' + date;
	https.get(url, (resp) => {
	 	let data = '';

		// A chunk of data has been received.
	  	resp.on('data', (chunk) => {
	    	data += chunk;
	  	});

	  	// The whole response has been received. Print out the result.
  		resp.on('end', () => {
	    	// console.log("response..",data);
	    	cb({data: data, status : 1});
	  	});

	}).on("error", (err) => {
	  console.log("Error: " + err.message);
	  cb({status: -1, error: err});
	});
}
app.post("/getSlotInformation/:districtId/:date", (req, res) =>{
	var data = req.params;
	var date = data.date;
	var districtId = data.districtId;
	if(!data || !date || !districtId){
		res.send({status: -1, error : {message : "District and Date are required"}});
	} else {
		fetchSlotData(districtId, date, function(data){
			res.send(data);
		})
	}

});

app.get('/sendMessage', (req, res) => {
	var options = {authorization : process.env.API_KEY , message : 'Vaccine Slot available for tomorrow' ,  numbers : ['8570008456']} 
	fast2sms.sendMessage(options).then(response=>{
      console.log("fast2sms",response);
      res.send("Done");
    })
});

function activate(options){
	var districtsId = options.id;
	var mobileNumbers= options.mobileNumbers;
	var today = new Date();
	var targetDate = moment(today).add(1, "d").format("DD-MM-YYYY");
	console.log("..\n\n call new.." + today + "...target.." + targetDate + "... districtId.." + districtsId);
	fetchSlotData(districtsId, moment(today).format("DD-MM-YYYY"), function(data){
		// console.log("..data", data);
		var datewiseData = {};
		if(data && data.data){
			var jsonData = JSON.parse(data.data);
			if(jsonData.centers && jsonData.centers.length > 0){

	        	jsonData.centers.forEach(function(center){

	        		if(center && center.sessions.length> 0){

	        			center.sessions.forEach(function(session){
	        				if(session && session.min_age_limit && session.min_age_limit == 18 ){
	        					var date = session.date;

	        					var obj = {
	        						name : center.name,
	        						address: center.address + ", " + center.block_name + "-" + center.pincode,
	        						vaccine: session.vaccine,
	        						available_capacity : session.available_capacity,
	        						slots: session.slots,
	        						date : date
	        					}
	        					if(!datewiseData[date]){
	        						datewiseData[date] = {
	        							centers : 0,
	        							shots:0,
	        							availableCenters: 0,
	        							data : []
	        						};
	        					}
	        					datewiseData[date].centers++;
	        					datewiseData[date].shots += session.available_capacity;
	        					if(session.available_capacity > 0){
	        						datewiseData[date].availableCenters++;
	        					}
	        					datewiseData[date].data.push(obj);
	        					
	        				}
	        			})
	        		}
	        	});
	        }
		}
		// console.log("\n\n\n datewiseData",JSON.stringify(datewiseData));
		var todayDate = moment(today).format("DD-MM-YYYY");
		var clearTimer = false;
		if(datewiseData && datewiseData[todayDate] && datewiseData[todayDate]["availableCenters"] && datewiseData[todayDate]["availableCenters"] > 0 ){
    		var message = 'URGENT: Vaccine Slot are now available in your district for ' + todayDate;
    		message += ".\nTotal " + datewiseData[todayDate]["shots"] + " slots available at " + datewiseData[todayDate]["availableCenters"] + " centers.";
    		message += ".\nPlease visit https://selfregistration.cowin.gov.in/ to book your slot right now.";
    		console.log("\n\n..message",message);


    		console.log("HERE YOU KNOW YOU HAVE SLOT AVAILABLE FOR TODAY");
    		// SET YOUR ACTION HERE FOR NOTIFICATION 
    		clearTimer = true;

    	} else if(targetDate){
        	if(datewiseData && datewiseData[targetDate] && datewiseData[targetDate]["availableCenters"] && datewiseData[targetDate]["availableCenters"] > 0 ){
        		var message = 'URGENT: Vaccine Slot are now available in your district for ' + targetDate;
        		message += ".\nTotal " + datewiseData[targetDate]["shots"] + " slots available at " + datewiseData[targetDate]["availableCenters"] + " centers.";
        		message += ".\nPlease visit https://selfregistration.cowin.gov.in/ to book your slot right now.";
        		console.log("\n\n..message",message);


        		console.log("HERE YOU KNOW YOU HAVE SLOT AVAILABLE FOR TOMORROW");
        		// SET YOUR ACTION HERE FOR NOTIFICATION 
        		clearTimer = true;



        		// var apiOptions = {authorization : process.env.API_KEY , message :  message,  numbers : mobileNumbers} 

				// fast2sms.sendMessage(apiOptions).then(response=>{
				//     console.log("fast2sms",response);
			 	//     clearInterval(options.callback);
			 	//     // res.send("Done");
			 	// })


        	}
        }


        if(clearTimer){
        	// clear the timer
        	clearInterval(options.callback);
        }


	})
}

// Run this function 
var interval1 = setInterval(function(){
	// params 
	// id - district id - 650 for Noida/Gautam Budh Nagar
	// 
	// activate({id: 200, mobileNumbers : ['8570008456'], callback: interval1});
}, 1000*60*5);

app.listen(8005, () => console.log('Example app is listening on port 8005.'));