app.factory("AuthFactory", function($firebaseObject, $firebaseAuth, $firebaseArray) {
    var ref = new Firebase('https://boiling-fire-3161.firebaseio.com')
    var auth = $firebaseAuth(ref);
    var users = ref.child('users')
    var phoneNums = []
    users.once("value", function(allUsers) {
      allUsers.forEach(function(oneUser) {
        var phone = oneUser.child('phone').val().replace(/\D/, "");
        phoneNums.push(phone)
      })
    })
    return {
      signUp: function(credentials) {
        if (phoneNums.indexOf(credentials.phone.replace(/\D/, "")) === -1) {
          return auth.$createUser({email: credentials.email, password: credentials.password})
          .then(function(user) {
            if (!user) {
              return false
            }
            user.name = credentials.name;
            user.phone = credentials.phone;
            user.email = credentials.email;
            users.child(user.uid).set({
              name: user.name,
              phone: user.phone.replace(/\D/, ""),
              email: user.email
            })
            phoneNums.push(credentials.phone.replace(/\D/, ""))
            return user
          })
          .then(function(input) {
            if (!input) {
              return false
            } 
            var email = credentials.email;
            var password = credentials.password;
            return auth.$authWithPassword({
              email: email,
              password: password
            })
          })
          .catch(console.error)
        }
        else {
          return false
        }
      },
      getCurrentUser: function() {
        return ref.getAuth()
      },
      signIn: function(credentials) {
        var email = credentials.email;
        var password = credentials.password;
        return auth.$authWithPassword({
          email: email,
          password: password
        })
        .catch(console.error)
      }
    }
  });