'use strict';

angular.module('myApp.activity', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/activity', {
            templateUrl: 'activity/activity.html',
            controller: 'ActivityCtrl',
            controllerAs: 'vm'
        });
    }])
    .controller('ActivityCtrl', function($scope, $http, $rootScope, httpRequestService) {
        if(localStorage.getItem('AUTH-TOKEN'))
            $rootScope.login = true;
        httpRequestService.get('/audits/20')
            .success(function(response) {console.log(response)
               $scope.contracts = response;
            })
            .error(function(argument) {
                // body...
            })
    });
