app.config(function($stateProvider) {
  $stateProvider
  .state('app.tab.search', {
    url: '/search',
    views: {
      'roomsView': {
        templateUrl: 'js/search/search.html',
        controller: 'SearchCtrl'
      }
    }
  })
});