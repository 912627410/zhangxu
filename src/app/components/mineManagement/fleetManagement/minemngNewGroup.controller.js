/**
 * Created by 刘鲁振 on 2018/1/8.
 */
/**
 * Created by luzhen on 12/26/17.
 */


(function(){
  'use strict'
  angular.module('GPSCloud').controller('addGroupController',addGroupCtrl);

  function addGroupCtrl(NgTableParams,ngTableDefaults,DEFAULT_SIZE_PER_PAGE,MINE_PAGE_URL,$scope,$uibModalInstance,GET_MINE_MACHINE_FLEET,serviceResource,Notification,$uibModal) {
    var vm= this;
    vm.machineType = 1;


    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];


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
      var restPromise =serviceResource.restAddRequest(GET_MINE_MACHINE_FLEET,newOrg);
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



    //打开车队组织
    vm.addMinemngMachine = function() {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/mineManagement/fleetManagement/minemngSelectFleet.html',
        controller: 'minemngSelectFleetController as minemngSelectFleetCtrl',
        size: 'sx',
        backdrop: false
      });
      modalInstance.result.then(function (result) {
        vm.selectAllInfo=result;
        if(vm.selectAllInfo.indexOf(vm.selectedParentObject)>=0){

        }
      }, function () {
        Notification.error('请选择车队！');
      });
    };




    vm.cancel=function(){

      $uibModalInstance.dismiss('cancel');
    }
  }

})();
