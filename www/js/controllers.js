angular.module('app.controllers', [])

.controller('welcomeCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])

.controller('loginCtrl', ['$scope', '$stateParams', 'Auth', '$ionicLoading', "$ionicPopup", "$state",
function ($scope, $stateParams, Auth, $ionicLoading, $ionicPopup, $state) {

  $scope.submit = function(email, password){

    $ionicLoading.show({
      template: 'Logging you in...'
    })

    Auth.$signInWithEmailAndPassword(email, password)
        .then(function (authData) {
        console.log("Logged in as:" + authData.uid);
        $ionicLoading.hide();
        $state.go('pickleJar')
    }).catch(function (error) {
        $ionicPopup.alert({
          title: 'Login Error',
          template: error.message
        })
        $ionicLoading.hide();
    });

  }

}])

.controller('signupCtrl', ['$scope', '$state', 'Auth', '$ionicLoading',
function ($scope, $state, Auth, $ionicLoading) {

  $scope.submit = function(email, password){

    $ionicLoading.show({
      template: 'Signing you up...'
    })

    Auth.$createUserWithEmailAndPassword(email, password)
        .then(function (newUser) {

          $ionicLoading.hide()

          $state.go('chooseOrganization', {
            email: email
          },{
            reload: true
          })
    }).catch(function (error) {
          $ionicLoading.hide()
          alert(error)
    });
  }


}])

.controller('chooseOrganizationCtrl', ['$scope', '$stateParams', "$firebaseArray", "$state",
function ($scope, $stateParams, $firebaseArray, $state) {

  var orgs_ref = firebase.database().ref("Orgs");
  var orgs = $firebaseArray(orgs_ref);
  var selectedOrg;

  $scope.orgs = [];

  orgs.$loaded()
    .then(function(){
        angular.forEach(orgs, function(org) {
            $scope.orgs.push({
              name: org.$id,
              checked: false
            })
        })
    });

  $scope.selectOrg = function(name){
    selectedOrg = name;
    var index = 0;
    angular.forEach($scope.orgs, function(org){
      if(org.name != selectedOrg){
        $scope.orgs[index].checked = false;
      }
      ++index;
    })
  }

  $scope.submitOrg = function(){
    if(selectedOrg){
      var users = $firebaseArray(orgs_ref.child(selectedOrg+"/Users/"));
      users.$add({
        email: $stateParams.email
      }).then(function(){
        $state.go('pickleJar')
      })
    }else{
      console.log("org not selected")
    }
  }

}])

.controller('pickleJarCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])

.controller('aboutCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
