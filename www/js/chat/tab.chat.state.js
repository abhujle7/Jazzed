app.config(function($stateProvider) {

  $stateProvider
  .state('app.tab.chat', {
    cache: false,
    url: '/chat/:id',
    views: {
      'roomsView': {
        templateUrl: 'js/chat/chat.html',
        controller: 'ChatCtrl'
      }
    },
    resolve: {
      currentRoomId: function($stateParams) {
        return $stateParams.id
      }
    }
  })
});