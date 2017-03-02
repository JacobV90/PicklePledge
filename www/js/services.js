angular.module('app.services', [])

.factory("Auth", ["$firebaseAuth", "$rootScope",
function ($firebaseAuth) {
    return $firebaseAuth();
}])

.factory("SearchFilter", ["$firebaseArray",
function ($firebaseArray) {
  var compare = function(entry, search){
    for( var i = 0; i < search.length; i++){
      if(entry.charAt(i) == search.charAt(i)){
        console.log(true)
        return true;
      }
      else{
        console.log(false)
        return false;
      }
    }
  }
  var ListWithFilter = $firebaseArray.$extend({
    getSearchResults: function(search) {
      var orgList = [];

      this.$list.$loaded()
        .then(function(list){
          console.log("loaded")
          angular.forEach(list, function(rec) {
            if(compare(rec.$id, search)){
              orgList.push({
                name: rec.$id,
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
