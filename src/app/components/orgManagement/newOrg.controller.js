/**
 * Created by shuangshan on 16/1/20.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newOrgController', newOrgController);

  /** @ngInject */
  function newOrgController($rootScope,$scope, $uibModalInstance,serviceResource, Notification, ORG_ADD_URL,selectedOrg) {
    var vm = this;
    vm.operatorInfo =$rootScope.userInfo;
    vm.selectedOrg = selectedOrg;
    vm.ok = function (orgLabel,orgName) {

      var newOrg = {
        parentId: vm.selectedOrg.id,
        label: orgLabel,
        name: orgName
      };

      var restPromise = serviceResource.restUpdateRequest(ORG_ADD_URL,newOrg);
      restPromise.then(function (data){
        Notification.success("新增组织成功!");
        //新增组织更新到原组织树
        $uibModalInstance.close(data.content);
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
