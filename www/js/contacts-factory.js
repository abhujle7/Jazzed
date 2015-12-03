app.factory('ContactsFactory', function(AuthFactory, $firebaseObject) {
	var userContacts = [];
	var contactRef = new Firebase('https://boiling-fire-3161.firebaseio.com/users/' + AuthFactory.getCurrentUser().uid + '/contacts')
	var phones = AuthFactory.existingPhones()
	var usersRef = new Firebase('https://boiling-fire-3161.firebaseio.com/users/')
	var phoneToUserHash = AuthFactory.phoneToUser()


	function parsePhone(number) {
	    var killDigits = number.replace(/\D/g, "")
	    if (killDigits[0] === '1') {
	        killDigits = killDigits.slice(1)
	    }
	    return killDigits
	}

	document.addEventListener("deviceready", onDeviceReady, false)


		
	function onDeviceReady () {
		function onSuccess(contacts) {
		    alert('Loading contacts, please be patient :)');
		    for (var i = 0; i<contacts.length; i++) {
			    var contact = contacts[i].phoneNumbers;
			    if (contact.length) {
				    for (var j = 0; j<contact.length; j++) {
				    	var number = parsePhone(contact[j].value);
				    	if (phoneToUserHash[number] && phoneToUserHash[number] !== AuthFactory.getCurrentUser().uid) {
				    		var contactId = phoneToUserHash[number]
				    		contactRef.child(contactId).set(null)
				    		var contactBase = new Firebase('https://boiling-fire-3161.firebaseio.com/users/' + contactId)
				    		userContacts.push({
				    			name: contactBase.child('name'),
				    			phone: contactBase.child('phone'),
				    			photo: contactBase.child('photo')
				    		})
				    	}
				    }
			    }
		    }
		};

		function onError(contactError) {
		    alert('onError!');
		};

		var options      = new ContactFindOptions();
		options.filter   = "";
		options.multiple = true;
		options.desiredFields = ['phoneNumbers', 'displayName', 'name']
		options.hasPhoneNumber = true; //android only
		var fields       = ['displayName', 'phoneNumbers'];
		navigator.contacts.find(fields, onSuccess, onError, options)
 	}
 	return {
 		getContacts: function() {
 			return userContacts
 		}
 	}
	
})