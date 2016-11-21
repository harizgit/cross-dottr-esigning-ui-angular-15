'use strict';

angular.module('myApp.createContract', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/create-contract', {
            templateUrl: 'create-contract/create-contract.html',
            controller: 'CreateContractCtrl',
            controllerAs: 'vm'
        });
    }])
    .controller('CreateContractCtrl', function($scope, $http, $rootScope, $window, httpRequestService, $compile) {
        var vm = this;
        if (localStorage.getItem('AUTH-TOKEN'))
            $rootScope.login = true;
        $scope.documentName = '';
        $scope.fileUpload = function(event) {

            var formData = new FormData();
            formData.append('esigndoc', event[0]);

            $.ajax({
                url: "http://staging-1.crossdottr.com/document", //Server script to process data
                type: 'POST',
                headers: {
                    'X-AUTH-TOKEN': localStorage.getItem('AUTH-TOKEN')
                },
                xhr: function() { // Custom XMLHttpRequest
                    $('#progress-wrp').show()
                    var xhr = $.ajaxSettings.xhr();
                    if (xhr.upload) {
                        xhr.upload.addEventListener('progress', function(event) {
                            var percent = 0;
                            var position = event.loaded || event.position;
                            var total = event.total;
                            if (event.lengthComputable) {
                                percent = Math.ceil(position / total * 100);
                            }
                            //update progressbar
                            $(".progress-bar").css("width", +percent + "%");
                            $(".status").text(percent + "%");
                        }, true);
                    }
                    return xhr;
                },
                //Ajax events
                success: function(response) {

                    $rootScope.documentId = response.id;
                    // $scope.$apply(function () {
                    $scope.documentName = response.fileName;
                    //})
                    angular.element('#docName').html(response.fileName)
                    angular.element('.white').show()
                    console.log($scope.documentName)

                    var user2 = {
                        role: 'SIGNEE',
                        user: {
                            emailAddress: '',
                            fullName: ''
                        }
                    }
                    var userInfo = JSON.parse(localStorage.getItem('user-info'));
                    console.log(userInfo.id)
                        // $rootScope.contractForm.name = $('#doc-name').val();
                    var formData = {

                        name: $('#doc-name').val(),
                        document: { id: response.id },
                        parties: [

                        ],
                        user: {
                            id: userInfo.id
                        },
                        contractFields: [{
                            field: {
                                id: '1'
                            }
                        }],
                        expiryDate: null

                    };
                    // formData.parties.push(user2);
                    $rootScope.contractForm = formData;

                    httpRequestService.post('/contract', formData)
                        .success(function(response) {
                            console.log(1, response);
                            $rootScope.contractId = response;
                            $rootScope.contractForm.id = response;
                            // $window.location.href = '/#!/contract/' + response;

                        })


                },
                error: function() {
                    $window.location.href = '/#!/login';
                },
                //  error: this.errorHandler,
                // Form data
                data: formData,
                //Options to tell jQuery not to process data or worry about content-type.
                cache: false,
                contentType: false,
                processData: false
            });


        }
        $scope.contractName = '';
        $scope.email = '';
        $scope.fullName = '';

        $scope.addPartyFileds = function() {
            var htmlTemplate = '<div class="box-body white mb20 party-field-container">';

            htmlTemplate += '<div class="form-group">';
            htmlTemplate += '<label for="name1">Name & Email</label>';
            htmlTemplate += ' <input type="text" class="form-control firstname" id="name1" value="" placeholder="First name" required="">';
            htmlTemplate += '</div>';
            htmlTemplate += '<div class="form-group"><input type="text" class="form-control lastname" id="name2" value="" placeholder="Last name" required=""></div>'
            htmlTemplate += '<div class="form-group">';
            htmlTemplate += '<input type="email" class="form-control email" id="email1" value="" placeholder="Enter email" required=""></div>';
            htmlTemplate += '<span class="text-sm" class="remove-signee-field"  ng-click="removeSigneeField($event)" style="cursor:pointer;"><i class="fa fa-trash-o"></i> <strong >Remove Signer</strong></span></div>';
            var temp = $compile(htmlTemplate)($scope);
            angular.element('#party-form').append(temp);
        }
        $scope.removeSigneeField = function($event) {
            angular.element($event.target).parents('.box-body').remove();
        }
        $scope.updatePartyFileds = function() {
            console.log(1, $rootScope.contractForm)
            var partyFieldData = [];
            angular.element('.party-field-container').each(function(i, obj) {
                var partyField = {
                    role: 'SIGNEE',
                    user: {
                        emailAddress: $(this).find('.email').val(),
                        firstName: $(this).find('.firstname').val(),
                        lastName: $(this).find('.lastname').val()
                    }
                }
                $rootScope.contractForm.name = $('#doc-name').val();
                $rootScope.contractForm.parties.push(partyField);
            })
            console.log($rootScope.contractForm)
            httpRequestService.put('/contract/' + $rootScope.contractForm.id, $rootScope.contractForm)
                .success(function(response) {
                    console.log(response, $rootScope.contractForm.id);
                    $window.location.href = '/#!/contract/' + $rootScope.contractForm.id;

                })
        }
        $scope.createContract = function() {

            var user2 = {
                role: 'SIGNEE',
                user: {
                    emailAddress: this.email,
                    fullName: this.fullName
                }
            }
            var user = {
                id: 1
            }

            //  var formData = {

            //     // name: this.contractName,
            //      document: { id: $rootScope.documentId },
            //      parties: [

            //      ],
            //      user: {
            //          id: 1
            //      },
            //      contractFields: [{
            //          field: {
            //              id: '1'
            //          }
            //      }],
            //      expiryDate: null

            //  };
            // // formData.parties.push(user2);

            //  httpRequestService.post('/contract', formData)
            //      .success(function(response) {
            //          console.log(response);
            //          $window.location.href = '/#!/contract/' + response;

            //      })
        }
        angular.element(document).ready(function() {
            angular.element('.remove-signee-field').on('click', function() {
                console.log(1)
            })
        });
        $scope.executed = false;                
        setCkEditor();
        function ckEditorInit(name){
            CKEDITOR.replace(name,{
                toolbar :
                    [
                        { name: 'styles', items : [ 'Font','FontSize' ] },
                        { name: 'colors', items: [ 'TextColor' ] },
                        { name: 'basicstyles', items :[ 'Bold','Italic','Underline' ] },
                        { name: 'paragraph', items : [ 'JustifyLeft','JustifyCenter','JustifyRight' ] },
                        { name: 'frt', items:[ 'BulletedList','-' ]}
                    ]
            });
        }
        function setCkEditor(){
            // var key = 'executed';
            var name = 'email-body';
            if(!$scope.executed){
                if(jQuery('#'+name).length==1){
                    //var editor = CKEDITOR.instances[name];
                    //if (editor) { editor.destroy(true); }
                    ckEditorInit(name);
                    $scope.executed  = true;
                    //$window.localStorage.setItem(key,true);
                }else{
                    $timeout(function(){
                        ckEditorInit(name);
                        $scope.executed  = true;
                        //$window.localStorage.setItem(key,true);
                    },1000);
                }
            }
        }

    });

// Text Editor

