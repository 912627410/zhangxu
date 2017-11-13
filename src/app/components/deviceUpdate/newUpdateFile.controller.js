/**
 * Created by yalong on 17-7-17.
 */
(function () {
  'use strict';
  angular
    .module('GPSCloud')
    .controller('newUpdateFileController', newUpdateFileController);
  function newUpdateFileController($rootScope, $scope, $timeout, Upload, $uibModalInstance, Notification, operatorInfo, UPDATE_FILE_UPLOAD_URL) {
    var vm = this;
    vm.operatorInfo = operatorInfo;
    vm.ok = function(file){
      vm.errorMsg = null;
      if(null == file || null == file.name){
        Notification.error("请选择上传的文件!");
        return;
      }
      if(null == file.versionNum){
        Notification.error("请输入协议版本!");
        return;
      }
      if(file.versionNum%1 != 0 || file.versionNum < 1 || file.versionNum > 9999) {
        Notification.error("请重新录入协议版本!");
        return;
      }
      if(null == file.softVersion){
        Notification.error("请输入软件版本!");
        return;
      }
      if(null == file.applicableProducts){
        Notification.error("请选择适用对象!");
        return;
      }
      var verArr = file.softVersion.split(".");
      if(file.softVersion * 100 > 9999 || verArr.length > 1 && verArr[1].length > 2) {
        Notification.error("请重新录入软件版本!");
        return;
      }
      file.upload = Upload.upload({
        url: UPDATE_FILE_UPLOAD_URL,
        data: {
          versionNum: Math.round(file.versionNum),
          softVersion: Math.round(file.softVersion*100),
          remarks: file.remarks,
          applicableProducts:file.applicableProducts
        },
        file: file
      });
      file.upload.then(function(response){
        $timeout(function(){
          file.result = response.data;
          if(file.result.code == 0){
            Notification.success("新增升级文件成功!");
            $uibModalInstance.close();
          }else{
            Notification.error(data.message);
          }
        })
      },function(reason){
        vm.errorMsg=reason.data.message;
        Notification.error("新增升级文件失败!");
        Notification.error(vm.errorMsg);
      },function(evt){
      });
    };
    vm.cancel = function(){
      $uibModalInstance.dismiss('cancel');
    }
  }
})();
