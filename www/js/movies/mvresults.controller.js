app.controller('MvCtrl', function($scope, MoviesFactory) {
	$scope.results = MoviesFactory.result()
})