/**
 * Created by shuangshan on 16/1/20.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateSimController', updateSimController);

  /** @ngInject */
  function updateSimController($scope,$uibModalInstance,$timeout,SIM_URL,SIM_PROVIDER_URL,serviceResource, Notification,sim) {
    var vm = this;
    vm.sim = sim;
    var sourceSim = angular.copy(sim); //深度copy
    vm.operatorInfo =$scope.userInfo;

  //查询sim卡的供应商集合
    var simProviderData = serviceResource.restCallService(SIM_PROVIDER_URL, "QUERY");
    simProviderData.then(function (data) {
      vm.sim.simProviderList = data;
    }, function (reason) {
      Notification.error('获取SIM卡供应商集合失败');
    })


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

        if(data.code===0){
          Notification.success("修改SIM卡信息成功!");
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
   //   console.log(sourceSim);
   // //  vm.sim=sourceSim;
   ////
   //
   //   $timeout(function() {
   //     vm.sim=sourceSim;
   //     sim=sourceSim;
   //     console.log(sim);
   //     $scope.$apply();
   //     $uibModalInstance.close(sourceSim);
   //   });


      //
      $uibModalInstance.dismiss('cancel');

  //    $uibModalInstance.close();
    };
  }
})();
