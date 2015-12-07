app.config(function($stateProvider) {
	$stateProvider
	.state('app.tab.contacts', {
		url: '/contacts',
		views: {
			'contactsView': {
				templateUrl: 'js/contacts/contacts.html',
				controller: 'ContactsCtrl'
			}
		},
		resolve: {
			registerListener: function(ContactsFactory) {
				document.addEventListener("deviceready", ContactsFactory.onDeviceReady, false)
			}
		}
	})
})