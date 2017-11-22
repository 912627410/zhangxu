/**
 * Created by long on 16-10-19.
 */
(function () {
  'use strict';


  angular
    .module('GPSCloud')
    .controller('newUpdateFileController', newUpdateFileController);

  function newUpdateFileController($rootScope, $http, $timeout, Upload, $uibModalInstance, Notification, operatorInfo, UPDATE_FILE_UPLOAD_URL) {
    var vm = this;
    vm.operatorInfo = operatorInfo;

    $http.get("updateFileType.json").success(function(data){
      vm.fileTypeList1 = JSON.parse(JSON.stringify(data));
    });

    vm.getFileTypeList2 = function(value) {
      vm.file.fileType2 = null;
      vm.fileTypeList2 = null;
      var len = vm.fileTypeList1.length;
      for(var i = 0;i<len;i++) {
        if(vm.fileTypeList1[i].value == value) {
          vm.fileTypeList2 = vm.fileTypeList1[i].content;
          return;
        }
      }
    };

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

      if(null == file.fileType1 || null == file.fileType2){
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
          fileType1:file.fileType1,
          fileType2:file.fileType2
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
