app.factory('SportsFactory', function($http) {
	return {
		get: function(person, place, date) {
			return $http.get('http://api.seatgeek.com/2/events?venue.state=NY&performers.slug=new-york-mets')
				.then(function(response) {
					console.log(response.data.events)
					return response.data.events
				})
		}	
	}
});