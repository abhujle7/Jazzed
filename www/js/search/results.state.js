app.config(function($stateProvider) {
  $stateProvider
  .state('tab.results', {
    url: '/results',
    views: {
      'roomsView': {
        templateUrl: 'js/search/results.html',
        controller: 'ResultsCtrl'
       }
    }
   })
});