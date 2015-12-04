app.controller('ContactsCtrl', function($scope, contacts, ContactsFactory){
	document.addEventListener("deviceready", ContactsFactory.onDeviceReady, false)
	$scope.contacts = contacts;
});









