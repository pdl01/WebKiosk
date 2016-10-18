var app = angular.module("kioskApp", ['ngSanitize']);
app.controller("kioskAppCtrl", function ($scope, $interval, $http, $sce, $window, $timeout) {

    $scope.htmlContents = "original";
    $scope.packageMap = {};
    $scope.fileIndex = 0;
    $scope.packagedLoaded = false;
    $scope.slides = [];
    $scope.currentDate = new Date();
    
    $scope.loadPackage = function () {
        $http.get('./javascript/package/package.json').success(function (data) {
            $scope.packageMap = data;
            $scope.packagedLoaded = true;
            var tempFiles = [];
            //process the package files and remove any that don't need to be there
            angular.forEach($scope.packageMap.files,function(item,i){
                var shouldShow = false;
                var hasBeginDate = ('beginDate' in item);
                var hasEndDate = ('endDate' in item);
                if (!hasBeginDate && !hasEndDate) {
                    shouldShow = true;
                } else if (hasBeginDate && hasEndDate) {
                    var beginDate = new Date(item.beginDate);
                    var endDate = new Date(item.endDate);
                    if ($scope.currentDate.getTime() >= beginDate.getTime() && $scope.currentDate.getTime() <= endDate.getTime()) {
                        shouldShow = true;
                    }
                } else if (hasBeginDate) {
                    var beginDate = new Date(item.beginDate);
                    if ($scope.currentDate.getTime() >= beginDate.getTime()) {
                        shouldShow = true;
                    }
                } else if (hasEndDate) {
                    var endDate = new Date(item.endDate);
                    if ($scope.currentDate.getTime() <= endDate.getTime()) {
                        shouldShow = true;
                    }

                }
                if (shouldShow) {
                    tempFiles.push(item);
                }
                
            });
            $scope.packageMap.files = tempFiles;
            console.log("Package metadata loaded");
            $scope.$broadcast("beginSlideShow",{});
        });
    };
    $scope.refreshPage = function () {
        $window.location.reload();
    };
    
    $scope.doNextSlide = function(){
        try {
            console.log("Processing slide:" + $scope.fileIndex + " of " + $scope.packageMap.files.length);
            var fileToLoad = 'javascript/package/' + $scope.packageMap.files[$scope.fileIndex].file;
            console.log(fileToLoad);
            var screenDelay = $scope.packageMap.files[$scope.fileIndex].delay * 1000;
            console.log("Delay will be:"+screenDelay);
            $http.get(fileToLoad).success(function (data) {
                $scope.htmlContents = data;
                $timeout(function () {
                    console.log("delay complete");
                    if ($scope.fileIndex == $scope.packageMap.files.length - 1) {
                        $scope.fileIndex = 0;
                    } else {
                        $scope.fileIndex++;
                    }
                    $scope.$broadcast("nextSlide",{});

                }, screenDelay);
            });
        } catch (e) {
            $timeout(function () {
                console.log("sleeping 2 seconds");
            }, 2000);
            console.log(e);
        }
    }
    
    $scope.$on('nextSlide', function (event, data) {
        $scope.doNextSlide();
    });

    $scope.$on('beginSlideShow', function (event, data) {
        
        $scope.fileIndex = 0;
        $scope.$broadcast("nextSlide",{});
    });


    
    $scope.trustAsHtml = function (string) {
        return $sce.trustAsHtml(string);
    };
    $scope.loadPackage();
    //$scope.updateDiv();
    //$interval( function(){ $scope.updateDiv(); }, 5000,false);
    //$scope.processApp();
    $interval(function () {
        $scope.refreshPage();
    }, 60*60*1000, false);
});