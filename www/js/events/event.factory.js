app.factory('EventFactory', function($q, $state, $firebase, $firebaseArray, $ionicHistory, AuthFactory) {
	
	var ref = new Firebase('https://boiling-fire-3161.firebaseio.com');
	var events = $firebaseArray(ref.child('events'));

	var fixedEvents = $firebaseArray(ref.child('events').child('fixed'));
	var customEvents = $firebaseArray(ref.child('events').child('custom'));

	var locationChild = $firebaseArray(ref.child('events').child('fixed').child('location'));
	var currentUser = AuthFactory.getCurrentUser();

	// var currGroup = ref
	function convertToArray(eventsList) {
		var eventsArr = [];
		for (var key in eventsList) {
			if (typeof eventsList[key] == "object" && eventsList[key])
				eventsArr.push(eventsList[key]);
		}	
		return eventsArr;
	}

	return {

		all: function() {
			var deferred = $q.defer();
			events.$loaded(function(eventsList) {
				console.log(eventsList[0], eventsList[1]);
				var fixedEventsArr = convertToArray(eventsList[0]);
				var customEventArr = convertToArray(eventsList[1]);
				deferred.resolve(fixedEventsArr.concat(customEventArr));
			});		
			return deferred.promise; 
		},
		addFixedEvent: function(eventName, eventTime, eventLocation, locationName) {
			console.log("Fixed happened");
			fixedEvents.$add({
				name: eventName,
				time: eventTime,
				location: {
					name: locationName,
					coordinates: eventLocation
				}
			})
			.then(function() {
				$ionicHistory.goBack(); //goes back to previous view
			})
		},
		addCustomEvent: function(eventName, eventTime, eventLocation, locationName, group_id) {
			console.log("custom happened", group_id);
			customEvents.$add({
				// group_id: group_id,
				name: eventName,
				time: eventTime,
				location: {
					name: locationName,
					coordinates: eventLocation
				},
				groups: {
					id: group_id
				}
			}).then(function(ref) {
				var id = ref.key();
				//I need to find the current group or select a group
			})
			.then(function() {
				$state.go('tab.events');
			})
		}
		// addCustomEvent: function(eventName, eventTime, eventLocation, locationName, group_id) {
		// 	console.log("custom happened", group_id);
		// 	customEvents.$add({
		// 		// group_id: group_id,
		// 		name: eventName,
		// 		time: eventTime,
		// 		location: {
		// 			name: locationName,
		// 			coordinates: eventLocation
		// 		},
		// 		groups: {

		// 		}
		// 	}).then(function(ref) {
		// 		var id = ref.key();
		// 		//I need to find the current group or select a group
		// 	})
		// 	.then(function() {
		// 		$state.go('tab.events');
		// 	})
		// }
	}
})

/*


        "custom": {
          ".write": true,
          "$event_id": {
            ".validate": "newData.val().length < 20 && newData.val().length > 0",
            "name": {
              ".write": "root.child('groups/' + $group_id + '/members/' + auth.uid).exists()",
              ".validate": "root.child('groups/' + $group_id).exists()"
            },
            "time": {
              ".validate": "newData.val() <= now"
              },
            "location": {
              ".validate": "newData.hasChildren(['name', 'coordinates'])",
              "name": {".validate": "newData.isString() && newData.val().length < 20"},
              "coordinates": {
                ".validate": "newData.val().length === 2  || data.val().length === 2"
              } 
            },
            "groups": {
              "$group_id": {
               ".validate": "root.child('groups/' + $group_id).exists()",
               "name": "root.child('groups/' + $group_id + '/name').exists()"
              }
            }
          }
        }
      }
    }









  "events": {
    "$event_id": {
      ".validate": "root.child('events/' + $event_id).exists()"
  } 

  note that we have a get function
  	if this gets the current room
  		from inside that room we add a custom event
  		so we will basically pass it the room
*/



