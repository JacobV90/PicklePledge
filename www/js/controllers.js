angular.module('app.controllers', [])

.controller('welcomeCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])

.controller('loginCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])

.controller('signupCtrl', ['$scope', '$state', 'Auth', '$ionicLoading',
function ($scope, $state, Auth, $ionicLoading) {

  $scope.user = {};
  $scope.pw1;
  $scope.pw2;

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

.controller('chooseOrganizationCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {

  console.log($stateParams.email);

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
