app.controller('UserCtrl', function($scope, $firebase, AuthFactory) {
	var ref = new Firebase('https://boiling-fire-3161.firebaseio.com/users/' + AuthFactory.getCurrentUser().uid)
	var user = $firebase(ref)
	$scope.name = user.name;
	$scope.email = user.email;
	$scope.phone = user.phone;
})