/**
 * Created by 刘鲁振 on 2018/1/8.
 */



(function(){
  'use strict'
  angular.module('GPSCloud').controller('addGroupController',addGroupController);

  function addGroupController(MINE_NEW_TEAM,$scope,$uibModalInstance,serviceResource,Notification,$uibModal) {
    var vm= this;
    vm.machineType = 1;
    vm.fleet;
    vm.minemngFleet = {
      parentFleet:'',
      label:''
    };
    vm.fleetGroup={parentId:'',label:'',status:'',id:''};

    vm.ok= function(minemngFleet){

        vm.fleetGroup.parentId=vm.minemngFleet.parentFleet.id;
        vm.fleetGroup.label=minemngFleet.label;
        var restPromise = serviceResource.restAddRequest(MINE_NEW_TEAM, vm.fleetGroup);
        restPromise.then(function (data) {
            if(data.code===0){
              vm.minemngFleet = data.content;
              Notification.success("增加成功");
              $uibModalInstance.close(data.content);
            }
          }, function (reason) {
            // alert(reason.data.message);
            vm.errorMsg=reason.data.message;
            Notification.error(reason.data.message);
          }

        );


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
        vm.fleet=result;
        if(vm.fleet.parentId!=0){
          Notification.warning('请选择车队！');
          vm.minemngFleet.parentFleet=null;
        }else {
          vm.minemngFleet.parentFleet=result;
        }
      }, function () {

      });
    };




    vm.cancel=function(){

      $uibModalInstance.dismiss('cancel');
    }
  }

})();
