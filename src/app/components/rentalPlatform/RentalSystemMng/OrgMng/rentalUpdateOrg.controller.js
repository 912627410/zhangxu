/**
 * Created by mengwei on 17-12-8.
 */
(function(){
  'use strict'
  angular.module('GPSCloud').controller('updateOrgController',updateOrgCtrl);

  function updateOrgCtrl($uibModalInstance,ORG_URL,serviceResource,Notification,selectedOrg,parentOrg) {
    var vm =this;
    vm.selectedOrg = angular.copy(selectedOrg);
    vm.parentOrg=parentOrg;
    vm.ok= function(newOrg){
      var restPromise =serviceResource.restUpdateRequest(ORG_URL,newOrg);
      restPromise.then(function (data) {
        if(data.code == 0) {
          Notification.success("更新组织成功");
          $uibModalInstance.close(data.content);
        } else {
          Notification.error("更新组织失败: "+ data.message);
        }
      },function(reason){
        Notification.error("更新组织失败: "+reason.data.message);
      });
    };

    vm.cancel=function(){
      $uibModalInstance.dismiss('cancel');
    }
  }

})();
