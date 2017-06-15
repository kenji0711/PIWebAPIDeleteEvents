angular.module('myApp', [])
.controller('MyCtrl', ['$scope','$http', function($scope,$http) {
    //Set PIWebAPI Server Name
    var servername ="localhost";
    //Basic Authentication
    //put the 64bit encoded (username:password) to the XXXXXXXXXXXXXXXXXXXXXXXXXXXXX for using Basic Authentication.
    $http.defaults.headers.common['Authorization'] = "Basic " + "XXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
    $http.defaults.headers.common['Content-Type'] = 'application/json';
    // Default values
    $scope.tagmask = "sin*";
    $scope.starttime = "*-8h";
    $scope.endtime = "*";
    $scope.maxdelevnum = "50000";
    $scope.TagSearchResult = false;
    $scope.DelResult = false;
    
    //"Search Tags" Button
    $scope.searchtags= function(){
        var batch_searchtags = {  
            "searchTags": {  
                "Method": "GET",  
                "Resource": "https://" + servername + "/piwebapi/search/query?q=name:"+$scope.tagmask +"&fields=Name"
            }
        }
        $http.post("https://" + servername + "/piwebapi/batch", batch_searchtags, {}).success(function(response) {
            $scope.search_items = response.searchTags.Content.Items;
        });
        //display the results
        $scope.TagSearchResult = true;
    };

    //"Delete Events Button
    $scope.delete= function(){
        var batch_data = {
            "searchTags": {  
                "Method": "GET",  
                "Resource": "https://" + servername + "/piwebapi/search/query?q=name:" + $scope.tagmask + "&fields=Name;Links"
            },  
            "getTagInfo": {  
                "Method": "GET",  
                "RequestTemplate" : {"Resource": "{0}?selectedfields=Name;Links.RecordedData"},
                "ParentIds": ["searchTags"],  
                "Parameters": ["$.searchTags.Content.Items[*].Links.Self"]  
            },
            "getData":{
                "Method" : "GET",
                "RequestTemplate" : {
                    "Resource": "{0}?maxCount=" + $scope.maxdelevnum + "&selectedfields=Items.Timestamp;Items.Value&StartTime="
                     + $scope.starttime + "&EndTime=" + $scope.endtime 
                },
                "ParentIds": ["getTagInfo"],
                "Parameters" : ["$.getTagInfo.Content.Items[*].Content.Links.RecordedData"]
            }
        }
        $http.post("https://" + servername + "/piwebapi/batch", batch_data, {}).success(function(response) {
            $scope.del_items = response.getTagInfo.Content.Items;
            //Tags loop
            var del_data_body="";
            for (var i = 0; i < response.getTagInfo.Content.Items.length; i++) {
                $scope.del_items[i].Content.Count = response.getData.Content.Items[i].Content.Items.length;
                del_data_body= response.getData.Content.Items[i].Content.Items;
                var tagaddress = response.getTagInfo.Content.Items[i].Content.Links.RecordedData + "?updateOption=remove";
                $http.post(tagaddress, del_data_body, {}).success(function(response) {
                    //alert("success to delete");
                })
            }
        });
        //display the results
        $scope.DelResult = true;
    }
}]);