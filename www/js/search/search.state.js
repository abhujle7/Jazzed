app.config(function($stateProvider) {
  $stateProvider
  .state('tab.search', {
    url: '/search',
    views: {
      'roomsView': {
        templateUrl: 'js/search/search.html',
        controller: 'SearchCtrl'
      }
    }
  })
});