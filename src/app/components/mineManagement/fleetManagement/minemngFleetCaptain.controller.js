/**
 * Created by 刘鲁振 on 2018/1/17.
 */



(function(){
  'use strict'
  angular.module('GPSCloud').controller('fleetCaptainController',fleetCaptainController);

  function fleetCaptainController(MINEMNG_USERINFOPAGE_URL,DEFAULT_MINSIZE_PER_PAGE,MINE_NEW_TEAM,NgTableParams,ngTableDefaults,DEFAULT_SIZE_PER_PAGE,MINE_PAGE_URL,$scope,$uibModalInstance,GET_MINE_MACHINE_FLEET,serviceResource,Notification,$uibModal) {
    var vm= this;
    vm.machineType = 1;
    vm.fleet;
    vm.minemngFleet = {
      parentFleet:'',
      label:''
    };
    vm.fleetGroup={parentId:'',label:'',status:'',id:''};
    ngTableDefaults.params.count = DEFAULT_MINSIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    vm.ok= function(minemngFleet){
      if(vm.minemngFleet.parentFleet==null||vm.minemngFleet.parentFleet==""){
        Notification.warning('请选择车队！');
      }
        vm.fleetGroup.parentId=vm.minemngFleet.parentFleet.id;
        vm.fleetGroup.label=minemngFleet.label;
        var restPromise = serviceResource.restAddRequest(MINE_NEW_TEAM, vm.fleetGroup);
        restPromise.then(function (data) {
            if(data.code===0){
              vm.minemngFleet = data.content;

              $uibModalInstance.close(data.content);
            }
          }, function (reason) {
            // alert(reason.data.message);
            vm.errorMsg=reason.data.message;
            Notification.error(reason.data.message);
          }

        );


    };

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
          Notification.warning('请选择车队！');
          vm.minemngFleet.parentFleet=null;
        }else {
          vm.minemngFleet.parentFleet=result;
        }
      }, function () {

      });
    };

//分页查询用户信息
    vm.query = function (page, size, sort, minemnguser) {
      var restCallURL = MINEMNG_USERINFOPAGE_URL;
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
    vm.query(null, null, null, null);

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
      vm.addTableParams.data.forEach(function (machine) {
        addUpdateSelected(action, machine.id);
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
      vm.deleTableParams.data.forEach(function (machine) {
        deleUpdateSelected(action, machine.id);
      })
    }

    vm.isDeleSelected = function (id) {
      return vm.deleSelected.indexOf(id) >= 0;
    }





    //重置查询框
    vm.reset = function () {
      vm.machine = null;
      vm.org=null;
      vm.addSelected=[]; //把选中的设备设置为空
      vm.deleSelected=[];//把选中的设备设置为空
      vm.allot=null;
      vm.machineTypeList.code=null;
      vm.machineType=null;
      vm.checked=false;
    }
    vm.cancel=function(){

      $uibModalInstance.dismiss('cancel');
    }
  }

})();
