/**
 * Created by mengwei on 17-9-28.
 */
/**
 * Created by riqian.ma on 1/8/17.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newOrderMoveMachineController', newOrderMoveMachineController);

  /** @ngInject */
  function newOrderMoveMachineController($rootScope,$window,$scope,NgTableParams,$uibModalInstance,serviceResource,Notification,machineOption,machineType,RENTANL_UNUSED_MACHINE_PAGE_URL,DEFAULT_SIZE_PER_PAGE) {
    var vm = this
    vm.machineType = machineType;
    vm.machineOption = machineOption;

    vm.userInfo =$rootScope.userInfo;

    vm.queryMachine = function (machineOption,machineType,page,size,sort) {
      var restCallURL = RENTANL_UNUSED_MACHINE_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      restCallURL += "&orgId=" + vm.userInfo.userdto.organizationDto.id;
      if (null != machineType) {
        if (null != machineType && machineType != "") {
          restCallURL += "&machineType=" + machineType;
        }
      }
      if (null != machineOption) {
        if (null != machineOption.heightTypeId&&machineOption.heightTypeId!="") {
          restCallURL += "&heightTypeId=" + machineOption.heightTypeId;
        }
        if (null != machineOption.factoryId&&machineOption.factoryId!="") {
          restCallURL += "&factoryId=" + machineOption.factoryId;
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
        Notification.error("获取车辆数据失败");
      });

    }
    vm.queryMachine(vm.machineOption,vm.machineType,null,null,null);

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };




  }
})();
