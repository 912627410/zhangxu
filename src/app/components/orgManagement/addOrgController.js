/**
 * Created by mengwei on 17-4-13.
 */

(function(){
  'use strict'
  angular.module('GPSCloud').controller('addOrgController',addOrgCtrl);

  function addOrgCtrl($scope,$uibModalInstance,ORG_URL,serviceResource,Notification,selectedOrg) {
    var vm= this;
    vm.selectedOrg=selectedOrg;
    vm.ok= function(newOrg){
      if(vm.selectedOrg==null){
        Notification.error("添加组织失败: 请选择上级部门!");
        return;
      }
      if(!newOrg) {
        Notification.error("添加组织失败: 部门名称为空!");
        return;
      }
      newOrg.parentId = vm.selectedOrg.id;
      var restPromise =serviceResource.restAddRequest(ORG_URL,newOrg);
      restPromise.then(function (data) {
        if(data.code == 0) {
          Notification.success("添加组织成功");
          $uibModalInstance.close(data.content);
        } else {
          Notification.error("添加组织失败" + data.message);
        }

      },function(reason){
        Notification.error("添加组织失败: "+reason.data.message);
      });
    };

    vm.showOrgTree = false;

    vm.openOrgTree = function(){
      vm.showOrgTree = !vm.showOrgTree;
    }

    $scope.$on('OrgSelectedEvent',function(event,data){
      vm.showOrgTree=false;
      vm.selectedOrg = data;
    })
    vm.cancel=function(){
      vm.selectedOrg = selectedOrg;
      $uibModalInstance.dismiss('cancel');
    }
  }

})();