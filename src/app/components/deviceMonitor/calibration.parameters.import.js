/**
 * Created by yalong on 17-9-22.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('calibrationParametersImportController', calibrationParametersImportController);

  /** @ngInject */
  function calibrationParametersImportController($timeout, $uibModalInstance,Upload,$http, CALIBRATION_PARAMETER_IMPORT, Notification, operatorInfo) {
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

    // vm.templateDownload = function () {
    //   var restCallURL = MACHINE_UPLOADTEMPLATE_DOWNLOAD_URL;
    //   $http({
    //     url: restCallURL,
    //     method: "GET",
    //     responseType: 'arraybuffer'
    //   }).success(function (data, status, headers, config) {
    //     var blob = new Blob([data], {type: "application/vnd.ms-excel"});
    //     var objectUrl = window.URL.createObjectURL(blob);
    //
    //     var anchor = angular.element('<a/>');
    //
    //     //兼容多种浏览器
    //     if (window.navigator.msSaveBlob) { // IE
    //       window.navigator.msSaveOrOpenBlob(blob, '车辆导入模板.xls')
    //     } else if (navigator.userAgent.search("Firefox") !== -1) { // Firefox
    //       anchor.css({display: 'none'});
    //       angular.element(document.body).append(anchor);
    //       anchor.attr({
    //         href: URL.createObjectURL(blob),
    //         target: '_blank',
    //         download:  '车辆导入模板.xls'
    //       })[0].click();
    //       anchor.remove();
    //     } else { // Chrome
    //       anchor.attr({
    //         href: URL.createObjectURL(blob),
    //         target: '_blank',
    //         download:  '车辆导入模板.xls'
    //       })[0].click();
    //     }
    //
    //
    //   }).error(function (data, status, headers, config) {
    //     Notification.error("下载失败!");
    //   });
    // };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  }
})();
