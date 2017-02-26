angular.module('app.services', [])

.factory("Auth", ["$firebaseAuth", "$rootScope",
function ($firebaseAuth) {
    return $firebaseAuth();
}])

.service('BlankService', [function(){

}]);
