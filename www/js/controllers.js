

angular.module('coach.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $firebaseArray, auth) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  $scope.userId = 'test1234';
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    auth.$authWithOAuthRedirect("facebook");
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('TeamsCtrl', function($scope, $ionicModal, $firebaseArray) {
  var teamsRef = new Firebase("https//coach-app-b366a.firebaseio.com/teams/" + $scope.userId);
  $scope.newTeamData = {};
  $scope.teamData = $firebaseArray(teamsRef);

  $scope.teamData.$loaded().then(function(teamData) {
    var teamLength = teamData.length
    console.log(teamLength);

    for(var i = 0;i<teamData.length;i++) {
      teamData[i].teamId = i;
      console.log("in");
    }
  });

  console.dir($scope.teamData);

  $ionicModal.fromTemplateUrl('templates/makeTeam.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.addTeamModal = modal;
  });

  $scope.closeTeam = function() {
    $scope.addTeamModal.hide();
  };

  $scope.addTeam = function() {
    $scope.addTeamModal.show();
  };

  $scope.makeTeam = function() {
    $scope.teamData.$add({
      "name": $scope.newTeamData.teamName,
      "sport": $scope.newTeamData.sport
    });
    $timeout(function() {
      $scope.closeTeam();
    }, 1000);
  };

  $scope.setTeam = function(teamId) {
    $scope.subTeamPage = true;
    $scope.subTeamId = teamId;
  };
})

.controller('TeamCtrl', function($scope, $firebaseArray) {
  var teamsRef = new Firebase("https//coach-app-b366a.firebaseio.com/teams/" + $scope.userId);
  $scope.teamData = $firebaseArray(teamsRef);
  $scope.teamData.$loaded().then(function(teamData) {
    console.dir(teamData);
    console.dir($scope.subTeamId);
    $scope.selectedTeam = teamData.subTeamId;
    console.log("in here");
  });
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});
