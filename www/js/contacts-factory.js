app.factory('ContactsFactory', function(AuthFactory, $firebaseObject, $q) {
	var userContacts = [];
	var phoneToUserHash = AuthFactory.phoneToUser()
	var deferred = $q.defer();


	function parsePhone(number) {
	    var killDigits = number.replace(/\D/g, "")
	    if (killDigits[0] === '1') {
	        killDigits = killDigits.slice(1)
	    }
	    return killDigits
	}
		
	return {
		getPromise: function() {
			// deferred.promise.then(function(contactList) {
				// console.log(contactList);
			// });
			return deferred.promise;
		},
		onDeviceReady: function () {
			function onSuccess(contacts) {
			    alert('Loading contacts, please be patient :)');

			    userContacts = _(contacts)
			    	.pluck('phoneNumbers')
			    	.flatten()
			    	.pluck('value')
			    	.value();


			    // for (var i = 0; i<contacts.length; i++) {
			    // 	// console.log(contacts[i]);
			    // 	// console.log(contacts[i].phoneNumbers);
			    // 	if (contacts[i].phoneNumbers[0])
			    // 		userContacts.push(contacts[i].phoneNumbers[0].value)
			    // }

			    // console.log("making sure we return after all the console.logs in the loop", userContacts);
			    console.log("this is deviceonready")
			    deferred.resolve(userContacts); //this could be wrong
			}

			function onError(contactError) {
			    alert('onError!');
			}

			var options      = new ContactFindOptions();
			options.filter   = "";
			options.multiple = true;
			options.desiredFields = ['phoneNumbers', 'displayName', 'name']
			// options.hasPhoneNumber = true; //android only
			var fields       = ['displayName', 'phoneNumbers'];
			navigator.contacts.find(fields, onSuccess, onError, options)
	 	}
	}
})

/*
Why is nothing showing up?
	We ran a console.log in the for loop and i printed out to 525

------------------TO-DO-------------
console.log(this)?
general local storage as soon as this loads
*/




			    // window.localStorage.setItem('contacts', JSON.stringify(userContacts))


			    // return deferred.promise;
			    // console.log("the array is", userContacts);
			    // console.log("Is this an array?", [].isArray(userContacts));
			    // console.log("Does it have a element 0?", userContacts[0], userContacts['0']);