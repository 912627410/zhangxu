/**
 * Created by shuangshan on 16/1/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('uploadSimController', uploadSimController);

  /** @ngInject */
  function uploadSimController($scope,$timeout, $uibModalInstance,Upload, SIM_UPLOAD_URL,serviceResource, Notification, operatorInfo) {
    var vm = this;
    vm.operatorInfo = operatorInfo;


    vm.upload = function(file) {
        file.upload = Upload.upload({
          url: SIM_UPLOAD_URL,
          data: {file: file}
        });

        file.upload.then(function (response) {
          $timeout(function () {
            file.result = response.data;
            console.log(response.data);
            vm.errorList=file.result.content;
            if (vm.errorList.length > 0){
              vm.operMsg = "存在异常数据";
            }else{
              vm.operMsg = "上传成功";
            }

            vm.file=null;
            console.log(vm.operMsg);

          });
        }, function (response) {

        }, function (evt) {
          // Math.min is to fix IE which reports 200% sometimes
          file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        });
      }

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  }
})();
