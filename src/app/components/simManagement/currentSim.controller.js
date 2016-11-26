/**
 * Created by shuangshan on 16/1/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('currentSimController', currentSimController);

  /** @ngInject */
  function currentSimController($scope,$timeout, $uibModalInstance,sim, SIM_LOCATION_URL,SIM_STATUS_URL,SIM_GRPS_URL,serviceResource, Notification) {
    var vm = this;
    vm.sim=sim;

    vm.queryLocation = function (sim) {

      var restCallURL=SIM_LOCATION_URL+"?phoneNumber="+sim.phoneNumber;
      var restPromise = serviceResource.restCallService(restCallURL, "GET");
      restPromise.then(function (data){

        if(data.code===0){
          var simResposeDto =data.content;
          if(simResposeDto.code=="0"){
            vm.location=" 经度: "+simResposeDto.lat +"  纬度: "+simResposeDto.lng;
            Notification.success("查询基站信息成功");
          }else{
            vm.location="code: "+simResposeDto.code+"  "+ simResposeDto.message;
            Notification.error(vm.location);
          }

        }else{
          Notification.error(data.message);
        }
      },function(reason){
        vm.errorMsg=reason.data.message;
        Notification.error(reason.data.message);
      });

    };

    vm.queryStatus = function (sim) {

      var restCallURL=SIM_STATUS_URL+"?phoneNumber="+sim.phoneNumber;
      var restPromise = serviceResource.restCallService(restCallURL, "GET");
      restPromise.then(function (data){

        if(data.code===0){
          var simResposeDto =data.content;
          if(simResposeDto.code=="0"){
            vm.status=simResposeDto.status;
            Notification.success("查询状态信息成功");
          }else{
            vm.status="code: "+simResposeDto.code+"  "+ simResposeDto.message;
            Notification.error(vm.location);
          }

        }else{
          Notification.error(data.message);
        }
      },function(reason){
        vm.errorMsg=reason.data.message;
        Notification.error(reason.data.message);
      });

    };

    vm.queryGprs = function (sim) {

      var restCallURL=SIM_GRPS_URL+"?phoneNumber="+sim.phoneNumber;
      var restPromise = serviceResource.restCallService(restCallURL, "GET");
      restPromise.then(function (data){

        if(data.code===0){
          var simResposeDto =data.content;
          if(simResposeDto.code=="0"){
            vm.gprs=simResposeDto.totalGprs;
            Notification.success("查询流量信息成功");
          }else{
            vm.gprs="code: "+simResposeDto.code+"  "+ simResposeDto.message;
            Notification.error(vm.location);
          }

        }else{
          Notification.error(data.message);
        }
      },function(reason){
        vm.errorMsg=reason.data.message;
        Notification.error(reason.data.message);
      });

    };


    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  }
})();
