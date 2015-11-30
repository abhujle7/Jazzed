app.config(function($stateProvider) {

  $stateProvider
  .state('tab.chats', {
    url: '/chats',
    views: {
      'chatsView': {
        templateUrl: 'js/chats/chats.html',
        controller: 'ChatsCtrl'
      }
    }
  })
});