angular.module('app.services', [])

.factory("Auth", ["$firebaseAuth", "$rootScope",
function ($firebaseAuth) {
    return $firebaseAuth();
}])

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
