/**
 * Created by xiaopeng on 16-11-16.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('uploadMachineController', uploadMachineController);

  /** @ngInject */
  function uploadMachineController($scope,$timeout, $uibModalInstance,Upload,$http, SIM_UPLOAD_URL,MACHINE_UPLOADTEMPLATE_DOWNLOAD_URL, Notification, operatorInfo) {
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

    vm.templateDownload = function () {
      var restCallURL = MACHINE_UPLOADTEMPLATE_DOWNLOAD_URL;
      $http({
        url: restCallURL,
        method: "GET",
        responseType: 'arraybuffer'
      }).success(function (data, status, headers, config) {
        var blob = new Blob([data], {type: "application/vnd.ms-excel"});
        var objectUrl = window.URL.createObjectURL(blob);

        var anchor = angular.element('<a/>');
        anchor.attr({
          href: objectUrl,
          target: '_blank',
          download: '车辆导入模板.xls'
        })[0].click();

      }).error(function (data, status, headers, config) {
        Notification.error("下载失败!");
      });
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  }
})();
