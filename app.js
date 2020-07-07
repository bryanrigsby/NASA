//MODULE

var spaceApplication = angular.module('spaceApplication', ['ngRoute']);

//ROUTES
spaceApplication.config(function ($routeProvider, $sceProvider) {

    $sceProvider.enabled(false);

    $routeProvider
        .when('/', {
            templateUrl: 'pages/home.html',
            controller: 'homeController'
        })
        .when('/earthImagery', {
            templateUrl: 'pages/earthImagery.html',
            controller: 'earthImageryController'
        })
        .when('/epic', {
            templateUrl: 'pages/epic.html',
            controller: 'epicController'
        })
        .when('/rover', {
            templateUrl: 'pages/rover.html',
            controller: 'roverController'
        })
});

//COMPONENTS

spaceApplication.component('navigation', {
    template:
        '<a href="#" class="btn btn-info" style="width:100%;">NASA Picture of the Day</a>' +

        '<div class="row pt-1">'+
            '<div class="col-md-12">'+
                '<a href="#!/earthImagery" class="btn btn-info" style="width:100%;">Landsat Satellite Imagery</a>'+
            '</div>'+
        '</div>' +

        '<div class="row pt-1">' +
            '<div class="col-md-12">' +
                '<a href="#!/epic" class="btn btn-info" style="width:100%;">EPIC and Near Earth Object</a>' +
            '</div>' +
        '</div>' +

        '<div class="row pt-1">' +
            '<div class="col-md-12">' +
                '<a href="#!/rover" class="btn btn-info" style="width:100%;">Mars Weather and Rover Photos</a>' +
            '</div>' +
        '</div>'


})


//SERVICES

spaceApplication.service('earthImageryService', function () {
    this.earthImagerySelectedDate = new Date(2019,6,1); // July 6, 2019
    this.earthImageryLongitude = 85.19;
    this.earthImageryLatitude = 27.42;
})

spaceApplication.service('epicService', function () {
    this.epicSelectedDate = new Date();
})

spaceApplication.service('roverService', function () {
    this.roverSelectedDate = new Date(2015,6,3); // July 3, 2015
    this.roverName = "curiosity";
    this.roverCamera = "mast";
})


//CONTROLLERS

spaceApplication.controller('currentDateController', ['$scope', function ($scope) {
    $scope.currentDate = new Date();
}])

spaceApplication.controller('homeController', ['$scope', '$http', function ($scope, $http) {

    $scope.isVideo = false;
    var url;

    $http.get('https://api.nasa.gov/planetary/apod?api_key=IuMRILXnBjsWGRJSzs3SIyxacueiaSuOikgrEMOd').then(function (data) {
        console.log(data.data);
        url = data.data.url;
        $scope.picTitle = data.data.title;

        if (url.search(/youtube/i) > 0 || url.search(/mp4/i) > 0) {
            $scope.isVideo = true;
        }
        $scope.picOfTheDayUrl = url;

    })
}]);


