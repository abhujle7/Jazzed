app.controller('SearchCtrl', function($scope, SportsFactory, $state) {

	$scope.search = function(eventInfo) {
		if (eventInfo.date) {
		eventInfo.date = moment(eventInfo.date).format('YYYY-MM-DD')
		}

		 return SportsFactory.get(eventInfo)
		 	.then(function(data) {
				$state.go('tab.results')
		 	})
	}

})