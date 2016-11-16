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
                var dataURL = signaturePad.toDataURL();



                var dataUrl = signaturePad.toDataURL("image/jpeg");


                var byteString = atob(dataUrl.split(',')[1]);

                var mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0]

                var ab = new ArrayBuffer(byteString.length);
                var ia = new Uint8Array(ab);
                for (var i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }

                var blob = new Blob([ab], { "type": mimeString });

                // var blob = dataURItoBlob(dataUrl);

                var formData = new FormData();
                formData.append("esigndoc", blob);
                $.ajax({
                    url: 'http://staging-1.crossdottr.com/party/token/' + $routeParams.token + '/field/23/object', //Server script to process data
                    type: 'POST',
                    headers: {
                        // 'X-AUTH-TOKEN': localStorage.getItem('AUTH-TOKEN')
                    },
                    xhr: function() { // Custom XMLHttpRequest
                        var myXhr = $.ajaxSettings.xhr();
                        return myXhr;
                    },
                    //Ajax events
                    success: function(response) {




                    },
                    //  error: this.errorHandler,
                    // Form data
                    data: formData,
                    //Options to tell jQuery not to process data or worry about content-type.
                    cache: false,
                    contentType: false,
                    processData: false
                });



                // httpRequestService.post('/party/token/' + $routeParams.token + '/field/23/object', formData)
                //     .success(function(response) {
                //         console.log(1, response);
                //         // $rootScope.contractId = response;
                //         //  $rootScope.contractForm.id = response;
                //         // $window.location.href = '/#!/contract/' + response;

                //     })
            }
        });
        $scope.shoSignaturePad = function() {
            angular.element('#signature-container').css('visibility', 'visible').css('height', '200px');
            angular.element('.popup_style').hide();
        }
        $scope.saveText = function(id) {
            //console.log(type, $('#'+id).val())
            var formData = {

                "key": "field_freetext",
                "field_freetext": $('#' + id).val(),
                "type": "text",
                "enabled": true

            };
            console.log(formData)
            httpRequestService.post("/party/token/" + $routeParams.token + "/field/" + id + "/text", formData)
                .success(function(response) {
                    console.log(1, response);


                })

        }
        httpRequestService.get('/view/contract/thumbnails/' + $routeParams.token)
            .success(function(response) {
                $scope.thumbnails = response;
                console.log(response);
                //  /party/:token/fields
                httpRequestService.get('/party/' + $routeParams.token + '/fields')
                    .success(function(response) {
                        $scope.fileds = response;

                        var date = new Date();
                        //  $scope.date = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
                        $scope.filedVal = {
                            'NAME': '',
                            'FREE_TEXT': '',
                            'DATE': date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)
                        }
                    })
                    // var file = new Blob([response], { type: 'application/pdf' });
                    // var fileURL = URL.createObjectURL(file);
                    //   $scope.imageUrl = fileURL;
                    //  $('#send-signee').show();
                    // $('#contract-details').remove();

            })
    })
