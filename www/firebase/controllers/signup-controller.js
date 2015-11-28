app.controller('RegisterCtrl', function($scope, $firebaseAuth, AuthFactory, $state) {
    $scope.signUp = function(credentials) {
        AuthFactory.signUp(credentials)
        .then(function(user) {
            $state.go('tab.account', {uid: user.uid})
        })
    }
    $scope.signIn = function(credentials) {
        AuthFactory.signIn(credentials)
        .then(function(user) {
            $state.go('tab.account', {uid: user.uid})
        })
    }
})