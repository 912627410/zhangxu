/**
 * Created by shuangshan on 16/1/20.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateOrgController', updateOrgController);

  /** @ngInject */
  function updateOrgController($rootScope,$scope, $uibModalInstance,serviceResource, Notification, ORG_UPDATE_URL,selectedOrg) {
    var vm = this;
    vm.operatorInfo =$rootScope.userInfo;
    vm.selectedOrg = selectedOrg;
    vm.orgLabel = selectedOrg.label;

    vm.ok = function (orgLabel) {

      var updatedOrg = {
        id: vm.selectedOrg.id,
        label: orgLabel
      };

      var restPromise = serviceResource.restUpdateRequest(ORG_UPDATE_URL,updatedOrg);
      restPromise.then(function (data){
        Notification.success("修改组织成功!");
        //修改后的内容更新到原组织树
        vm.selectedOrg.label = data.content.label;

        $uibModalInstance.close();
      },function(reason){
        Notification.error(reason.data.message);
      });
    };
    //关闭更新页面
   vm.cancel=function () {

     vm.selectedOrg = selectedOrg;
     $uibModalInstance.dismiss('cancel');
   }

  }
})();
