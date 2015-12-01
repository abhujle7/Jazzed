// angular.module('starter.controllers', [])

app.controller('AccountCtrl', function($scope, $state) {


var ref = new Firebase('https://boiling-fire-3161.firebaseio.com')

  $scope.settings = {
    enableFriends: true
  };
<<<<<<< HEAD

  $scope.logout = function() {
  	ref.unauth();
  	$state.go('login')
  }

  $scope.places = function() {
  	yelp.search({ term: 'mexican', location: 'Brooklyn' })
.then(function (data) {
  console.log(data);
})
  }

=======
 
>>>>>>> 6a6378a124e0546a39e962037488126ba21b3b32
});
