'use strict';

angular.module('myApp.signContract', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/sign-contract/:token', {
            templateUrl: 'sign-contract/sign-contract.html',
            controller: 'signContractCtrl',
            controllerAs: 'vm'
        });

    }])
    .controller('signContractCtrl', function($scope, $http, $rootScope, $routeParams, httpRequestService) {
        if (localStorage.getItem('AUTH-TOKEN'))
            $rootScope.login = true;

        var wrapper = document.getElementById("signature-pad"),
            clearButton = wrapper.querySelector("[data-action=clear]"),
            saveButton = wrapper.querySelector("[data-action=save]"),
            closeButton = wrapper.querySelector("[data-action=close]"),
            canvas = wrapper.querySelector("canvas"),
            signaturePad;

        // Adjust canvas coordinate space taking into account pixel ratio,
        // to make it look crisp on mobile devices.
        // This also causes canvas to be cleared.
        function resizeCanvas() {
            // When zoomed out to less than 100%, for some very strange reason,
            // some browsers report devicePixelRatio as less than 1
            // and only part of the canvas is cleared then.
            var ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext("2d").scale(ratio, ratio);
        }

        window.onresize = resizeCanvas;
        resizeCanvas();

        signaturePad = new SignaturePad(canvas);

        clearButton.addEventListener("click", function(event) {
            signaturePad.clear();
        });

        closeButton.addEventListener("click", function(event) {
            angular.element('#signature-container').css('visibility', 'hidden').css('height', '0')
        });

        saveButton.addEventListener("click", function(event) {
            if (signaturePad.isEmpty()) {
                alert("Please provide signature first.");
            } else {
                //   alert("canvas Signature upload Successfully.");
                // angular.element('.item-color').css('color','red')
                //  window.open(signaturePad.toDataURL());
                var dataUrl = signaturePad.toDataURL();
                $('#img-tag').attr('src', dataUrl)
                    // dataUrl = dataUrl.replace('data:image/png;base64,', '');



                // var dataUrl = signaturePad.toDataURL("image/jpeg");



                // var blob = dataURItoBlob(dataUrl);
                console.log(dataUrl)
                var formData = {

                    data: dataUrl

                };
                console.log($('.SIGNATURE').attr('id'))
                var id = $('.SIGNATURE').attr('id');
                httpRequestService.post('/party/token/' + $routeParams.token + '/field/' + id + '/json/object', formData)
                    .success(function(response) {
                        console.log(1, response);
                        // $rootScope.contractId = response;
                        //  $rootScope.contractForm.id = response;
                        // $window.location.href = '/#!/contract/' + response;

                    })

            }
        });
        $scope.shoSignaturePad = function() {
            angular.element('#signature-container').css('visibility', 'visible').css('height', '200px');
            angular.element('.popup_style').hide();
        }
        $scope.saveText = function(id) {
            var formData = {
                data: $('#' + id).val()
            };


            httpRequestService.post('/party/token/' + $routeParams.token + '/field/' + id + '/json/text', formData)
                .success(function(response) {
                    console.log(1, response);

                })

        }
        $scope.signContract = function() {
            console.log(1)
            httpRequestService.post('/sign/contract/' + $routeParams.token)
                .success(function(response) {
                    $('.mb20').remove();
                    $('#success').show()

                })
        }
        $scope.saveFile = function(event) {
            var formData = new FormData();
            formData.append('data', event[0]);
 var id = angular.element('.upload-file').attr('id');
console.log(formData)


 httpRequestService.post("party/token/" + $routeParams.token + "/field/" + id+ "/json/object", formData)
                    .success(function(response) {
                        console.log(1, response);
                        // $rootScope.contractId = response;
                        //  $rootScope.contractForm.id = response;
                        // $window.location.href = '/#!/contract/' + response;

                    })


            // $.ajax({
            //     url: "party/token/" + $routeParams.token + "/field/" + id+ "/object", //Server script to process data
            //     type: 'POST',
            //     headers: {
            //         'X-AUTH-TOKEN': localStorage.getItem('AUTH-TOKEN')
            //     },
            //     xhr: function() { // Custom XMLHttpRequest
            //         var myXhr = $.ajaxSettings.xhr();
            //         return myXhr;
            //     },
            //     //Ajax events
            //     success: function(response) {

            //        console.log(response)


            //     },
            //     error: function(response) { console.log(response)
            //         //$window.location.href = '/#!/login';
            //     },
            //     //  error: this.errorHandler,
            //     // Form data
            //     data: formData,
            //     //Options to tell jQuery not to process data or worry about content-type.
            //     cache: false,
            //     contentType: false,
            //     processData: false
            // });

        }
        httpRequestService.get('/view/contract/thumbnails/' + $routeParams.token)
            .success(function(response) {
                $scope.thumbnails = response;
                console.log(response);
                //  /party/:token/fields
                httpRequestService.get('/party/' + $routeParams.token + '/fields')
                    .success(function(response) {
                        $scope.fileds = response;
                        console.log(response)
                        for (var i = 0; i < response.length; i++) {
                            if (response[i].fieldType == 'SIGNATURE' && response[i].objectId != '') {
                                // /party/token/55eda84d-d629-4ff2-a24d-6525e57379d4/field/9/object
                                //    party/token/1fcdc50a-8253-4230-ba28-c50de8faf33c/field/9/object?format=datauri
                                httpRequestService.get('/party/token/' + $routeParams.token + '/field/' + response[i].id + '/object?format=datauri')
                                    .success(function(responseUrl) {
                                        // var responseUrl1 = 
                                        // console.log(1, responseUrl);
                                        // var b64Response = btoa(unescape(encodeURIComponent(responseUrl)));

                                        // // create an image
                                        // //var outputImg = document.createElement('img');
                                        // var outputImg = 'data:image/png;base64,' + b64Response;
                                        $scope.utl = responseUrl;
                                        console.log(responseUrl)
                                    })
                            }
                        }
                        var date = new Date();
                        //  $scope.date = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
                        $scope.filedVal = {
                            //  'NAME': response.text,
                            // 'FREE_TEXT': response.text,
                            'DATE': date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)
                        }
                    })

            })
    })