spaceApplication.controller('earthImageryController', ['$scope', '$http', '$filter', 'earthImageryService', function ($scope, $http, $filter, earthImageryService) {

    $scope.errorText = 'No image for that date';
    $scope.error = false;

    $scope.earthImageryLongitude = earthImageryService.earthImageryLongitude;
    $scope.earthImageryLatitude = earthImageryService.earthImageryLatitude;
    $scope.earthImageryUrl = "https://earthengine.googleapis.com/v1alpha/projects/earthengine-legacy/thumbnails/3859ae2970d5fce5f30b2fa400781b30-47107fd94ad2584aa108092877fc9569:getPixels";

    $scope.earthImagerySelectedDate = earthImageryService.earthImagerySelectedDate;

    $scope.$watch('earthImagerySelectedDate', 'earthImageryLongitude', 'earthImageryLatitude', function () {
        earthImageryService.earthImagerySelectedDate = $scope.earthImagerySelectedDate;
        earthImageryService.earthImageryLongitude = $scope.earthImageryLongitude;
        earthImageryService.earthImageryLatitude = $scope.earthImageryLatitude;
    })



    var earthImageryInitialFormattedDate = $filter('date')($scope.earthImagerySelectedDate, 'yyyy-MM-dd');
    $http.get('https://api.nasa.gov/planetary/earth/assets?lon=' + $scope.earthImageryLongitude + '&lat=' + $scope.earthImageryLatitude + '&date=' + earthImageryInitialFormattedDate+'&&dim=0.10&api_key=IuMRILXnBjsWGRJSzs3SIyxacueiaSuOikgrEMOd').then(function (data) {
        $scope.earthImageryUrl = data.data.url;
    }).catch(function (error) {
        $scope.error = true;
        console.log(error);
    })



    $scope.submit = function () {
        var earthImageryFormattedDate = $filter('date')($scope.earthImagerySelectedDate, 'yyyy-MM-dd');
        $http.get('https://api.nasa.gov/planetary/earth/assets?lon=' + $scope.earthImageryLongitude + '&lat=' + $scope.earthImageryLatitude + '&date=' + earthImageryFormattedDate + '&&dim=0.10&api_key=IuMRILXnBjsWGRJSzs3SIyxacueiaSuOikgrEMOd').then(function (data) {
            $scope.earthImageryUrl = data.data.url;
            $scope.error = false;
        }).catch(function (error) {
            $scope.error = true;
            console.log(error);
        })
    }

}]);

spaceApplication.controller('epicController', ['$scope', '$http', '$filter', 'epicService', function ($scope, $http, $filter, epicService) {

    $scope.errorText = 'No image for that date';
    $scope.error = false;

    $scope.epicSelectedDate = epicService.epicSelectedDate;

    $scope.$watch('epicSelectedDate', function () {
        epicService.epicSelectedDate = $scope.epicSelectedDate;
    })

    $scope.epicImageUrl = 'https://epic.gsfc.nasa.gov/archive/natural/2015/10/31/png/epic_1b_20151031074844.png';

    $scope.submit = function () {
        let year = $filter('date')($scope.epicSelectedDate, 'yyyy');
        let month = $filter('date')($scope.epicSelectedDate, 'MM');
        let day = $filter('date')($scope.epicSelectedDate, 'dd');
        var epicFormattedDate = $filter('date')($scope.epicSelectedDate, 'yyyy-MM-dd');
        $http.get('https://api.nasa.gov/EPIC/api/natural/date/' + epicFormattedDate + '?api_key=IuMRILXnBjsWGRJSzs3SIyxacueiaSuOikgrEMOd').then(function (data) {
            console.log(data.data);
            if (data.data < 1) {
                $scope.error = true;
            }
            else {
                console.log(data.data);
                let url = data.data[0].image;
                $scope.epicImageUrl = 'https://epic.gsfc.nasa.gov/archive/natural/' + year + '/' + month + '/' + day + '/png/' + url + '.png';
                $scope.error = false;
            }
            console.log($scope.error);
        })

    }


    $scope.neoDate = new Date();

    var neoFormattedDate = $filter('date')($scope.neoDate, 'yyyy-MM-dd');
    $http.get('https://api.nasa.gov/neo/rest/v1/feed?start_date=' + neoFormattedDate + '&end_date=' + neoFormattedDate + '&api_key=IuMRILXnBjsWGRJSzs3SIyxacueiaSuOikgrEMOd').then(function (data) {
        console.log(data.data);
        $scope.velocity = data.data.near_earth_objects[neoFormattedDate][0].close_approach_data[0].relative_velocity.miles_per_hour; // velocity
        $scope.date = data.data.near_earth_objects[neoFormattedDate][0].close_approach_data[0].close_approach_date_full; // date
        $scope.name = data.data.near_earth_objects[neoFormattedDate][0].name; //name
        $scope.diameter = data.data.near_earth_objects[neoFormattedDate][0].estimated_diameter.feet.estimated_diameter_max; // diameter in feet
        $scope.missDistance = data.data.near_earth_objects[neoFormattedDate][0].close_approach_data[0].miss_distance.miles; //miss distance
        $scope.moreInfoLink = data.data.near_earth_objects[neoFormattedDate][0].nasa_jpl_url; // more info link


        $scope.stringToIntAndTruncate = function (strg) {
            return Math.trunc(parseInt(strg));
        }
    })


}]);

