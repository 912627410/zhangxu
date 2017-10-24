/**
 * Created by yalong on 17-7-17.
 */
(function () {
  'use strict';
  angular
    .module('GPSCloud')
    .controller('modifyFileController', modifyFileController);
  function modifyFileController($rootScope, $confirm,languages, updateFile, $uibModalInstance, serviceResource, Notification, MODIFY_FILE_URL) {
    var vm = this;
    vm.updateFile = updateFile;
    vm.versionNum = (updateFile.versionNum/100).toFixed(2);
    vm.ok = function(versionNum, updateFile){
      var verArr = versionNum.split(".");
      if(versionNum * 100 > 9999 || verArr.length > 1 && verArr[1].length > 2) {
        Notification.error(languages.findKey('pleaseReEnterTheVersionNumber'));
        return;
      }
      var modifyFile = {
        versionNum: Math.round(versionNum*100),
        id: updateFile.id,
        applicableProducts: updateFile.applicableProducts
      };
      $confirm({
        title:languages.findKey('operationHints'),
        text:languages.findKey('areYouWantToModifyThisFile')
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
