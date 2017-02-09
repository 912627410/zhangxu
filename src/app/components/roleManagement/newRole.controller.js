/**
 * Created by riqina.ma on 16/5/24.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newRoleController', newRoleController);

  /** @ngInject */
  function newRoleController($scope, $uibModalInstance,ROLE_OPER_URL,treeFactory, serviceResource,roleService, Notification) {
    var vm = this;
    vm.operatorInfo = $scope.userInfo;

    vm.roleInfo = {};
      vm.orgTypeList;

      var promise = roleService.queryOrgTypeList();
      promise.then(function (data) {
          vm.orgTypeList = data;
          //    console.log(vm.userinfoStatusList);
      }, function (reason) {
          Notification.error('获取组织类型失败');
      })


    vm.ok = function (roleInfo) {

        roleInfo.type=roleInfo.type.value;

     var restPromise = serviceResource.restAddRequest(ROLE_OPER_URL, roleInfo);
      restPromise.then(function (data) {
        if(data.code===0){
          Notification.success("新建角色信息成功!");
          $uibModalInstance.close(data.content);
        }else{
          vm.roleInfo = roleInfo;
          Notification.error(data.message);
        }
      }, function (reason) {
          vm.errorMsg=reason.data.message;
          Notification.error(reason.data.message);
      }

      );
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.roleInfo.organizationDto=selectedItem;
      });
    }
  }
})();
