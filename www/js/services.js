angular.module('app.services', [])

.factory("Auth", ["$firebaseAuth", "$rootScope",
function ($firebaseAuth) {
    return $firebaseAuth();
}])

.factory("Storage", function($window, $rootScope) {
    angular.element($window).on('storage', function(event) {
        if (event.key === 'user') {
            $rootScope.$apply();
        }
    });
    return {
        setData: function(entry, val) {
            $window.localStorage.setItem(entry, JSON.stringify(val));
            return this;
        },
        getData: function(entry) {
            return JSON.parse($window.localStorage.getItem(entry));
        },
        clearData: function(entry){
            console.log($window.localStorage.getItem(entry))
            $window.localStorage.removeItem(entry);
            console.log($window.localStorage.getItem(entry));
            return this
        }
    };
})

.factory("User", function (email, id) {
    var user_auth = Auth.$getAuth();
    var users_ref = firebase.database().ref("Users/");
    var users = $firebaseArray(users_ref);
    $scope.date = new Date().toDateString();
    var current_log = null;

})

.factory("SearchFilter", ["$firebaseArray",
function ($firebaseArray) {
  var compare = function(entry, search){
    var regex = new RegExp(search, 'gi');
    var res = entry.match(regex);
    if(res != null){
      return true;
    }else{
      return false;
    }
  }
  var ListWithFilter = $firebaseArray.$extend({
    getSearchResults: function(search) {
      var orgList = [];

      this.$list.$loaded()
        .then(function(list){
          angular.forEach(list, function(rec) {
            if(compare(rec.name, search)){
              orgList.push({
                name: rec.name,
                checked: false,
              })
            }
          })
        });
      return orgList;
    }
  });

  return function(listRef) {
    // create an instance of ListWithTotal (the new operator is required)
    return new ListWithFilter(listRef);
  }
}])
