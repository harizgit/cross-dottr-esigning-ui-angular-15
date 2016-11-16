'use strict';

angular.module('myApp.contractDetails', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/contract/:ID', {
            templateUrl: 'contract-details/contract-details.html',
            controller: 'ContractDetailCtrl',
            controllerAs: 'vm'
        });
    }])
    .controller('ContractDetailCtrl', function($scope, $http, $rootScope, $routeParams, httpRequestService) {
        var vm = this;
        if (localStorage.getItem('AUTH-TOKEN'))
            $rootScope.login = true;
        $scope.contractDetails = '';
        angular.element(document).ready(function() {
            var signeeOptions = [];
            $scope.contractDetailsObj = $scope.contractDetails;







            // angular.element('.button_li button').on('click', function() {
            //     angular.element('.popup_style').hide();
            // })

        })
$scope.selectedDroppables = '';
 httpRequestService.get('/fields')
            .success(function(response) { console.log(response)})

        httpRequestService.get('/contract/' + $routeParams.ID)
            .success(function(response) {
                console.log(response)
                $scope.contract = response;
                $scope.contractDetails = response;

                var contractData = new Array();
                httpRequestService.get('/thumbnails/' + response.document.id)
                    .success(function(response) {
                        console.log(response)
                        $scope.thumbnails = response;

                        setTimeout(function() {

                            var pos = null;
                            var parent = null;
                            var current = null;

                            angular.element(".draggable").draggable({
                                helper: 'clone',
                                cursor: 'move',
                                snap: '.droppable',
                                revert: "invalid"

                            });
                            var obj = $scope.contractDetails;
                            angular.element(".droppable").droppable({
                                drop: function(e, ui) {
                                    if (angular.element(ui.draggable)[0].id != "") {

                                        this.x = ui.helper.clone().addClass('droppables');
                                        ui.helper.remove();
                                        console.log(this.x.find('.ui-resizable-handle'))
                                           //  angular.element('.ui-resizable-handle').remove();
                                        this.x.resizable();
                                        this.x.appendTo(angular.element(this));

                                        this.x.draggable({
                                            helper: 'ui-resizable-helper',
                                            containment: angular.element(this),
                                            tolerance: 'fit',
                                            stop: function(event, ui) {
                                                console.log(event.target.parentElement.id)
                                                var finalOffset = $(this).offset();
                                                var finalxPos = finalOffset.left;
                                                var finalyPos = finalOffset.top;
                                                console.log($(this).css('left'), $(this).css('top'))

                                                //  $('#finalX').text('Final X: ' + finalxPos);
                                                // $('#finalY').text('Final X: ' + finalyPos);
                                            }
                                        });
                                       // this.x.resizable();
                                        var dropItemPos = angular.element(this).offset(),
                                            dragItemPos = this.x.offset(),
                                            originalY = dragItemPos.top - dropItemPos.top,
                                            originalX = dragItemPos.left - dropItemPos.left,
                                            thisId = angular.element(this).attr('id');
                                        var contractDataItem = {
                                            fieldType: angular.element(ui.draggable)[0].id,
                                            id: 1,
                                            minHeight: 10,
                                            minWidth: 50,
                                            page: { id: thisId, document: { id: $scope.contractDetails.document.id } },
                                            text: "",
                                            xOrigin: originalX,
                                            xorigin: originalX,
                                            yOrigin: originalY,
                                            yorigin: originalY,
                                            isEnable: 0

                                        };
                                        this.x.attr('position', originalX + '-' + originalY + '-' + angular.element(ui.draggable)[0].id + '-' + thisId + '-' + $scope.contractDetails.document.id)

                                        /* remove elememt */
                                        this.x.attr('id',generateRandomString(10).trim());
                                        jQuery('body').on('click',this.x,function(event){
                                        $scope.selectedDroppables = jQuery(event.target).parents('.droppables').attr('id');
                                        console.log('$scope.selectedDroppables',$scope.selectedDroppables,event);
                                        });
                                        /* remove elememt  finish*/                 
                                        var dragItem = this.x,
                                            contextItem = angular.element(dragItem).find('.nav_con_det_menu'),
                                            popupId = contextItem.attr('modal');
                                        contextItem.contextMenu('#' + popupId, {});
                                       // angular.element('.ui-resizable-handle').remove();
                                    }

                                }

                            });
                        })

                    })
            })
            .error(function(argument) {
                // body...
            })



        $scope.hideElement = function(event) { 
            angular.element('.popup_style').hide();
        }
        
        $scope.removeElement = function() {
            angular.element("#"+$scope.selectedDroppables).remove();
            angular.element('.popup_style').hide();
        };

        $scope.updateContract = function() {

            angular.element('.droppables').each(function() {
                if (angular.element(this).attr('position')) {

                    var field = angular.element(this)
                        .find('.nav_con_det_menu').html(),
                        modal = angular.element(this).find('.nav_con_det_menu').attr('modal'),
                        selectedParty = angular.element('#' + modal).find('select').val(),
                        positionElem = angular.element(this).attr('position').split('-');

                    //positionElem = angular.element(this).attr('position').split('-');
                    console.log($scope.contractDetails)
                    for (var i = 0; i < $scope.contractDetails.parties.length; i++) {
                        if (selectedParty == $scope.contractDetails.parties[i].user.id) {

                            if ($scope.contractDetails.parties[i].contractFields.length > 0) {
                                for (var j = 0; j < $scope.contractDetails.parties[i].contractFields.length; j++) {
                                    if ($scope.contractDetails.parties[i].contractFields[j].length > 0 && $scope.contractDetails.parties[i].contractFields[j].fieldType == positionElem[2] && $scope.contractDetails.parties[i].contractFields[j].page.id == positionElem[3]) {

                                        console.log($scope.contractDetails.parties[i].contractFields[j])
                                        delete $scope.contractDetails.parties[i].contractFields[j];
                                    }
                                }
                            }
                            var contractDataItem = {
                                fieldType: positionElem[2],

                                minHeight: parseInt(angular.element(this).css('height')),
                                minWidth: parseInt(angular.element(this).css('width')),
                                page: { id: positionElem[3], document: { id: positionElem[4] } },
                                text: "",
                                xOrigin: parseInt($(this).css('left')),
                                xorigin: parseInt($(this).css('left')),
                                yOrigin: parseInt($(this).css('top')),
                                yorigin: parseInt($(this).css('top'))

                            };
                            $scope.contractDetails.parties[i].contractFields.push(contractDataItem)
                        }
                    }
                }

            })
            httpRequestService.put('/contract/' + $scope.contractDetails.id, $scope.contractDetails)
                .success(function(response) {
                    console.log(response);
                    angular.element('#send-signee').show();
                    angular.element('#contract-details').remove();

                })
            console.log($scope.contractDetails)
        }

        $scope.sendForSign = function() {
            httpRequestService.post('/send/contract/' + $scope.contractDetails.id)
                .success(function(response) {
                    console.log(response);
                    //  angular.element('#send-signee').show();
                    // angular.element('#contract-details').remove();

                })
        }

        $('.popup_style').appendTo('.droppable');

        function generateRandomString(length){
        var text = " ";
        var charset = "abcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < length; i++ )
    {    text += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return text;
        }

    });