/*
-----To-do list----
Switch name or event._id

add custom events

show past events
show current events (polls)
show planned events


switch name and id for custom

*/


 //----------------------------------------
      // "events": {
      //   "fixed": {
      // 	".write": "auth !== null",
      //     "$event_id": {
      //       ".validate": "(newData.child('name').exists()) && (newData.exists() && newData.hasChildren(['time', 'location']))",
      //       "name": {
      //         ".validate": "newData.val().length < 20 && newData.val().length > 0"
      //       },
      //       "time": {
      //         ".validate": "newData.val() <= now"
      //       },
      //       "location": {
      //         ".validate": "newData.hasChildren(['name', 'coordinates'])",
      //         "name": {".validate": "newData.isString() && newData.val().length < 20"},
      //         "coordinates": {
      //			".validate": "newData.val().length < 20 && newData.val().length > 0"
      //         } 
      //       }
      //     }
      //   },



      /*

{
    "rules": {
      ".read": true,
      "users": {
        "$user_id": {
          ".read" : "auth !== null && $user_id === auth.uid",
          ".write": "auth !== null",
          "name": {".validate": "newData.isString()"},
          "email": {".validate": "newData.isString()"},
          "phone": {".validate": "newData.isString()"},
          "photo": {".validate": "newData.isString()"},
          "groups": {
            "$group_id": {
              ".validate": "root.child('groups/' + $group_id).exists()"
            }  
          },
          "contacts": {
            "$contact_id": {
              ".validate": "root.child('users/' + $contact_id).exists()"
            }
          }
        }
      },
      "groups": {
        ".write": "auth !== null",
        "$group_id": {
          ".read": "data.child('members').child(auth.uid).exists()",
          ".validate": "newData.hasChildren(['name'])",
          "name": {
            ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length < 20"
          },
          "members": {
            ".write": "root.child('users/' + auth.uid + '/groups/' + $group_id).exists()",
            "$user_id": {
              //".validate": "root.child('users/' + $user_id).exists()"
            }
          },
          "events": {
            "$event_id": {
              ".validate": "root.child('events/' + $event_id).exists()"
            } 
          }
        }
      },
      "messages": {
        "$group_id": {
          ".read": "root.child('groups/' + $group_id + '/members/' + auth.uid).exists()",
          ".validate": "root.child('groups/' + $group_id).exists()",
          "$message_id": {
            ".write": true,
            //".write": "root.child('groups/' + $group_id + '/members/' + auth.uid).exists() && !data.exists() && newData.exists()",
            ".validate": "newData.hasChildren(['user', 'message'])",
            "user": {
              ".validate": "newData.val() === auth.uid"
            },
            "message": {
                ".validate": "newData.isString()"
            }
            //"$other": {".validate": false}
          }
        }
      },
      "consensus": {
        "$group_id" : {
          ".read": "root.child('groups/' + $group_id + '/members/' + auth.uid).exists()",
          ".validate": "root.child('groups/' + $group_id).exists()",
          "$consensus_id": {
            ".write": "root.child('groups/' + $group_id + '/members/' + auth.uid).exists() && !data.exists() && newData.exists()",
            ".validate": "newData.hasChildren(['user', 'poll', 'timestamp'])",
            "user": {
              ".validate": "newData.val() === auth.uid"
            },
            "poll": {
              "$poll_options": {
                ".validate": "(newData.hasChildren(['name', 'votes']) ) ",
                "name": {".validate": "newData.isString()"},
                "votes": {".validate": "newData.isNumber()"}
              }
            },
            "timestamp": {
              ".validate": "newData.val() <= now"
            },
            "$other": {".validate": false}
          }
        }
      },
      "events": {
        "fixed": {
      	".write": "auth !== null",
          "name": {
            ".validate": "newData.val().length < 20 && newData.val().length > 0",            
            "$event_id": {
              ".validate": "(data.child('name').exists()) && (newData.exists() && newData.hasChildren(['time', 'location']))",
              "time": {
                ".validate": "newData.val() <= now"
              },
              "location": {
                ".validate": "newData.hasChildren(['name'])",
                "name": {".validate": "newData.isString() && newData.val().length < 20"},
                "coordinates": {
                  ".validate": "newData.val().length < 20 && newData.val().length > 0"
                }
              }
            }
          }
        },
        "custom": {
        ".write": true,
        "$event_id": {
            ".validate": "newData.val().length < 20 && newData.val().length > 0",
            "name": {
              ".write": "root.child('groups/' + $group_id + '/members/' + auth.uid).exists()"
//              ".validate": "root.child('groups/' + $group_id).exists()"   
            },
            "time": {
              ".validate": "newData.val() <= now"
            },
            "location": {
              ".validate": "newData.hasChildren(['name', 'coordinates'])",
              "name": {".validate": "newData.isString() && newData.val().length < 20"},
              "coordinates": {
                ".validate": "newData.val().length === 2  || data.val().length === 2"
              } 
            },
            "groups": {
              "$group_id": {
               ".validate": "root.child('groups/' + $group_id).exists()"
  //             "name": "root.child('groups/' + $group_id + '/name').exists()"
              }
            }
          }
        }
      }
    }  
  }


      */