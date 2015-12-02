app.controller('SearchCtrl', function($scope, SportsFactory, $state) {

	$scope.results;

	$scope.search = function() {
		return SportsFactory.get()
			.then(function(data) {
				$scope.results = data;
				$state.go('tab.results')
			})
	}




})