app.config(function($stateProvider) {
// I dont know how I feel about this directory structure
  $stateProvider
  .state('tab.chats', {
    url: '/chats',
    views: {
      'tab-chats': {
        templateUrl: 'templates/tab-chats.html',
        controller: 'ChatsCtrl'
      }
    }
  })
});