spaceApplication.controller('roverController', ['$scope', '$http', '$filter', 'roverService', function ($scope, $http, $filter, roverService) {

    $scope.errorText = 'Curiosity began transmission on August 6, 2012 and is still active.  Spirit was active from January 4, 2004 to March 22, 2010.  Opportunity was active from January 25, 2004 to June 10, 2018. Not all dates and cameras have photos.';
    $scope.error = false;

    $scope.rovers = [
        { id: '1', name: 'curiosity', displayName: 'Curiosity' },
        { id: '2', name: 'spirit', displayName: 'Spirit' },
        { id: '3', name: 'opportunity', displayName: 'Opportunity' }
    ];


    $scope.curiosityCameras = [
        { name: 'Front Hazard Avoidance', acronym: 'FHAZ' },
        { name: 'Rear Hazard Avoidance', acronym: 'RHAZ' },
        { name: 'Mast', acronym: 'MAST' },
        { name: 'Chemistry', acronym: 'CHEMCAM' },
        { name: 'Mars Hand Lens', acronym: 'MAHLI' },
        { name: 'Mars Descent', acronym: 'MARDI' },
        { name: 'Navigation', acronym: 'NAVCAM' },
    ];

    $scope.spiritAndOpportunityCameras = [
        { name: 'Front Hazard Avoidance', acronym: 'FHAZ' },
        { name: 'Rear Hazard Avoidance', acronym: 'RHAZ' },
        { name: 'Navigation', acronym: 'NAVCAM' },
        { name: 'Panoramic', acronym: 'PANCAM' },
        { name: 'Mini-TES', acronym: 'MINITES' },
    ];

    $scope.roverSelectedDate = roverService.roverSelectedDate;
    $scope.roverName = roverService.roverName;
    $scope.roverCamera = roverService.roverCamera
    $scope.roverUrl = 'http://mars.jpl.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/01033/opgs/edr/fcam/FLB_489193437EDR_F0481600FHAZ00323M_.JPG';

    $scope.$watch('roverSelectedDate', 'roverName', 'roverCamera', function () {
        roverService.roverSelectedDate = $scope.roverSelectedDate;
        roverService.roverName = $scope.roverName;
        roverService.roverCamera = $scope.roverCamera;
    })

    $scope.roverChange = function () {
        $scope.curiosityCameraBool = false;

        if ($scope.roverName == 'curiosity') {
            $scope.curiosityCameraBool = true;
        }
    }

    $http.get('https://api.nasa.gov/insight_weather/?api_key=IuMRILXnBjsWGRJSzs3SIyxacueiaSuOikgrEMOd&feedtype=json&ver=1.0').then(function (data) {
        var JSO = data.data;
        console.log(JSO);

        $scope.avgTemp = JSO[566].AT.av; //avg temp
        $scope.maxTemp = JSO[566].AT.mx; //max temp
        $scope.minTemp = JSO[566].AT.mn; //min temp
        $scope.windSpeed = JSO[566].HWS.av; //wind speed
        $scope.season = JSO[566].Season; //season

        $scope.date = JSO[566].First_UTC; //date

    })

    $scope.truncate = function (strg) {
        return Math.trunc(parseInt(strg));
    }

    $scope.submit = function () {
        console.log($scope.roverName);
        console.log($scope.roverCamera);
        var roverFormattedDate = $filter('date')($scope.roverSelectedDate, 'yyyy-MM-dd');
        $http.get('https://api.nasa.gov/mars-photos/api/v1/rovers/' + $scope.roverName + '/photos?earth_date=' + roverFormattedDate + '&camera=' + $scope.roverCamera + '&api_key=IuMRILXnBjsWGRJSzs3SIyxacueiaSuOikgrEMOd').then(function (data) {
            console.log(data.data.photos);
            if (data.data.photos.length == 0) {
                $scope.error = true;
            } else {
                $scope.roverUrl = data.data.photos[0].img_src;
                console.log(data.data.photos);
                $scope.error = false;
            }

        }).catch(function (error) {
            $scope.error = true;
            console.log(error);
        })
    }

}]);




//end



