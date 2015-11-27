app.controller('RegisterCtrl', ['$scope', '$firebaseAuth', 'AuthFactory', function($scope, $firebaseAuth, AuthFactory) {
    $scope.signUp = function(credentials) {
        AuthFactory.signUp(credentials)
    }
}])