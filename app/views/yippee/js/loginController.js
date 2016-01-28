angular.module('login.controller', ['ionic', 'firebase', 'yippee.services'])

.controller('loginController', function ($scope, $ionicModal, $state, $ionicLoading, $ionicPopup, $firebaseAuth, $rootScope, $localstorage, Auth, $firebaseArray, $firebaseObject, BreakLocation, ref, amOnline) {

	$ionicModal.fromTemplateUrl('templates/signup.html', {
		scope : $scope
	}).then(function (modal) {
		$scope.modal = modal;
	});

	// any time auth status updates, add the user data to scope, update friendslist/friendReqs, update user status
	Auth.$onAuth(function (authData) {
		$rootScope.authData = authData;
		if (authData == null) {
			console.log('auth data is null');
			$scope.clearFriends();
			$scope.clearChats();
			Firebase.goOffline();
		} else {
			$rootScope.uid = authData.uid;
			amOnline.on('value', function (snapshot) {
				if (snapshot.val()) {
					ref.child('users').child('' + authData.uid).child('status').onDisconnect().set('Offline');
				}
			});
			$scope.initFriends(authData);
			// listener to automatically set user status according to break mode or studymode
			$scope.breakListener = $rootScope.$watchGroup(['breakMode', 'studyMode'], function (newValues, oldValues) {
					if (newValues[0]) {
						ref.child('users').child('' + authData.uid).child('status').set('Online - Having a break');
					} else if (newValues[1]) {
						ref.child('users').child('' + authData.uid).child('status').set('Online - Studying');
					} else {
						ref.child('users').child('' + authData.uid).child('status').set('Online');
					}
				});
			// listener to update users last break location
			$scope.breakLocListener = $rootScope.$watchCollection(function () {
					return BreakLocation.getBreakLocation();
				}, function (newValue, oldValue) {
					if (newValue !== oldValue) {
						console.log(newValue.details.id);
						ref.child('users').child('' + authData.uid).child('lastBreakLocation').set(newValue.details.id);
					}
				});
			$scope.retrieveChats(authData);
		}
	});

	$scope.clearChats = function () {
		// clear all existing chats;
		$rootScope.filteredrooms = null;
		$rootScope.chatrooms = null;
		ref.child('users').child('' + $rootScope.uid).child('chats').off();
	}


	$scope.clearFriends = function () {
		$rootScope.friends = null;
		$rootScope.friendReqs = null;
		if (typeof $rootScope.uid !== 'undefined') {
			// remove 3 listeners on friendLists
			ref.child('friendLists').child('' + $rootScope.uid).off();
			ref.child('friendLists').child('' + $rootScope.uid).off();
			ref.child('friendLists').child('' + $rootScope.uid).off();
			ref.child('friendRequests').child('' + $rootScope.uid).off();
		}
	};

	$scope.initFriends = function (authData) {
		ref.child('users').child('' + authData.uid).once('value', function (snapshot) {
			$rootScope.displayName = snapshot.val().displayName;
		});
		ref.child('friendLists').child('' + authData.uid).on('value', function (dataSnapshot) {
			$rootScope.friends = $firebaseArray(ref.child('friendLists').child('' + authData.uid));
			$rootScope.friends.$loaded(function () {
				if ($localstorage.getObject("friends") !== null) {
					$localstorage.removeItem('friends');
				}
				$localstorage.setObject('friends', $rootScope.friends);
			});
		});
		ref.child('friendLists').child('' + authData.uid).on('child_added', function (dataSnapshot) {
			$scope.resetStatusListeners(authData.uid);
		});
		ref.child('friendLists').child('' + authData.uid).on('child_removed', function (dataSnapshot) {
			var key = dataSnapshot.key();
			ref.child('users').child('' + key).child('status').off();
		});
		ref.child('friendRequests').child('' + authData.uid).on('value', function (dataSnapshot) {
			$rootScope.friendReqs = $firebaseArray(ref.child('friendRequests').child('' + authData.uid));
		});
	};


	$scope.resetStatusListeners = function (uid) {
		ref.child('friendLists').child('' + uid).once('value', function (snapshot) {
			snapshot.forEach(function (childSnapshot) {
				var key = childSnapshot.key();
				ref.child('users').child('' + key).child('status').off();
				ref.child('users').child('' + key).child('status').on('value', function (dataSnapshot) {
					var status = dataSnapshot.val();
					ref.child('friendLists').child('' + uid).child('' + key).child('friendStatus').set(status);
				});
			});
		});
	};

	$scope.retrieveChats = function (authData) {
		// first set chatrooms to null to clear old chats on Authentication
		$rootScope.chatrooms = null;
		var roomsref = ref.child('rooms');
		// set a "listener" for changes in chats currently in to add new chats continuously
		// iterate through the list of chats you should be in and add them into chatrooms accordingly
		ref.child('users').child('' + authData.uid).child('chats').on('value', function (snapshot) {
			$rootScope.chatrooms = [];
			snapshot.forEach(function (childSnapshot) {
				roomid = childSnapshot.child('num').val();
				// push a synchronized firebaseObject into the array
				$rootScope.chatrooms.push($firebaseObject(roomsref.child('' + roomid)));
			});

		})

	};
	var contains = function (indices, val) {
		for (var i = 0; i < indices.length; i++) {
			if (indices[i] == val) {
				return true;
			};
		};
		return false;
	};

	$scope.createUser = function (user) {
		if (user && user.email && user.password && user.displayname) {
			$ionicLoading.show({
				template : 'Signing Up...'
			});
			Firebase.goOnline();
			Auth.$createUser({
				email : user.email,
				password : user.password
			}).then(function (userData) {
				$ionicLoading.hide();
				$ionicLoading.show({
					template : 'Registration successful!',
					duration : 700
				});
				ref.child("users").child(userData.uid).set({
					email : user.email,
					displayName : user.displayname,
					lastBreakLocation : '',
					status : 'Offline'
				});
				$scope.modal.hide();
			}).catch (function (error) {
				$ionicLoading.hide();
				$ionicPopup.alert({
					title : 'Error!',
					template : '' + error.message
				});
			});
		} else
			$ionicPopup.alert({
				title : 'Error!',
				template : 'Please enter all fields.'
			});
	}

	$scope.signIn = function (user) {
		if (user && user.email && user.pwdForLogin) {
			$ionicLoading.show({
				template : 'Signing In...'
			});
			Firebase.goOnline();
			Auth.$authWithPassword({
				email : user.email,
				password : user.pwdForLogin
			}).then(function (authData) {
				ref.child('users').child('' + authData.uid).child('status').set('Online', function(error) {
                    ref.child('users').child('' + authData.uid).once('value', function (snapshot) {
                        var val = snapshot.val();
                        $localstorage.set('email', val.email);
                        $localstorage.set('displayName', val.displayName);
                        $localstorage.set('uid', authData.uid);
                        $rootScope.uid = authData.uid;
                        $rootScope.displayName = val.displayName;
                        $ionicLoading.hide();
                    });
                });
			}).catch (function (error) {
				$ionicLoading.hide();
				$ionicPopup.alert({
					title : 'Error!',
					template : '' + error.message
				});
			});
		} else
			$ionicPopup.alert({
				template : 'Please enter all fields.'
			});
	}

	$rootScope.logout = function () {
		$ionicLoading.show({
			template : 'Logging Out...',
			duration : 600
		});
		if (typeof $rootScope.authData !== 'undefined') {
			$localstorage.removeItem('displayName');
			$localstorage.removeItem('email');
			$localstorage.removeItem('friends');
			$localstorage.removeItem('uid');
			console.log('cleared localstorage');
		}
		$scope.breakListener();
		$scope.breakLocListener();
		ref.child('users').child('' + $rootScope.uid).child('status').set('Offline', function (callback) {
			Auth.$unauth();
			Firebase.goOffline();
		});
	}

	// always go to chatrooms when clicking chat tab
	$scope.goChat = function () {
		$state.go('tab.chatrooms');
	}
});
