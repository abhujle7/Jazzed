app.controller('UserCtrl', function($scope, $firebaseObject, AuthFactory) {
	var ref = new Firebase('https://boiling-fire-3161.firebaseio.com/users/' + AuthFactory.getCurrentUser().uid)
	var user = $firebaseObject(ref)
	$scope.name = user.name;
	$scope.email = user.email;
	$scope.phone = user.phone;
})