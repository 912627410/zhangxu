/**
 * Created by long on 16-12-9.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('modifyFileController', modifyFileController);

  function modifyFileController($rootScope, $confirm, updateFile, $uibModalInstance, serviceResource, Notification, MODIFY_FILE_URL) {
    var vm = this;
    vm.updateFile = updateFile;
    vm.softVersion = (updateFile.softVersion/100).toFixed(2);
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
      var modifyFile = {
          versionNum: updateFile.versionNum,
          softVersion: Math.round(softVersion*100),
          remarks: updateFile.remarks,
        id: updateFile.id,
        applicableProducts: updateFile.applicableProducts
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
