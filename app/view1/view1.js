'use strict';

angular.module('myApp.list', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/list', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ["$http", "$scope", "$interval", "$mdDialog", "$timeout", function(http, $scope, $interval, $mdDialog, $timeout) {
	var date = new Date();
	var nextDay = moment(date).add(1, "d");

    $scope.options = {

    }
	$scope.districtData = {
		"name" : "Bhiwani(Haryana)",
		"id" : "200",
		"date": moment(date).format("DD-MM-YYYY"),
		"targetDate": moment(nextDay).format("DD-MM-YYYY")
	}

	$scope.data = null;

    $scope.local = {
        selectedState : ""
    };

    $scope.metaData = {};
	$scope.getDiff = function(date){
		return moment(date).format("hh:mm a")
	}

	function fetchData(districtId, fetchdate){
        $scope.loadingData = true;
		$scope.data = null;
		var url = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=' + districtId + '&date=' + fetchdate;
        http.get(url).then(function(res){
            if(res.status == 200){                      
                console.log("..dta", res); 
                var data = res.data;
                if(data && data.centers && data.centers.length > 0){
                	data.centers.forEach(function(center){
                		if(center && center.sessions.length> 0){
                			center.sessions.forEach(function(session){
                				if(session && session.min_age_limit && session.min_age_limit == 18 ){
                					var date = session.date;

                					var obj = {
                						name : center.name,
                						address: center.address + ", " + center.block_name + "-" + center.pincode,
                						vaccine: session.vaccine,
                						available_capacity : session.available_capacity,
                                        available_capacity_dose1: session.available_capacity_dose1,
                                        available_capacity_dose2: session.available_capacity_dose2,
                						slots: session.slots,
                                        min_age_limit: session.min_age_limit,
                						date : date
                					}
                                    if(!$scope.data){
                                        $scope.data = {};
                                    }
                					if(!$scope.data[date]){
                						$scope.data[date] = {
                							centers : 0,
                							shots:0,
                							data : [],
                                            available_centers: 0
                						};
                					}
                					$scope.data[date].centers++;
                                    if(session.available_capacity_dose1 || session.available_capacity_dose2){
                                        $scope.data[date].available_centers++;
                                        obj.availibility = true;
                                    }
                					$scope.data[date].shots += (session.available_capacity_dose1 || 0) + (session.available_capacity_dose2 || 0);
                					$scope.data[date].data.push(obj);
                				}
                			})
                		}
                	});
                }      
                console.log("..data", $scope.data);  
                if($scope.districtData.targetDate){
                	if($scope.data && $scope.data[fetchdate] && $scope.data[fetchdate].shots ){
                        // window.open("http://localhost:8000/#!/view2", "_blank") ;
                        // alert("..available for "+$scope.districtData.fetchdate);
                        // $scope.givenotification(fetchdate);
                    } else if($scope.data && $scope.data[$scope.districtData.targetDate] && $scope.data[$scope.districtData.targetDate].shots ){
                		// window.open("http://localhost:8000/#!/view2", "_blank") ;
                        // alert("..available for "+$scope.districtData.targetDate);
                        // $scope.givenotification($scope.districtData.targetDate);
                	}
                } 

            }
            else{
                // callback("review not crawled successfully",null);
            }
            $scope.lastDataFetched = moment(new Date());
            $scope.nextCallTime = moment().add(1, "m");
            $scope.lastDataFetchedString = $scope.lastDataFetched.format("DD-MMM-YYYY hh:mm a")
            $scope.nextCallDiff();
            $scope.parseDataToShow(); 
            $scope.loadingData = false;
        });
	}

    var secondInterval;
    $scope.nextCallDiff = function(){
        $scope.secondsGap = null;
        if(secondInterval) {
            $interval.cancel(secondInterval);
        }

        var seconds = $scope.nextCallTime.diff(moment(), 's');
        $scope.secondsGap = seconds;
        secondInterval = $interval(function(){
            var seconds = $scope.nextCallTime.diff(moment(), 's');
            $scope.secondsGap = seconds;
        }, 1000)
        
    }

    $scope.parseDataToShow = function(){
        $scope.dataToShow = [];
        if($scope.data && Object.keys($scope.data).length > 0){
            for(var key in $scope.data){
                var dataObj = $scope.data[key];
                var finalObj = {};
                finalObj = {
                    centers : 0,
                    shots:0,
                    data : [],
                    available_centers: 0,
                    date: key
                };
                if(dataObj.data && dataObj.data.length > 0){
                    dataObj.data.forEach(function(center){
                        var obj = {
                            name : center.name,
                            address: center.address + ", " + center.block_name + "-" + center.pincode,
                            vaccine: center.vaccine,
                            available_capacity : center.available_capacity,
                            available_capacity_dose1: center.available_capacity_dose1,
                            available_capacity_dose2: center.available_capacity_dose2,
                            slots: center.slots,
                            date : key
                        }
                        
                        
                        finalObj.centers++;
                        if(center.available_capacity_dose1 || center.available_capacity_dose2){
                            finalObj.available_centers++;
                        }
                        finalObj.shots += (center.available_capacity_dose1 || 0) + (center.available_capacity_dose2 || 0);
                        finalObj.data.push(obj);

                    });
                }

                if(finalObj.shots > 0){

                    $scope.dataToShow.push(finalObj);
                }
            }
        }
        console.log("..dataToShow", $scope.dataToShow);
    }


    function fetchStates(){
        $scope.options.loadingStates = true;
        http.get('/getStates').then(function(res){
            $scope.options.loadingStates = false;
            if(res.status == 200){                      
                console.log("..states", res); 
                var states = [];
                if(res.data && res.data.data) {
                    states = res.data.data;
                }

                $scope.metaData.states = states;
                       
            }
            else{
                // callback("review not crawled successfully",null);
            }
        })
    }

    function fetchDistricts(){
        $scope.options.loadingDistricts = true;
        http.get('https://cdn-api.co-vin.in/api/v2/admin/location/districts/' + $scope.local.selectedState).then(function(res){
            $scope.options.loadingDistricts = false;
            if(res.status == 200){                      
                
                var districts = [];
                if(res.data && res.data.data) {
                    if(typeof res.data.data == 'string'){
                        districts = JSON.parse(res.data.data);
                    } else {
                        districts = res.data.data;
                    }
                    
                } else if(res.data && res.data.districts){
                    districts = res.data.districts;
                }
                console.log("..districtData", districts); 
                $scope.metaData.districts = districts;
                       
            }
            else{
                // callback("review not crawled successfully",null);
            }
        })
    }

    $scope.selectState = function(){
        console.log(".. selected state", $scope.local.selectedState);
        fetchDistricts();

    }

    $scope.goToCowin = function(){
        window.open("https://selfregistration.cowin.gov.in/", "_blank") ;
    }

    var clearIterval;

    $scope.fetchSlotsData = function(){
        if(clearIterval) {
            $interval.cancel(clearIterval);
        }
        fetchData($scope.local.selectedDistrict.district_id, moment().format('DD-MM-YYYY'));
        clearIterval = $interval(function(){
            fetchData($scope.local.selectedDistrict.district_id, moment().format('DD-MM-YYYY'));   
        },1000*60*1)
    }

    


    function subscribeToAlerts(mobile){
        var data = {
            mobile : mobile,
            district_id: $scope.local.selectedDistrict.district_id
        }
        http.post('/users', data).then(function(res){
            console.log(".post user..", res);
            if(res.status == 200){                      
                   
                       
            }
            else{
                // callback("review not crawled successfully",null);
            }
        })
    }

    $scope.subscribe = function(){
        var confirm = $mdDialog.prompt()
            .title('Insert your mobile number to get alerts for selected district?')
            .textContent('You will get a SMS once slot opens.')
            .placeholder('Mobile Number')
            .ariaLabel('Mobile Number')
            .required(true)
            .ok('Submit')
            .cancel('Cancel');

        $mdDialog.show(confirm).then(function (result) {
          console.log('subscibe mobile number is ', result);
          subscribeToAlerts(result);
        }, function () {
          console.log('No');
        });
    }


    function checkNotificationPromise() {
        try {
          Notification.requestPermission().then();
        } catch(e) {
          return false;
        }

        return true;
    }
    navigator.serviceWorker.register('sw.js');

    $scope.givenotification = function(date){

        navigator.serviceWorker.ready.then(function(registration) {
            registration.showNotification('Vaccine Slot Alert', {
                body : "Vaccine Slot Available in your district for " + date,
                icon: "https://s3.amazonaws.com/orange_public_production/AAbWUOz/assets/f_AAbWSea.png",
                vibrate: [200, 100, 200, 100, 200, 100, 200]
            });
        });
        // var notification = new Notification('To do list', { body: text, icon: img });

    }

    $scope.enableNotification = function(){
        // function to actually ask the permissions
        function handlePermission(permission) {
            // set the button to shown or hidden, depending on what the user answers
            if(Notification.permission === 'denied' || Notification.permission === 'default') {
              // notificationBtn.style.display = 'block';
            } else {
              // notificationBtn.style.display = 'none';
              $scope.local.notificationAllowed = true;
              $scope.givenotification();
            }
        }

      // Let's check if the browser supports notifications
        if (!('Notification' in window)) {
            console.log("This browser does not support notifications.");
        } else {
            if(checkNotificationPromise()) {
              Notification.requestPermission()
              .then((permission) => {
                handlePermission(permission);
              })
            } else {
              Notification.requestPermission(function(permission) {
                handlePermission(permission);
              });
            }
        }
    }

    fetchStates();



	// fetchData();
    // $scope.local.selectedDistrict = { district_id : 10};
    // $scope.fetchSlotsData();
	// var clearIterval = $interval(function(){
 //        $scope.local.selectedDistrict = 192;
 //        $scope.fetchSlotsData()
	// 	// fetchData();
	// },1000*60*1)
}]);



