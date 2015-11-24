app.factory("User", ["$firebaseObject",
  function($firebaseObject) {
    // create a new service based on $firebaseObject
    var User = $firebaseObject.$extend({
      // these methods exist on the prototype, so we can access the data using `this`
      getFullName: function() {
        return this.firstName + " " + this.lastName;
      }
    });
    return function(userId) {
      var ref = new Firebase("https://<YOUR-FIREBASE-APP>.firebaseio.com/users/").child(userId);
      // create an instance of User (the new operator is required)
      return new User(ref);
    }
  }
]);