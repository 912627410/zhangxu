/**
 * Created by shuangshan on 16/1/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('uploadSimController', uploadSimController);

  /** @ngInject */
  function uploadSimController($scope,$timeout,$http, $uibModalInstance,Upload, SIM_UPLOAD_URL,serviceResource, Notification, operatorInfo,SIM_UPLOADTEMPLATE_DOWNLOAD_URL) {
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
    vm.templateDownload = function () {
      var restCallURL = SIM_UPLOADTEMPLATE_DOWNLOAD_URL;
      $http({
        url: restCallURL,
        method: "GET",
        responseType: 'arraybuffer'
      }).success(function (data, status, headers, config) {
        var blob = new Blob([data], {type: "application/vnd.ms-excel"});
        var objectUrl = window.URL.createObjectURL(blob);

        var anchor = angular.element('<a/>');

        //兼容多种浏览器
        if (window.navigator.msSaveBlob) { // IE
          window.navigator.msSaveOrOpenBlob(blob, 'SIM卡导入模板.xls')
        } else if (navigator.userAgent.search("Firefox") !== -1) { // Firefox
          anchor.css({display: 'none'});
          angular.element(document.body).append(anchor);
          anchor.attr({
            href: URL.createObjectURL(blob),
            target: '_blank',
            download: 'SIM卡导入模板.xls'
          })[0].click();
          anchor.remove();
        } else { // Chrome
          anchor.attr({
            href: URL.createObjectURL(blob),
            target: '_blank',
            download: 'SIM卡导入模板.xls'
          })[0].click();
        }


      }).error(function (data, status, headers, config) {
        Notification.error("下载失败!");
      });
    }

  }
})();
