/**
 * Created by mengwei on 17-12-8.
 */
(function(){
  'use strict'
  angular.module('GPSCloud').controller('updateOrgController',updateOrgCtrl);

  function updateOrgCtrl($uibModalInstance,RENTAL_ORG_URL,serviceResource,Notification,selectedOrg) {
    var vm =this;
    vm.selectedOrg = angular.copy(selectedOrg);

    vm.ok= function(newOrg){
      var restPromise =serviceResource.restUpdateRequest(RENTAL_ORG_URL,newOrg);
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
