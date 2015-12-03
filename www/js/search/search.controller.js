app.controller('SearchCtrl', function($scope, SportsFactory, $state) {

	$scope.search = function(eventInfo) {
		 return SportsFactory.get(eventInfo)
		 	.then(function(data) {
				$state.go('tab.results')
		 	})
	}

})