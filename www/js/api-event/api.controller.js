app.controller('ApiCtrl', function($scope, ApiFactory) {
	$scope.event = ApiFactory.get()
})