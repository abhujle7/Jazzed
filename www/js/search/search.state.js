app.config(function($stateProvider) {
  $stateProvider
  .state('tab.search', {
    url: '/search',
    views: {
      'searchView': {
        templateUrl: 'js/search/search.html',
        controller: 'SearchCtrl'
      }
    }
  })
});