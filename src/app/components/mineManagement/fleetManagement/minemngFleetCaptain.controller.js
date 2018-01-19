/**
 * Created by 刘鲁振 on 2018/1/17.
 */



(function(){
  'use strict'
  angular.module('GPSCloud').controller('fleetCaptainController',fleetCaptainController);

  function fleetCaptainController($confirm,languages,MINE_DELETE_CAPTAIN_MACHINE,MINE_QUERY_CAPTAIN_INFO,MINE_ADD_FLEET_CAPTAIN,MINEMNG_CAPTAIN_INFOPAGE_URL,DEFAULT_MINSIZE_PER_PAGE,MINE_NEW_TEAM,NgTableParams,ngTableDefaults,DEFAULT_SIZE_PER_PAGE,MINE_PAGE_URL,$scope,$uibModalInstance,GET_MINE_MACHINE_FLEET,serviceResource,Notification,$uibModal) {
    var vm= this
    vm.addSelected = []; //选中的设备id
    vm.deleSelected=[];
    vm.minemngFleet;//车队
    ngTableDefaults.params.count = DEFAULT_MINSIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    //组织树
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
           vm.minemngFleet=null;
           Notification.warning('请选择车队！');
        }else {
          vm.minemngFleet=result;
          vm.queryFleetCaptain()
        }
      }, function () {

      });
    };

    //分页查询未添加车队的队长信息
    vm.query = function (page, size, sort, minemnguser) {
      vm.checked=false;//查询之前全选置空
      vm.addSelected = []; //查询之前全选置空
      var restCallURL = MINEMNG_CAPTAIN_INFOPAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_MINSIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (minemnguser != 'undefined' && null != minemnguser) {

        if (null != minemnguser.jobNumber && minemnguser.jobNumber != "") {
          restCallURL += "&jobNumber=" + minemnguser.jobNumber;
        }
        if (null != minemnguser.name && minemnguser.name != "") {
          restCallURL += "&name=" + minemnguser.name;
        }
      }
      restCallURL += "&roleName=" + '车队队长';

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {

        vm.addTableParams = new NgTableParams({}, {
          dataset: data.content

        });
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
        vm.page.totalElements=data.page.totalElements;

      }, function (reason) {
        Notification.error(languages.findKey('FaGetCu'));
      });
    };
    //vm.query(null, null, null, null);

    //查询添加车队的队长信息
    vm.queryFleetCaptain=function(){

      vm.checked=false;//查询之前全选置空
      vm.deleSelected=[];//把选中的设备设置为空
      vm.addSelected = []; //查询之前全选置空
      var restCallURL = MINE_QUERY_CAPTAIN_INFO;
      if(vm.minemngFleet==null){
        Notification.warning({message:"请选择车队!",positionX: 'center'});
        return;
      }
      restCallURL += "?fleetId=" + vm.minemngFleet.id;
      var restPromise = serviceResource.restCallService(restCallURL,"GET");
      restPromise.then(function (data) {
        vm.deleTableParams = new NgTableParams({}, {
          dataset: data.content
        });
      }, function (reason) {
        Notification.error(languages.findKey('getDataVeFail'));
      });
    };

    //添加队长的单选全选
    var addUpdateSelected = function (action, id) {
      if (action == 'add' && vm.addSelected.indexOf(id) == -1) {
        vm.addSelected.push(id);
      }
      if (action == 'remove' && vm.addSelected.indexOf(id) != -1) {
        var idx = vm.addSelected.indexOf(id);
        vm.addSelected.splice(idx, 1);
      }
    }

    vm.addUpdateSelection = function ($event, id, status) {

      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      addUpdateSelected(action, id);
    }

    vm.addUpdateAllSelection = function ($event) {
      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      vm.addTableParams.data.forEach(function (minemnguser) {
        addUpdateSelected(action, minemnguser.id);
      })
    }

    vm.isAddSelected = function (id) {
      return vm.addSelected.indexOf(id) >= 0;
    }

    //删除队长的单选全选
    var deleUpdateSelected = function (action, id) {
      if (action == 'add' && vm.deleSelected.indexOf(id) == -1) {
        vm.deleSelected.push(id);
      }
      if (action == 'remove' && vm.deleSelected.indexOf(id) != -1) {
        var idx = vm.deleSelected.indexOf(id);
        vm.deleSelected.splice(idx, 1);

      }
    }

    vm.deleUpdateSelection = function ($event, id, status) {

      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      deleUpdateSelected(action, id);
    }

    vm.deleUpdateAllSelection = function ($event) {
      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      vm.deleTableParams.data.forEach(function (minemnguser) {
        deleUpdateSelected(action, minemnguser.id);
      })
    }

    vm.isDeleSelected = function (id) {
      return vm.deleSelected.indexOf(id) >= 0;
    }

     //添加车队队长
     vm.addFleetCaptain= function(minemnguser){

      if(vm.addSelected.length==0){
        Notification.warning({message:"请选择队长!",positionX: 'center'});
        return;
      }
      vm.addFleetMachiene = {ids: vm.addSelected, "fleetId": vm.minemngFleet.id};
      var restPromise = serviceResource.restUpdateRequest(MINE_ADD_FLEET_CAPTAIN, vm.addFleetMachiene);
      restPromise.then(function (data) {
          if(data.code===0){
            vm.addSelected=[];
            vm.query(null,null,null,null);
          }
        }, function (reason) {
          // alert(reason.data.message);
          vm.errorMsg=reason.data.message;
          Notification.error(reason.data.message);
        }

      );

    };

    /**
     * 删除车队队长
     * @param id
     */
    vm.delete = function (machine) {
      if(vm.deleSelected.length==0){
        Notification.warning({message:"请选择队长",positionX: 'center'});
        return;
      }
      $confirm({text: languages.findKey('areYouWanttoDeleteIt'), title: languages.findKey('deleteConfirmation'), ok: languages.findKey('confirm'), cancel:languages.findKey('cancel')})
        .then(function () {
          vm.addFleetMachiene = {ids: vm.deleSelected};
          var restPromise = serviceResource.restUpdateRequest(MINE_DELETE_CAPTAIN_MACHINE, vm.addFleetMachiene);
          restPromise.then(function (data) {
              if(data.code===0){
                Notification.success("删除成功!");
                vm.deleSelected=[];
                vm.queryFleetCaptain();
              }
            }, function (reason) {
              // alert(reason.data.message);
              vm.errorMsg=reason.data.message;
              Notification.error(reason.data.message);
            }

          );
        });
    };


    //重置查询框
    vm.reset = function () {
      vm.minemnguser = null;
      vm.addSelected=[]; //把选中的设备设置为空
      vm.deleSelected=[];//把选中的设备设置为空
      vm.checked=false;
    }
    vm.cancel=function(){

      $uibModalInstance.dismiss('cancel');
    }
  }

})();
