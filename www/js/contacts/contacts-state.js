app.config(function($stateProvider) {
    $stateProvider
    .state('app.tab.contacts', {
        url: '/contacts',
        views: {
            'contactsView': {
                templateUrl: 'js/contacts/contacts.html',
                controller: 'ContactsCtrl'
            }
        }
    })
})