app.controller('RegisterCtrl', function($scope, $firebaseAuth, AuthFactory, $state, $rootScope, $ionicModal) {
    
    // $ionicModal.fromTemplateUrl('js/login/login.html', {
    // scope: $scope })
    // .then(function (modal) {
    // $scope.modal = modal;
    // });


    $scope.signUp = function(credentials) {
        AuthFactory.signUp(credentials)
        .then(function(user) {
            $rootScope.user = user;
            $state.go('tab.rooms', {uid: user.uid})
        })
    }
    $scope.signIn = function(credentials) {
        AuthFactory.signIn(credentials)
        .then(function(user) {
            $rootScope.user = user;
            $state.go('tab.rooms', {uid: user.uid})
        })
    }
})