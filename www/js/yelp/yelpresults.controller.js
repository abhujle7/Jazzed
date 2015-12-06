app.controller('YelprCtrl', function($scope, YelpFactory) {
	$scope.results = YelpFactory.businesses().businesses
})