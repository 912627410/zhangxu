/**
 * Created by luzhen on 12/26/17.
 */


(function(){
  'use strict'
  angular.module('GPSCloud').controller('addMineFleetController',addMineFleetCtrl);

  function addMineFleetCtrl(NgTableParams,ngTableDefaults,DEFAULT_SIZE_PER_PAGE,MINE_PAGE_URL,$scope,$uibModalInstance,GET_MINE_MACHINE_FLEET,serviceResource,Notification,$uibModal) {
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
        templateUrl: 'app/components/mineManagement/fleetManagement/minemngAddFleetMachine.html',
        controller: 'minemngAddFleetMachineController as minemngAddFleetMachineCtrl',
        size: 'sx',
        backdrop: false
      });
      modalInstance.result.then(function (result) {
           vm.selectAllInfo=result;

      }, function () {
      });
    };

    vm.query= function (page, size, sort, machine) {
      var restCallURL = MINE_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
      restCallURL += "&search_EQ_machineType=" + vm.machineType;
      restCallURL += "&search_EQ_status=" +1 ;
      if (null != machine) {

        if (null != machine.carNumber&&machine.carNumber!="") {
          restCallURL += "&search_LIKE_carNumber=" + $filter('uppercase')(machine.carNumber);
        }
      }
      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {

        vm.tableParams = new NgTableParams({
          // initial sort order
          // sorting: { name: "desc" }
        }, {
          dataset: data.content
        });
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        vm.machineList = null;
        Notification.error(languages.findKey('getDataVeFail'));
      });
    };



    vm.cancel=function(){

      $uibModalInstance.dismiss('cancel');
    }
  }

})();
