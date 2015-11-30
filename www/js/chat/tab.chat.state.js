app.config(function($stateProvider) {

  $stateProvider
  .state('tab.chat', {
    url: '/chat',
    views: {
      'roomsView': {
        templateUrl: 'js/chat/chat.html',
        controller: 'ChatCtrl'
      }
    }
  })
});