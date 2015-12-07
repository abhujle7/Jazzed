app.config(function($stateProvider) {
  $stateProvider
  .state('app.tab.movies', {
    url: '/movies',
    views: {
      'roomsView': {
        templateUrl: 'js/movies/movies.search.html',
        controller: 'MoviesCtrl'
      }
    }
  })
});