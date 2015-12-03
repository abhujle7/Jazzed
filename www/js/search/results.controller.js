app.controller('ResultsCtrl', function($scope, SportsFactory) {

	$scope.results = SportsFactory.result()


})