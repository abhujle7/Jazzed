// angular.module('starter.controllers', [])

app.controller('SettingsCtrl', function($scope, $state, $firebaseObject, AuthFactory) {
	var ref = new Firebase('https://boiling-fire-3161.firebaseio.com')
	var userRef = new Firebase('https://boiling-fire-3161.firebaseio.com/users/' + AuthFactory.getCurrentUser().uid)
	var currentUser = $firebaseObject(userRef)
	$scope.user = currentUser;
	userRef.on("value", function (snapshot) {
    // is there a lodash method for this?
		$scope.name = snapshot.val().name;
		$scope.email = snapshot.val().email;
		$scope.phone = snapshot.val().phone;
		$scope.photo = snapshot.val().photo
	})

	$scope.logout = function() {
		ref.unauth();
		$state.go('login')
	}
});
