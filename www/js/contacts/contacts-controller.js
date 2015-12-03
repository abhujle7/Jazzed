app.controller('ContactsCtrl', function($scope, AuthFactory, ContactsFactory){
	$scope.contacts = ContactsFactory.getContacts()

});









