app.factory("AuthFactory", function($firebaseObject, $firebaseAuth, $firebaseArray) {
    var ref = new Firebase('https://boiling-fire-3161.firebaseio.com')
    var auth = $firebaseAuth(ref);
    var users = ref.child('users')
    var emails = []
    var phoneNums = []
    users.once("value", function(allUsers) {
      allUsers.forEach(function(oneUser) {
        var phone = oneUser.child('phone').val();
        var email = oneUser.child('email').val()
        phoneNums.push(phone)
        emails.push(email)
      })
    })
    return {
      signUp: function(credentials) {
        if (phoneNums.indexOf(credentials.phone.replace(/\D/, "")) === -1 && emails.indexOf(credentials.email) === -1) {
          return auth.$createUser({email: credentials.email, password: credentials.password})
          .then(function(user) {
            var email = credentials.email;
            var password = credentials.password;
            return auth.$authWithPassword({
              email: email,
              password: password
            })
          })
          .then(function(user) {
            user.name = credentials.name;
            user.phone = credentials.phone;
            user.email = credentials.email;
            users.child(user.uid).set({
              name: user.name,
              phone: user.phone,
              email: user.email
            })
            emails.push(credentials.email)
            phoneNums.push(credentials.phone)
            return user
          })
          .catch(console.error)  
        }
        else {
          if (phoneNums.indexOf(credentials.phone.replace(/\D/, "")) !== -1) {
            return "Invalid phone"
          }
          if (emails.indexOf(credentials.email) !== -1) {
            return "Invalid email"
          }
        }
      },
      getCurrentUser: function() {
        return ref.getAuth()
      },
      signIn: function(credentials) {
        var email = credentials.email;
        var password = credentials.password;
        if (!auth.$authWithPassword({
          email: email,
          password: password
        })) {
          return "Invalid login"
        }
        else {
          return auth.$authWithPassword({
            email: email,
            password: password
          })   
          .then(null, function(error) {
            console.log(error)
          })
        }
      }
    }
  });