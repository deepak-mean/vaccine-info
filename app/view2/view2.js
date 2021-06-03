'use strict';

angular.module('myApp.view2', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view2', {
    templateUrl: 'view2/view2.html',
    controller: 'View2Ctrl'
  });
}])

.controller('View2Ctrl', ['$scope', function($scope) {

	function checkNotificationPromise() {
	    try {
	      Notification.requestPermission().then();
	    } catch(e) {
	      return false;
	    }

	    return true;
  	}
  	navigator.serviceWorker.register('sw.js');

  	$scope.givenotification = function(){
  		var options = {
  			actions: [
			    {
			        action: 'book',
			        title: 'Book Now',
			        icon: '/demos/notification-examples/images/action-1-128x128.png'
			    }
			]

  		}

		navigator.serviceWorker.ready.then(function(registration) {
	      	registration.showNotification('Notification with ServiceWorker', options);
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
}]);