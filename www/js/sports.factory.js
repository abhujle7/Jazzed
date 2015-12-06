app.factory('SportsFactory', function($http) { 
	var data;
	return {
		get: function(info) {
			var baseUrl = 'http://api.seatgeek.com/2/events?'
			if (info.performer) {
				var person = info.performer.toLowerCase().split(' ').join('-');
				baseUrl += '&q=' + person
			}
			if (info.date) {
				console.log(info.date)
				baseUrl += '&datetime_local.gte=' + info.date
			}
			if (info.state) {
				baseUrl += '&venue.state=' + info.state
			}

			return $http.get(baseUrl)
				.then(function(response) {
					data = response.data.events
					return response.data.events
				})
		},
		result: function() {
			return data;
		}	
	}
});