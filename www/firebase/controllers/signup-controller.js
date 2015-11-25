app.controller('RegisterCtrl', ['$scope', '$firebaseAuth', function($scope, $firebaseAuth) {
	var ref = new Firebase('https://boiling-fire-3161.firebaseio.com')
	var auth = $firebaseAuth(ref);
	$scope.signUp = function () {
		if (!$scope.regForm.$invalid) {
			var name = $scope.user.name;
            var email = $scope.user.email;
            var password = $scope.user.password;
            if (name && email && password) {
                auth.$createUser(email, password)
                .then(function(user) {
                    // do things if success
                    user.name = name
                    console.log('User creation success', user);
                    var users = new Firebase('https://boiling-fire-3161.firebaseio.com/users')
                    users.$push(user)
                }, function(error) {
                    // do things if failure
                    console.log(error);
                });
            }
        }
	}
}])