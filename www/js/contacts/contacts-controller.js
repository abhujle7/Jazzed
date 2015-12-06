app.controller('ContactsCtrl', function($scope, contacts, ContactsFactory, AuthFactory){
	document.addEventListener("deviceready", ContactsFactory.onDeviceReady, false)
	var userContacts = contacts;
	var phoneToUserHash = AuthFactory.phoneToUser();
	var userRef = new Firebase('https://boiling-fire-3161.firebaseio.com/users')
	function parsePhone(number) {
		var digits = number.replace(/\D/g, "");
		if (digits[0] == '1') {
			digits = digits.slice(1)
		}
		return digits
	}
	$scope.contacts = (function() {
		var arr = [];
		for (var i = 0; i < userContacts.length; i++) {
			var number = parsePhone(userContacts[i])
			if (phoneToUserHash[number]) {
				console.log(number)
				var uid = phoneToUserHash[number];
				userRef.child(uid).on("value", function(snapshot) {
					var name = snapshot.val().name
					var phone = number
					var photo = snapshot.val().photo
					arr.push({
						name: name,
						phone: phone,
						photo: photo
					})
				})
			}
		}
		return arr
	})()	

});









