var users =  ["freecodecamp","MedryBW", "storbeck", "terakilobyte", "habathcx","RobotCaleb","thomasballinger","noobs2ninjas","beohoff","comster404","brunofin"];

var TwitchUsers = {};

var twitchapp = angular.module("twitchApp", []);

twitchapp.service('streamService',function($http, $q){
  var twitchStreamsAPI = "https://api.twitch.tv/kraken/streams/";
  //  https://api.twitch.tv/kraken/streams/freecodecamp

    return {
      getUsersData: function(users) {
        // get stream data, on each user result
        //console.log("igot",users);
        var deferred2 = $q.defer();
        var streamURL=[];
        angular.forEach(users, function(user){
          streamURL.push($http.jsonp(twitchStreamsAPI + user.data.name + "?callback=JSON_CALLBACK"));
        });
        $q.all(streamURL).then(
          function(results){
            //console.log(results.length, users.length);
            //console.log("ermm", results[0], users[0]);
            // merge both results
            angular.forEach(users, function(u, index){
              u.data["stream"]=results[index].data;
              //console.log("i",index);
            });
            //deferred2.resolve(results);
            // return the modified users array
            deferred2.resolve(users);
          }, 
          function(errors){deferred2.reject(errors);},
          function(updates){deferred2.update(updates);});
        
        return deferred2.promise;
      }// end getUsersData
    } // end return
}); //end streamService

twitchapp.service('usersService', function($http, $q) {
  var twitchUsersAPI = "https://api.twitch.tv/kraken/users/";
  //  https://api.twitch.tv/kraken/users/freecodecamp
  
  return {
    getUsersData: function(users) {
      var deferred = $q.defer();
      var urlCalls = [];
      angular.forEach(users, function(user) {
        // array of jsonp requests
        urlCalls.push($http.jsonp(twitchUsersAPI + user + "?callback=JSON_CALLBACK"));
      });
      // they may, in fact, all be done, but this
      // executes the callbacks in then, once they are
      // completely finished.
      $q.all(urlCalls)
        .then(
        function(results) {
          //console.log("res",results);

          deferred.resolve(results);
        },
        function(errors) {
          deferred.reject(errors);
        },
        function(updates) {
          deferred.update(updates);
        });
      return deferred.promise;
    } // end getUsersData
  }; // end return
}); //end service


twitchapp.controller("userCtrler", function($scope, usersService, streamService){
  $scope.usersData=[];
  var allUsers=[];
  $scope.getAllData = function(){
    // get online data
    var usersData = usersService.getUsersData( users)
      .then(streamService.getUsersData)
      .then(function(data){
        console.log("streamservice",data);
        allUsers = data;
        $scope.usersData=allUsers;
    });
  };
  
  $scope.online = function(){
    $scope.usersData=allUsers.filter(function(u){
      return u.data.stream.stream!==null && u.data.stream.status!==422;
    });
  };
  
  $scope.offline = function(){
    $scope.usersData=allUsers.filter(function(u){
      return u.data.stream.stream===null ||  u.data.stream.status==422;
    });
  };
  
  
  // first time // initialize // load data
  $scope.getAllData();
}); // end userCtrler

