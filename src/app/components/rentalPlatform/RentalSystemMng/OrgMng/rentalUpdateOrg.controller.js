/**
 * Created by mengwei on 17-12-8.
 */
(function(){
  'use strict'
  angular.module('GPSCloud').controller('rentalUpdateOrgController',rentalUpdateOrgController);

  function rentalUpdateOrgController($uibModalInstance,RENTAL_ORG_URL,serviceResource,RENTAL_ORG_ID_URL,Notification,selectedOrgid,parentOrg) {
    var vm =this;
    vm.selectedOrgid = selectedOrgid;
    vm.parentOrg = parentOrg;

    var url = RENTAL_ORG_ID_URL+"?id=" + vm.selectedOrgid;
    var orgPromise = serviceResource.restCallService(url,"GET");
    orgPromise.then(function (data) {
      vm.selectedOrg = data.content;
    })

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
