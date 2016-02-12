/**
 * Created by shuangshan on 16/1/20.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateSimController', updateSimController);

  /** @ngInject */
  function updateSimController($rootScope,$scope,$uibModalInstance,SIM_STATUS_URL,SIM_URL,serviceResource, Notification,sim) {
    var vm = this;
    vm.sim = sim;
    vm.operatorInfo =$rootScope.userInfo;

    //查询sim卡的状态集合
    var simStatusData = serviceResource.restCallService(SIM_STATUS_URL, "QUERY");
    simStatusData.then(function (data) {
      vm.sim.simStatusList = data;
    }, function (reason) {
      Notification.error('获取SIM状态集合失败');
    })

    vm.changeStatus=function(){
    //  alert(vm.sim.status);

      for(var i=0; i< vm.sim.simStatusList.length;i++){
        //alert(vm.sim.simStatusList[i].desc);
        if(vm.sim.simStatusList[i].value==vm.sim.status){
        //  alert(vm.sim.simStatusList[i].value);
          vm.sim.statusDesc=vm.sim.simStatusList[i].desc;
          break;
        }
      }


    }

    //日期控件相关
    //date picker
    vm.serviceBeginDateOpenStatus = {
      opened: false
    };
    vm.serviceEndDateOpenStatus = {
      opened: false
    };

    vm.serviceBeginDateOpen = function($event) {
      vm.serviceBeginDateOpenStatus.opened = true;
    };
    vm.serviceEndDateOpen = function($event) {
      vm.serviceEndDateOpenStatus.opened = true;
    };

    vm.maxDate = new Date();
    vm.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };

    vm.ok = function (sim) {
      var restPromise = serviceResource.restUpdateRequest(SIM_URL,sim);
      restPromise.then(function (data){
        Notification.success("修改SIM卡信息成功!");
        $uibModalInstance.close();
      },function(reason){
        Notification.error("修改SIM卡信息出错!");
      });
    };


    vm.showOrgTree = false;

    vm.openOrgTree = function(){
      vm.showOrgTree = !vm.showOrgTree;
    }

    $scope.$on('OrgSelectedEvent',function(event,data){
      vm.selectedOrg = data;
      vm.sim.org = vm.selectedOrg;
      vm.showOrgTree = false;
    })
    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
})();
