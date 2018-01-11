/**
 * Created by luzhen on 12/26/17.
 */


(function(){
  'use strict'
  angular.module('GPSCloud').controller('addMineFleetController',addMineFleetController);

  function addMineFleetController(MINE_ADD_TEAM_MACHINE,$filter,MINE_MACHINE_FLEET,NgTableParams,ngTableDefaults,DEFAULT_SIZE_PER_PAGE,MINE_PAGE_URL,$scope,$uibModalInstance,GET_MINE_MACHINE_FLEET,serviceResource,Notification,$uibModal) {
    var vm= this;
    vm.machineType=null;
    vm.fleetTeam;
    vm.fleetName;
    vm.fleetTeamName;
    vm.selected = []; //选中的设备id

    vm.init = function () {
      vm.machineTypeList();
    };
    vm.machineTypeList=[{id:'1',name:'矿车'},{id:'2',name:'挖掘机'}];

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];


    vm.showOrgTree = false;

    vm.openOrgTree = function(){
      vm.showOrgTree = !vm.showOrgTree;
    }

    $scope.$on('OrgSelectedEvent',function(event,data){
      vm.showOrgTree=false;
      vm.selectedOrg = data;
    })



    //打开车队组织
    vm.addTeam = function() {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/mineManagement/fleetManagement/minemngSelectFleet.html',
        controller: 'minemngSelectFleetController as minemngSelectFleetCtrl',
        size: 'sx',
        backdrop: false
      });
      modalInstance.result.then(function (result) {
        vm.fleetTeam=result;
        if(vm.fleetTeam.parentId==0){
          Notification.error('请选择小组！');
          vm.fleetTeam=null;
        }else {
          vm.fleetTeam=result;
          var restCallURL = MINE_MACHINE_FLEET;
          restCallURL += "?id=" + vm.fleetTeam.parentId;
          var dataPromis = serviceResource.restCallService(restCallURL, "GET");
          dataPromis.then(function (data) {
            vm.fleetName=data.name;
            vm.fleetTeamName=vm.fleetName+"  "+vm.fleetTeam.name;
          });
        }

      }, function () {
      });
    };

    vm.query= function (page, size, sort, machine) {
      var restCallURL = MINE_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
      if(vm.machineTypeList.name>0){
        vm.machineType=vm.machineTypeList.name;
      }
      if(vm.machineType!=null){
        restCallURL += "&search_EQ_machineType=" + vm.machineType;
      }
      restCallURL += "&search_EQ_status=" +1 ;
      if (null != machine) {

        if (null != machine.carNumber&&machine.carNumber!="") {
          restCallURL += "&search_LIKE_carNumber=" + $filter('uppercase')(machine.carNumber);
        }
      }
      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
        //vm.machine =data.content;
        vm.tableParams = new NgTableParams({

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

    vm.query(null,null,null,null);

    //重置查询框
    vm.reset = function () {
      vm.machine = null;
      vm.org=null;
      vm.selected=[]; //把选中的设备设置为空
      vm.allot=null;
      vm.machineTypeList.name=null;
      vm.machineType=null;
    }


    var updateSelected = function (action, id) {
      if (action == 'add' && vm.selected.indexOf(id) == -1) {
        vm.selected.push(id);
      }
      if (action == 'remove' && vm.selected.indexOf(id) != -1) {
        var idx = vm.selected.indexOf(id);
        vm.selected.splice(idx, 1);

      }
    }

    vm.updateSelection = function ($event, id, status) {

      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      updateSelected(action, id);
    }

    vm.updateAllSelection = function ($event) {
      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      vm.tableParams.data.forEach(function (machine) {
        updateSelected(action, machine.id);
      })

    }

    vm.isSelected = function (id) {
      return vm.selected.indexOf(id) >= 0;
    }






    vm.ok= function(machine){
      if(vm.fleetTeam==null){
        Notification.error("添加车辆失败: 请选择小组!");
        return;
      }
      if(vm.selected.length==0){
        Notification.error("添加车辆失败: 请选择车辆!");
        return;
      }
      vm.addFleetMachiene = {ids: vm.selected, "fleetTeamId": vm.fleetTeam.id};
      var restPromise = serviceResource.restUpdateRequest(MINE_ADD_TEAM_MACHINE, vm.addFleetMachiene);
      restPromise.then(function (data) {
          if(data.code===200){
            $uibModalInstance.close(data.content);
          }
        }, function (reason) {
          // alert(reason.data.message);
          vm.errorMsg=reason.data.message;
          Notification.error(reason.data.message);
        }

      );

    };

    vm.cancel=function(){

      $uibModalInstance.dismiss('cancel');
    }
  }

})();
