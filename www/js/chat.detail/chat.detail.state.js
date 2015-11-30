app.config(function($stateProvider) {

  $stateProvider

  .state('chat-detail', {
    url: '/chats/:chatId',
    views: {
      'chatDetailView': {
        templateUrl: 'js/chat.detail/chat.detail.html',
        controller: 'ChatDetailCtrl'
      }
    }
  })
});