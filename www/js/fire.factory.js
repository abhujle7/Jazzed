app.factory("AuthFactory", ["$firebaseArray", "$firebaseObject", "$firebaseAuth",
  function($firebaseObject, $firebaseAuth) {
    var ref = new Firebase('https://boiling-fire-3161.firebaseio.com')
    var auth = $firebaseAuth(ref);
    return {
      signUp: function(credentials) {
        return auth.$createUser({email: credentials.email, password: credentials.password})
        .then(function(user) {
          user.name = credentials.name;
          user.phone = credentials.phone;
          user.email = credentials.email;
          return user
        })
        .catch(console.error)
      },
      getCurrentUser: function() {
        console.log(ref.getAuth())
        return ref.getAuth()
      },
      signIn: function(credentials) {
        var email = credentials.email;
        var password = credentials.password;
        auth.$authWithPassword({
          email: email,
          password: password
        })
        .then(function(user) {
          console.log('logged in yaya')
        })
        .catch(console.error)
      }
    }
  }
]);