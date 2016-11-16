'use strict';

angular.module('myApp.contractListing', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/contracts', {
            templateUrl: 'contract-listing/contract-listing.html',
            controller: 'ContractListingCtrl',
            controllerAs: 'vm'
        });
    }])
    .controller('ContractListingCtrl', function($scope, $http, $rootScope, httpRequestService) {
        if(localStorage.getItem('AUTH-TOKEN'))
            $rootScope.login = true;
        httpRequestService.get('/contracts')
            .success(function(response) {console.log(response)
                $scope.contracts = response;
            })
            .error(function(argument) {
                // body...
            })
    });
