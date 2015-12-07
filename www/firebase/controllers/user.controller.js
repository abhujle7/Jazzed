app.controller('UserCtrl', function($scope, $firebase, AuthFactory, $ionicActionSheet) {
	var ref = new Firebase('https://boiling-fire-3161.firebaseio.com/users/' + AuthFactory.getCurrentUser().uid)
	var user = $firebase(ref)
	$scope.name = user.name;
	$scope.email = user.email;
	$scope.phone = user.phone;

	$scope.pullUpPhotoMenu = function() {
		var changePhotoMenu = $ionicActionSheet.show({
			buttons: [
		       { text: 'Upload Photo' },
		       { text: 'Take Picture' }
		    ],
		    cancelText: 'Cancel',
		    cancel: function() {
		    	return true
		    },
		    buttonPressed: function(index) {
		    	
		    }
		})
	}
})