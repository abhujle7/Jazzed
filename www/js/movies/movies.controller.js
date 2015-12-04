app.controller('MoviesCtrl', function($scope, $state, MoviesFactory) {
	$scope.search = function(zip) {
		return MoviesFactory.get(zip)
		 	.then(function(movies) {
		 		console.log(movies)
				$state.go('tab.mvresults')
		 	})
	}

})