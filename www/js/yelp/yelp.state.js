app.config(function($stateProvider) {
  $stateProvider
  .state('tab.yelp', {
    url: '/yelp',
    views: {
      'roomsView': {
        templateUrl: 'js/yelp/yelp.search.html',
        controller: 'YelpCtrl'
      }
    }
  })
});