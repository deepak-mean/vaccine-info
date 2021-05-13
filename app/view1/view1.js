'use strict';

angular.module('myApp.list', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/list', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ["$http", "$scope", "$interval", function(http, $scope, $interval) {
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

	$scope.getDiff = function(date){
		return moment(date).format("hh:mm a")
	}

	function fetchData(){
		$scope.data = {};
		var url = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=' + $scope.districtData.id + '&date=' + $scope.districtData.date;
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
        })
	}


    function fetchStates(){
        
    }

	// fetchData();
	// var clearIterval = $interval(function(){
	// 	fetchData();
	// },1000*60*1)
}]);



