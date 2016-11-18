/**
 * Created by long on 16-10-19.
 */
(function () {
  'use strict';


  angular
    .module('GPSCloud')
    .controller('newUpdateFileController', newUpdateFileController);

  function newUpdateFileController($rootScope, $scope, $timeout, Upload, $uibModalInstance, serviceResource, Notification, operatorInfo, UPDATE_FILE_UPLOAD_URL) {
    var vm = this;
    vm.operatorInfo = operatorInfo;

    vm.ok = function(file){
      vm.errorMsg = null;

      if(null == file || null == file.name){
        Notification.error("请选择上传的文件!");
        return;
      }

      if(null == file.versionNum){
        Notification.error("请输入版本号!");
        return;
      }

      file.upload = Upload.upload({
        url: UPDATE_FILE_UPLOAD_URL,
        data: {
          versionNum:file.versionNum,
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
        console.log(evt);
        // file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
      });
    };

    vm.cancel = function(){
      $uibModalInstance.dismiss('cancel');
    }

  }
})();
