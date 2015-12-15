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
                deferred.resolve(userContacts);
            }

            function onError(contactError) {
                alert('onError!');
            }

            var options      = new ContactFindOptions();
            options.filter   = "";
            options.multiple = true;
            options.desiredFields = ['phoneNumbers', 'displayName', 'name']
            options.hasPhoneNumber = true; //android only
            var fields       = ['displayName', 'phoneNumbers'];
            navigator.contacts.find(fields, onSuccess, onError, options)
         }
    }
})