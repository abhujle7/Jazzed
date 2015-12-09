app.config(function($stateProvider) {
  $stateProvider
  .state('app.tab.search', {
    url: '/search/:id',
    views: {
      'roomsView': {
        templateUrl: 'js/search/search.html',
        controller: 'SearchCtrl'
      }
    }
  })
});