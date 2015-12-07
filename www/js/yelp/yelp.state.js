app.config(function($stateProvider) {
  $stateProvider
  .state('app.tab.yelp', {
    url: '/yelp',
    views: {
      'roomsView': {
        templateUrl: 'js/yelp/yelp.search.html',
        controller: 'YelpCtrl'
      }
    }
  })
});