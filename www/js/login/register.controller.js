app.controller('RegisterCtrl', function($scope, AuthFactory, $state, $ionicPopup) {
    
    // $ionicModal.fromTemplateUrl('js/login/login.html', {
    // scope: $scope })
    // .then(function (modal) {
    // $scope.modal = modal;
    // });

    $scope.emails = AuthFactory.existingEmails();
    $scope.phones = AuthFactory.existingPhones();


    $scope.signUp = function(credentials) {
        if ($scope.emails.indexOf(credentials.email) !== -1) {
            $scope.error = $ionicPopup.alert({
                title: 'Invalid email',
                template: 'That email is either taken or invalid. Please try again :)'
            })   
        }        
        else if ($scope.phones.indexOf(credentials.phone.replace(/\D/, "")) !== -1) {
            $scope.error = $ionicPopup.alert({
                title: 'Invalid phone',
                template: 'That number is already registered! Please try again :)'
            })   
        }
        else {
            AuthFactory.signUp(credentials)
            .then(function(user) {
                $state.go('app.tab.rooms', {uid: user.uid})
            })  
        }
    }
    $scope.signIn = function(credentials) {
        if (AuthFactory.signIn(credentials) === "Invalid login") {
            $scope.error = $ionicPopup.alert({
                title: 'Invalid login',
                template: 'Oops, you might have spelled something wrong! Please try again :)'
            })
        }
        else {
            AuthFactory.signIn(credentials)
            .then(function(user) {
                $state.go('app.tab.rooms', {uid: user.uid})
            })    
        }
    }
})