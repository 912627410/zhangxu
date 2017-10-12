/**
 * Created by yalong on 17-9-22.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('calibrationParametersImportController', calibrationParametersImportController);

  /** @ngInject */
  function calibrationParametersImportController($timeout, $uibModalInstance,Upload, CALIBRATION_PARAMETER_IMPORT, Notification, operatorInfo) {
    var vm = this;
    vm.operatorInfo = operatorInfo;


    vm.save = function(file) {
      file.upload = Upload.upload({
        url: CALIBRATION_PARAMETER_IMPORT,
        data: {file: file}
      });

      file.upload.then(function (response) {
        $timeout(function (data) {
          if(response.data.code == 0){
            Notification.success("导入成功");
            $uibModalInstance.close(response.data.content);
          }else{
            vm.errorList = response.data.content;
            Notification.error('导入失败,存在异常数据');
          }

        });
      }, function (response) {
        Notification.error('导入失败,存在异常数据!');

      }, function (evt) {
        // Math.min is to fix IE which reports 200% sometimes
        file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
      });
    }

    vm.clean = function () {
      vm.file = null;
      vm.errorList = null;
      vm.operMsg = null;
    }

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  }
})();
