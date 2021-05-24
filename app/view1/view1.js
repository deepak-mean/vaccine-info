'use strict';

angular.module('myApp.list', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/list', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ["$http", "$scope", "$interval", "$mdDialog", function(http, $scope, $interval, $mdDialog) {
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

	$scope.data = {};

    $scope.local = {
        selectedState : ""
    };

    $scope.metaData = {};
	$scope.getDiff = function(date){
		return moment(date).format("hh:mm a")
	}

	function fetchData(districtId, date){
		$scope.data = {};
		var url = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=' + districtId + '&date=' + date;
        http.get(url).then(function(res){
            if(res.status == 200){                      
                console.log("..dta", res); 
                var data = res.data;
                if(data && data.centers && data.centers.length > 0){
                	data.centers.forEach(function(center){
                		if(center && center.sessions.length> 0){
                			center.sessions.forEach(function(session){
                				if(session && session.min_age_limit ){
                					var date = session.date;

                					var obj = {
                						name : center.name,
                						address: center.address + ", " + center.block_name + "-" + center.pincode,
                						vaccine: session.vaccine,
                						available_capacity : session.available_capacity,
                						slots: session.slots,
                						date : date
                					}
                					if(!$scope.data[date]){
                						$scope.data[date] = {
                							centers : 0,
                							shots:0,
                							data : []
                						};
                					}
                					$scope.data[date].centers++;
                					$scope.data[date].shots += session.available_capacity;
                					$scope.data[date].data.push(obj);
                				}
                			})
                		}
                	});
                }      
                console.log("..data", $scope.data);  
                if($scope.districtData.targetDate){
                	if($scope.data && $scope.data[$scope.districtData.targetDate] && $scope.data[$scope.districtData.targetDate].shots ){
                		// window.open("http://localhost:8000/#!/view2", "_blank") ;
                	}
                } 
                $scope.lastDataFetched = moment(new Date());         
            }
            else{
                // callback("review not crawled successfully",null);
            }
        });
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
        http.get('/getDistricts/' + $scope.local.selectedState).then(function(res){
            $scope.options.loadingDistricts = false;
            if(res.status == 200){                      
                
                var districts = [];
                if(res.data && res.data.data) {
                    if(typeof res.data.data == 'string'){
                        districts = JSON.parse(res.data.data);
                    } else {
                        districts = res.data.data;
                    }
                    
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

    $scope.fetchSlotsData = function(){
        fetchData($scope.local.selectedDistrict, moment().format('DD-MM-YYYY'));
    }


    function subscribeToAlerts(mobile){
        var data = {
            mobile : mobile,
            district_id: $scope.local.selectedDistrict
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

    fetchStates();



	// fetchData();
	// var clearIterval = $interval(function(){
	// 	fetchData();
	// },1000*60*1)
}]);



