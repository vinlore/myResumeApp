angular.module('study.controller', ['ionic', 'angular-svg-round-progress', 'yippee.services'])

.controller('studyController', function($state, $rootScope, $ionicPlatform, $scope, $ionicPopup, $cordovaLocalNotification, $cordovaAudioHandler) {

  $scope.muteRinger = function() {};
  $scope.restoreRinger = function() {};
  $scope.breakNotif = function() {};
  $scope.clearNotifs = function() {};
  $scope.breakEndNotif = function() {};
  $scope.studyEndNotif = function() {};

  /*$ionicPlatform.ready(function() {
    $scope.breakNotif = function() {
      $cordovaLocalNotification.schedule({
        id: '1',
        title: "Yippee! - Break Time!",
        text: 'Take a break or continue studying?',
        sound: null,
        ongoing: false,
        led: null
      }).then(function() {
        console.log('notification fired');
      });
    };

    $scope.clearNotifs = function() {
      $cordovaLocalNotification.cancelAll();
    };

    $scope.breakEndNotif = function() {
      $cordovaLocalNotification.schedule({
        id: '1',
        title: "Yippee! - Break Over!",
        text: 'Go back to studying!',
        sound: null,
        ongoing: false,
        led: null
      })
    };

    $scope.studyEndNotif = function() {
      $cordovaLocalNotification.schedule({
        id: '1',
        title: "Yippee! - Study Session Complete!",
        sound: null,
        ongoing: false,
        led: null
      })
    };

    $scope.muteRinger = function() {
      $cordovaAudioHandler.muteRinger();
    };

    $scope.restoreRinger = function() {
      $cordovaAudioHandler.restoreRinger();
    };
  });*/

  $scope.error = false; // whether to show time inputs error message 
  $rootScope.studyMode = false;
  $rootScope.breakMode = false;
  $scope.studyTime;

  // study time inputs
  $scope.study = {
    mins: 0,
    hours: 0
  };
  $scope.timeLeft; // total study time left

  // break time inputs
  $scope.break = {
    breakEvery: 10,
    breakLength: 60
  };
  $scope.breakLeft; // break time left

  $scope.spause = false; // pauses study timer if true
  $scope.bpause = true; // pauses break timer if true
  $scope.breakTrack = 0; // tracks time until next break
  $scope.untilBreak = 0; // time until next break;
  $scope.showStudy = true;

  $scope.showStudyToggle = function() {
    ($scope.showStudy) ? $scope.showStudy = false : $scope.showStudy = true;
  }

  // time input popup
  $scope.timePopup = function() {
    var timePopup = $ionicPopup.show({
      title: 'Set Study Schedule',
      templateUrl: 'templates/timeInput.html',
      scope: $scope,
      buttons: [{
        text: 'Cancel',
        type: 'button-assertive',
        onTap: function(e) {
          //resetInputs();
          $scope.error = false;
        }
      }, {
        // start studying button, displays error if mins and hours not both 0 or break length is set but break every interval is not > 0 
        text: 'Start',
        type: 'button-balanced',
        onTap: function(e) {
          if (($scope.study.mins <= 0 && $scope.study.hours <= 0) || ($scope.break.breakEvery <= 0 && $scope.breakLength > 0)) {
            // prevents popup from closing
            e.preventDefault();
            $scope.error = true;
          } else {
            $scope.error = false;
            $scope.startStudy();
          }
        }
      }]
    })
  };

  // starts study timer if mins or hours > 0
  $scope.startStudy = function() {
    if ($scope.study.mins > 0 || $scope.study.hours > 0) {
      $rootScope.studyMode = true;
      $scope.muteRinger();
      $scope.spause = false;
      $scope.untilBreak = $scope.break.breakEvery;
      var minutes = ($scope.study.mins > 0) ? parseInt($scope.study.mins) : 0;
      var hours = ($scope.study.hours > 0) ? parseInt($scope.study.hours) : 0;
      var total = minutes + (hours * 60);
      $scope.studyTime = total;
      $scope.timeLeft = $scope.studyTime;

      studyTimer = setInterval(function() {
        if (!$scope.spause) {
          // At 0 minutes decrement hour and set minutes to 59, otherwise decrement minutes
          // increments break timer
          if (minutes == 0) {
            minutes = 59;
            $scope.breakTrack++;
            if (hours > 0) hours--
          } else {
            minutes--;
            $scope.breakTrack++;
          }

          $scope.$apply(function() {
            $scope.study.mins = minutes;
            $scope.study.hours = hours;
            $scope.timeLeft--;
            $scope.untilBreak--;
          });

          // study time is over. restore ringer, schedules notification
          if ($scope.timeLeft == 0) {
            clearInterval(studyTimer);
            finishAlert();
            $scope.restoreRinger();
            $scope.studyEndNotif();
          }

          // break time. pauses study timer. restores ringer, schedules notification
          if ($scope.breakTrack == $scope.break.breakEvery && $scope.timeLeft != 0) {
            $scope.breakTrack = 0;
            $scope.untilBreak = $scope.break.breakEvery;
            $scope.spause = true;
            $scope.restoreRinger();
            $scope.breakNotif();
            breakPopup();
          }
        }
      }, 1000);
    }
  };

  var resetInputs = function() {
    $scope.study.hours = 0;
    $scope.study.mins = 0;
    $scope.break.breakLength = 0;
    $scope.break.breakEvery = 0;
  };

  // starts break timer if break length and break every is set > 0
  $scope.startBreak = function() {
    if ($scope.break.breakLength > 0 && $scope.break.breakEvery > 0) {
      $rootScope.breakMode = true;
      var breakTime = ($scope.break.breakLength > 0) ? parseInt($scope.break.breakLength) : 0;
      $scope.break.breakLength = breakTime;
      $scope.breakLeft = breakTime;
      $scope.bpause = false;

      breakTimer = setInterval(function() {
        if (!$scope.bpause) {
          // Stop break when breakTime = 0. Launches alert to continue studying. Schedule notification.
          if ($scope.breakLeft == 0) {
            clearInterval(breakTimer);
            $rootScope.breakMode = false;
            breakAlert(); // mutes ringer when user clicks okay in alert
            $scope.breakEndNotif();
          } else breakTime--;

          $scope.$apply(function() {
            $scope.breakLeft = breakTime;
          });
        }
      }, 1000);
    }
  };

  // popup prompt when it's break time
  var breakPopup = function() {
    var breakPopup = $ionicPopup.show({
      title: 'Yippee!',
      subTitle: 'Time to take a break',
      scope: $scope,
      buttons: [{
        // choose to study, re-mutes ringer and unpauses study timer
        text: 'Study',
        type: 'button-energized',
        onTap: function(e) {
          $scope.spause = false;
          $scope.muteRinger();
          $scope.clearNotifs();
        }
      }, {
        // choose to break, starts break timer, sets studyMode to false
        text: 'Break',
        type: 'button-assertive',
        onTap: function(e) {
          $rootScope.studyMode = false;
          $scope.startBreak();
          $scope.clearNotifs();
        }
      }]
    });
  };

  // alert to show when study session is completely over
  var finishAlert = function() {
    var finishPopup = $ionicPopup.show({
      title: 'Study session finished!',
      scope: $scope,
      buttons: [{
        text: 'OK',
        type: 'button-calm',
        // resets study time inputs
        onTap: function(e) {
          $rootScope.studyMode = false;
          $scope.study.mins = 0;
          $scope.study.hours = 0;
          $scope.clearNotifs();
        }
      }]
    });
  };

  // alert to show when break to over
  var breakAlert = function() {
    var finishPopup = $ionicPopup.show({
      title: 'Break finished!',
      scope: $scope,
      buttons: [{
        text: 'Back to Studying',
        type: 'button-calm',
        // sets studyMode to true, mutes the ringer, go back to study time
        onTap: function(e) {
          $rootScope.studyMode = true;
          $scope.spause = false;
          $scope.muteRinger();
          $state.go('tab.study');
          $scope.clearNotifs();
        }
      }]
    });
  };

  // increment by 1 for buttons in time input
  $scope.inc = function(type) {
    $scope.study.hours = parseInt($scope.study.hours);
    $scope.study.mins = parseInt($scope.study.mins);
    $scope.break.breakEvery = parseInt($scope.break.breakEvery);
    $scope.break.breakLength = parseInt($scope.break.breakLength);
    if (!$scope.study.hours) $scope.study.hours = 0;
    if (!$scope.study.mins) $scope.study.mins = 0;
    if (!$scope.break.breakEvery) $scope.break.breakEvery = 0;
    if (!$scope.break.breakLength) $scope.break.breakLength = 0;
    switch (type) {
      case 'h':
        $scope.study.hours = $scope.study.hours + 1;
        break;
      case 'm':
        if ($scope.study.mins >= 59) {
          var extra = ($scope.study.mins + 1) % 60;
          var carry = Math.floor(($scope.study.mins + 1) / 60);
          $scope.study.mins = extra;
          $scope.study.hours = $scope.study.hours + carry;
        } else $scope.study.mins = $scope.study.mins + 1;
        break;
      case 'b':
        $scope.break.breakLength = $scope.break.breakLength + 1;
        break;
      case 'e':
        $scope.break.breakEvery = $scope.break.breakEvery + 1;
        break;
    };
  };

  // decrement by 1 for buttons in time input
  $scope.dec = function(type) {
    switch (type) {
      case 'h':
        if ($scope.study.hours > 0) $scope.study.hours = $scope.study.hours - 1;
        break;
      case 'm':
        if ($scope.study.mins > 0)
          $scope.study.mins = $scope.study.mins - 1;
        else if ($scope.study.mins == 0 && $scope.study.hours > 0) {
          $scope.study.mins = 59;
          $scope.study.hours = $scope.study.hours - 1;
        }
        break;
      case 'b':
        if ($scope.break.breakLength > 0) $scope.break.breakLength = $scope.break.breakLength - 1;
        break;
      case 'e':
        if ($scope.break.breakEvery > 0) $scope.break.breakEvery = $scope.break.breakEvery - 1;
        break;
    };
  };

  $scope.wasBreak;
  // stop session button function
  $scope.stopStudy = function() {
    // checks when end session was pressed to pause study or break timer to give user time to confirm
    if ($scope.spause) { $scope.wasBreak=true; $scope.bpause=true; }
    else { $scope.wasBreak=false; $scope.spause=true; }
    var confirmPopup = $ionicPopup.confirm({
      title: 'Stop Session',
      subTitle: 'Are you sure?',
      cancelText: 'No',
      okText: 'Yes'
    });
    confirmPopup.then(function(res) {
      if (res) {
        clearInterval(studyTimer);
        if ($rootScope.breakMode) clearInterval(breakTimer);
        $rootScope.breakMode = false;
        $scope.studyTime = 0;
        $scope.timeLeft = 0;
        $scope.study.mins = 0;
        $scope.study.hours = 0;
        $rootScope.studyMode = false;
        $scope.restoreRinger();
        $scope.clearNotifs()
        $scope.untilBreak = 0;;
      } else {
        // resumes study or break timer if user wants to continue 
        ($scope.wasBreak) ? $scope.bpause=false : $scope.spause = false;
      };
    });
  };
})
