app.factory('ApiFactory', function() {
	var event = {};
	return {
		set: function(name, location, time) {
			event.name = name;
			if (event.time) {
				event.date = moment(time).format('L')
				event.time = moment(time).format('hh:mm a')
			}
			event.location = location;
		},
		get: function() {
			return event;
		}
	}
})