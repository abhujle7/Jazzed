app.config(function($stateProvider) {
  $stateProvider
  .state('tab.results', {
    url: '/results',
    views: {
      'searchView': {
        templateUrl: 'js/search/results.html',
        controller: 'ResultsCtrl'
       }
    }
   })
});