app.controller('ContactsCtrl', function($scope, AuthFactory, $firebaseArray, $cordovaContacts) {
	var ref = new Firebase('https://boiling-fire-3161.firebaseio.com/users/' + AuthFactory.getCurrentUser().uid + '/contacts')
	$scope.contacts = []
	$scope.syncContacts = function() {
		$cordovaContacts.find().then(function(allContacts) {
			$scope.contacts = allContacts || [1,2,3]
		})
	}
})