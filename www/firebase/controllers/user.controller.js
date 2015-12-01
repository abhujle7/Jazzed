app.controller('UserCtrl', function($scope, AuthFactory) {
	var userRef = new Firebase('https://boiling-fire-3161.firebaseio.com/users/' + AuthFactory.getCurrentUser().uid)
})