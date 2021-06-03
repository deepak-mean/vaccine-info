self.addEventListener('notificationclick', function(event) {
  const clickedNotification = event.notification;
  clickedNotification.close();
  if(event.action){
  	console.log("clicked action is", event.action);
  	var url = "https://selfregistration.cowin.gov.in/";
  	const promiseChain = clients.openWindow(url);
  	event.waitUntil(promiseChain);
  } else {
  	console.log(".NO action");
  }

  // Do something as the result of the notification click
  // const promiseChain = doSomething();
  // event.waitUntil(promiseChain);
});