/**
 * Created by yalong on 17-7-17.
 */
(function () {
  'use strict';
  angular
    .module('GPSCloud')
    .controller('modifyFileController', modifyFileController);
  function modifyFileController($rootScope, $confirm, updateFile, $uibModalInstance, serviceResource, Notification, MODIFY_FILE_URL) {
    var vm = this;
    vm.updateFile = updateFile;
    vm.versionNum = (updateFile.versionNum/100).toFixed(2);
    vm.ok = function(versionNum, updateFile){
      var verArr = versionNum.split(".");
      if(versionNum * 100 > 9999 || verArr.length > 1 && verArr[1].length > 2) {
        Notification.error("请重新输入版本号!");
        return;
      }
      var modifyFile = {
        versionNum: Math.round(versionNum*100),
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
