app.config(function($stateProvider) {
	$stateProvider
	.state('tab.contacts', {
		url: '/contacts/:uid',
		views: {
			'contactsView': {
				templateUrl: 'js/contacts/contacts.html',
				controller: 'ContactsCtrl'
			}
		}
	})
})