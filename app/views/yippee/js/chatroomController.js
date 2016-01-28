angular.module('chatroom.controller', ['ionic', 'firebase', 'yippee.services'])

// old factory to retrieve chats, now inside login controller!

// .factory('chatrooms', function ($firebaseArray, $rootScope, $firebaseObject, $localstorage) {
// 	var ref = new Firebase("https://vivid-inferno-2137.firebaseio.com/");
// 	var chatrooms = $firebaseArray(ref.child('rooms'));
//     console.log($rootScope.authData);
//     // Might use a resource here that returns a JSON array
//     var filteredrooms = [];


//     if ($rootScope.authData != null) {
    
//     var roomsref = ref.child('rooms');
    
//     var indexes = [];

//     //console.log($rootScope.authData);
//     // if ($rootScope.authData == null) {
//     // 	return chatrooms;
//     // }
//     // if($rootScope.authData == null) {
//     // 	return chatrooms;
//     // }

//     ref.child('users').child('' + $rootScope.authData.uid).child('chats').on('child_added', function (snapshot) {

// 				var roomid = snapshot.child('num').val();
// 					//console.log(roomid);
// 					//indexes.push(roomid);
// 					filteredrooms.push($firebaseObject(roomsref.child(roomid)));
// 				// console.log($firebaseObject(roomsref.child(roomid)));	
// 				// filteredrooms.push($firebaseObject(roomsref.child(roomid)));
			
// 	})
	
// 	return filteredrooms;
// 	}
// 	else {
// 		return chatrooms;
// 	}
// })




.controller('chatroomController', function ($scope, $state) {

    // go into a chatroom via roomId    
    $scope.openChatroom = function(roomId) {
        $state.go('tab.chat', {roomId: roomId});
    };

})

// a filter to make sure the correct names display in a chatroom

.filter('removeOwnName', function($rootScope) {
    return function(input) {
        var result = [];
        angular.forEach(input, function(user) {

            if (user.name != $rootScope.displayName) {
                result.push(user);
            }
        }); 

        return result;
}
});


