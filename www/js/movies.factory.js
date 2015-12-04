app.factory('MoviesFactory', function($http) {
	var movies;
	return {
		get: function(zip) {
			if (zip.toString().length < 5) {
				zip = '0' + zip
			}
			return $http.get('/api/movies/' + zip)
				.then(function(response) {
					movies = response.data.slice(0, 10)
					return movies
				})
		},

		result: function() {
			return movies;
		}
	}
})