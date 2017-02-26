angular.module('app.services', [])

.factory("Auth", ["$firebaseAuth", "$rootScope",
function ($firebaseAuth) {
    return $firebaseAuth();
}])

.factory('BlankFactory', [function(){

}])

.service('BlankService', [function(){

}]);
