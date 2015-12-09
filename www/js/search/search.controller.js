app.controller('SearchCtrl', function($scope, SportsFactory, $state, $stateParams) {

	$scope.search = function(eventInfo) {
		if (eventInfo.date) {
		eventInfo.date = moment(eventInfo.date).format('YYYY-MM-DD')
		}

		 return SportsFactory.get(eventInfo)
		 	.then(function(data) {
		 		$scope.searching;
				$state.go('app.tab.results', {id: $stateParams.id})
		 	})
	}

})