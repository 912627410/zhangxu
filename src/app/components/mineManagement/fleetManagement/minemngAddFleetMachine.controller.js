/**
 * Created by luzhen on 12/26/17.
 */


(function(){
  'use strict'
  angular.module('GPSCloud').controller('addMineFleetController',addMineFleetController);

  function addMineFleetController(MINE_DELETE_TEAM_MACHINE,$confirm,MINE_ADD_MACHINE_INFO,MINE_NOT_ADD_MACHINE_INFO,languages,MINEMNG_MACHINE_TYPE_LIST,MINE_ADD_TEAM_MACHINE,$filter,MINE_MACHINE_FLEET,NgTableParams,ngTableDefaults,DEFAULT_SIZE_PER_PAGE,MINE_PAGE_URL,$scope,$uibModalInstance,GET_MINE_MACHINE_FLEET,serviceResource,Notification,$uibModal) {
    var vm= this;
    vm.machineType=null;
    vm.fleetTeam;
    vm.fleetName;
    vm.fleetTeamName;
    vm.selected = []; //选中的设备id
    vm.machineTypeList;
    //定义每页显示多少条数据
    vm.pageSize = 10;
    //接受添加车队的车辆
    vm.fleetMachine;


    vm.init = function () {
      vm.machineStatePromise();
    };
    var machineStatePromise = serviceResource.restCallService(MINEMNG_MACHINE_TYPE_LIST,"QUERY");
    machineStatePromise.then(function (data) {
      vm.machineTypeList= data;
    }, function () {
      Notification.error(languages.findKey('getVeStaFail'));
    })

    ngTableDefaults.params.count = vm.pageSize;
    ngTableDefaults.settings.counts = [];





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
          Notification.warning('请选择小组！');
          vm.fleetTeam=null;
        }else {
          vm.fleetTeam=result;
          var restCallURL = MINE_MACHINE_FLEET;
          restCallURL += "?id=" + vm.fleetTeam.parentId;
          var dataPromis = serviceResource.restCallService(restCallURL, "GET");
          dataPromis.then(function (data) {
            vm.fleetName=data.name;
            vm.fleetTeamName=vm.fleetName+"  "+vm.fleetTeam.name;
            vm.queryMachine();
          });
        }

      }, function () {
      });
    };

    vm.query= function (currentPage, size, sort, machine) {
      var restCallURL = MINE_NOT_ADD_MACHINE_INFO;
      var pageUrl = currentPage || 0;
      var sizeUrl =  vm.pageSize;
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl ;

      if(vm.machineType!=null){
        restCallURL += "&machineType=" + vm.machineType;
      }
      if (null != machine) {

        if (null != machine.carNumber&&machine.carNumber!="") {
          restCallURL += "&carNumber=" + $filter('uppercase')(machine.carNumber);
        }
      }
      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
        vm.tableParams = new NgTableParams({}, {
          dataset: data.content
        });
        vm.totalElements = data.totalElements;
        vm.currentPage = data.number + 1;
      }, function (reason) {
        vm.machineList = null;
        Notification.error(languages.findKey('getDataVeFail'));
      });
    };

    //vm.query(null,null,null,null);


    vm.queryMachine=function(){
      var restCallURL = MINE_ADD_MACHINE_INFO;
      if(vm.fleetTeam==null){
        Notification.warning({message:"请选择小组!",positionX: 'center'});
        return;
      }
      restCallURL += "?teamId=" + vm.fleetTeam.id;
      var restPromise = serviceResource.restCallService(restCallURL,"GET");
      restPromise.then(function (data) {
        vm.tableParams2 = new NgTableParams({}, {
          dataset: data.content
        });
      }, function (reason) {
        Notification.error(languages.findKey('getDataVeFail'));
      });
    };
    //重置查询框
    vm.reset = function () {
      vm.machine = null;
      vm.org=null;
      vm.selected=[]; //把选中的设备设置为空
      vm.allot=null;
      vm.machineTypeList.code=null;
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
      vm.tableParams2.data.forEach(function (machine) {
        updateSelected(action, machine.id);
      })

    }

    vm.isSelected = function (id) {
      return vm.selected.indexOf(id) >= 0;
    }

    /**
     * 删除绑定的车辆
     * @param id
     */
    vm.delete = function (machine) {
      if(vm.selected.length==0){
        Notification.warning({message:"请选择车辆!",positionX: 'center'});
        return;
      }
      $confirm({text: languages.findKey('areYouWanttoDeleteIt'), title: languages.findKey('deleteConfirmation'), ok: languages.findKey('confirm'), cancel:languages.findKey('cancel')})
        .then(function () {
          vm.addFleetMachiene = {ids: vm.selected};
          var restPromise = serviceResource.restUpdateRequest(MINE_DELETE_TEAM_MACHINE, vm.addFleetMachiene);
          restPromise.then(function (data) {
              if(data.code===0){
                Notification.success("删除车辆成功!");
                vm.selected=[];
                vm.queryMachine(null);
              }
            }, function (reason) {
              // alert(reason.data.message);
              vm.errorMsg=reason.data.message;
              Notification.error(reason.data.message);
            }

          );
        });
    };




    vm.ok= function(machine){
      if(vm.fleetTeam==null){
        Notification.warning({message:"请选择小组!",positionX: 'center'});
        return;
      }
      if(vm.selected.length==0){
        Notification.warning({message:"请选择车辆!",positionX: 'center'});
        return;
      }
      vm.addFleetMachiene = {ids: vm.selected, "fleetTeamId": vm.fleetTeam.id};
      var restPromise = serviceResource.restUpdateRequest(MINE_ADD_TEAM_MACHINE, vm.addFleetMachiene);
      restPromise.then(function (data) {
          if(data.code===0){
            vm.query(null,null,null,null);
            vm.selected=[];
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
