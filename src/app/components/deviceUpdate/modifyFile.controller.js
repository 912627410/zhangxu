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
    vm.versionNum = (updateFile.versionNum/100).toFixed(2);

    vm.ok = function(versionNum, updateFile){
      var modifyFile = {
        versionNum: versionNum*100,
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
