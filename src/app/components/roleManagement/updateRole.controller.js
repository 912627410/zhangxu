/**
 * Created by shuangshan on 16/1/20.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateRoleController', updateRoleController);

  /** @ngInject */
  function updateRoleController($uibModalInstance,ROLE_OPER_URL,treeFactory,serviceResource, roleService,Notification,roleInfo) {
    var vm = this;
    vm.roleInfo=roleInfo;

    vm.roleInfo.type={value:roleInfo.type,desc:roleInfo.typeDesc};

    vm.orgTypeList;

    var promise = roleService.queryOrgTypeList();
    promise.then(function (data) {
      vm.orgTypeList = data;
      //    console.log(vm.userinfoStatusList);
    }, function (reason) {
      Notification.error('获取组织类型失败');
    })

    vm.ok = function (roleInfo) {
      for(var i=0;i<vm.orgTypeList.length;i++){
        if(vm.orgTypeList[i].desc==roleInfo.type.desc){
          console.log("1111");
          roleInfo.type=vm.orgTypeList[i].value;
          break;
        }
      }


      if(roleInfo.type==null){
        Notification.error('类型为空');
        return;
      }


      var restPromise = serviceResource.restUpdateRequest(ROLE_OPER_URL,roleInfo);
      restPromise.then(function (data){

        if(data.code===0){
          Notification.success("修改角色信息成功!");
          $uibModalInstance.close(data.content);
        }else{
          Notification.error(data.message);
        }
      },function(reason){
        vm.errorMsg=reason.data.message;
        Notification.error(reason.data.message);
      });
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
