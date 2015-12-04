app.config(function($stateProvider) {
	$stateProvider
	.state('tab.contacts', {
		url: '/contacts/:uid',
		views: {
			'contactsView': {
				templateUrl: 'js/contacts/contacts.html',
				controller: 'ContactsCtrl'
			}
		},
		resolve: {
			blah: function(ContactsFactory) {
				document.addEventListener("deviceready", ContactsFactory.onDeviceReady, false)
			},
			contacts: function(blah, ContactsFactory) {
				return ContactsFactory.getPromise()
					.then(null, console.error)
			}
		}
	})
})