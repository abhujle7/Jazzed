app.controller('RegisterCtrl', function($scope, $firebaseAuth, AuthFactory, $state, $rootScope, $ionicPopup) {
    
    // $ionicModal.fromTemplateUrl('js/login/login.html', {
    // scope: $scope })
    // .then(function (modal) {
    // $scope.modal = modal;
    // });


    $scope.signUp = function(credentials) {
        if (!AuthFactory.getCurrentUser()) {
            $scope.error = $ionicPopup.alert({
                title: 'Invalid email',
                template: 'That email is either taken or invalid. Please try again :)'
            })   
        }        
        else if (AuthFactory.signUp(credentials) === "Invalid phone") {
            $scope.error = $ionicPopup.alert({
                title: 'Invalid phone',
                template: 'That number is already registered! Please try again :)'
            })   
        }
        else {
            AuthFactory.signUp(credentials)
            .then(function(user) {
                console.log('user', user.uid)
                $state.go('tab.rooms', {uid: user.uid})
            }) 
            .then(null, function(error) {
                return error
            })   
        }
    }
    $scope.signIn = function(credentials) {
        if (!AuthFactory.getCurrentUser()) {
            $scope.error = $ionicPopup.alert({
                title: 'Invalid login',
                template: 'Oops, you might have spelled something wrong! Please try again :)'
            })   
        }
        else {
            AuthFactory.signIn(credentials)
            .then(function(user) {
                $state.go('tab.rooms', {uid: user.uid})
            })    
        }
    }
})