/**
 * Created by long on 16-12-9.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('modifyFileController', modifyFileController);

  function modifyFileController($rootScope, $http, $confirm, updateFile, $uibModalInstance, serviceResource, Notification, MODIFY_FILE_URL) {
    var vm = this;
    vm.updateFile = angular.copy(updateFile);
    vm.softVersion = (updateFile.softVersion/100).toFixed(2);

    $http.get("updateFileType.json").success(function(data){
      vm.fileTypeList1 = JSON.parse(JSON.stringify(data));
      if(vm.updateFile.fileType1 != null) {
        vm.getFileTypeList2(vm.updateFile.fileType1);
        vm.updateFile.fileType2 = updateFile.fileType2;
      }
    });

    vm.getFileTypeList2 = function(value) {
      vm.updateFile.fileType2 = null;
      vm.fileTypeList2 = null;
      var len = vm.fileTypeList1.length;
      for(var i = 0;i<len;i++) {
        if(vm.fileTypeList1[i].value == value) {
          vm.fileTypeList2 = vm.fileTypeList1[i].content;
          return;
        }
      }
    };

    vm.ok = function(softVersion, updateFile){
      if(null == updateFile.versionNum){
        Notification.error("请输入协议版本!");
        return;
      }
      if(updateFile.versionNum%1 != 0 || updateFile.versionNum < 1 || updateFile.versionNum > 9999) {
        Notification.error("请重新录入协议版本!");
        return;
      }
      var verArr = softVersion.split(".");
      if(softVersion * 100 > 9999 || verArr.length > 1 && verArr[1].length > 2) {
        Notification.error("请重新录入软件版本");
        return;
      }
      if(updateFile.fileType1 == null || updateFile.fileType2 == null) {
        Notification.error("请选择适用对象!");
        return;
      }
      var modifyFile = {
          versionNum: updateFile.versionNum,
          softVersion: Math.round(softVersion*100),
          remarks: updateFile.remarks,
        id: updateFile.id,
        fileType1: updateFile.fileType1,
        fileType2: updateFile.fileType2
      };

      $confirm({
        title:"操作提示",
        text:"您确定修改此文件的信息?"
      }).then(function () {
        var restPromise = serviceResource.restAddRequest(MODIFY_FILE_URL, modifyFile);
        restPromise.then(function (data) {
          if(data.code == 0){
            Notification.success(data.content);
            $uibModalInstance.close();
          }else{
            Notification.error(data.content);
          }
        }, function (reason) {
          Notification.error(reason.data.content);
        });

      })
    };

    vm.cancel = function(){
      $uibModalInstance.dismiss('cancel');
    }

  }
})();
