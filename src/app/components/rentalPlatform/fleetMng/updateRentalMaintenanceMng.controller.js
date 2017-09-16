/**
 * Created by riqian.ma on 1/8/17.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateRentalMaintenanceController', updateRentalMaintenanceController);

  /** @ngInject */
  function updateRentalMaintenanceController($rootScope,$scope,$http,$confirm,$location,$stateParams,NgTableParams,ngTableDefaults,rentalService,treeFactory,serviceResource,RENTAL_MAINTENANCE_URL, Notification) {
    var vm = this;
    var path="/rental/maintenance";
    vm.operatorInfo =$rootScope.userInfo;

   // ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    vm.cancel = function () {
      $location.path(path);

    };


    var listStatusPromise = rentalService.getMaintenanceListStatusList();
    listStatusPromise.then(function (data) {
      vm.listStatusList= data;

    }, function (reason) {
      Notification.error('获取状态集合失败');
    })

    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.org =selectedItem;
      });
    }


    //查询要修改的客户信息
    vm.getMaintenance=function(){
      var id=$stateParams.id;
      var url=RENTAL_MAINTENANCE_URL+"?id="+id;
      var rspdata = serviceResource.restCallService(url,"GET");

      rspdata.then(function (data) {
        vm.maintenance=data.content;

        //处理list
        for(var i=0;i<vm.maintenance.maintenanceListVo.length;i++){
          vm.maintenance.maintenanceListVo[i].status={value:vm.maintenance.maintenanceListVo[i].status.toString(),desc:vm.maintenance.maintenanceListVo[i].statusDesc};
        }


        //构造list
        vm.tableParams = new NgTableParams({

        }, {
          dataset: vm.maintenance.maintenanceListVo
        });

      },function (reason) {
        Notification.error(reason.data.message);
      })

    }

    vm.getMaintenance();


    vm.ok = function () {
      vm.maintenance.machine.deviceinfo=null;
      vm.maintenance.maintenanceListVo=vm.tableParams.data;

      if (null != vm.status) {
        vm.maintenance.status= vm.status.value;
      }

      for(var i=0;i<vm.maintenance.maintenanceListVo.length;i++){
        vm.maintenance.maintenanceListVo[i].status=vm.maintenance.maintenanceListVo[i].status.value;
        vm.maintenance.maintenanceListVo[i].machineMaintenance.machine=null;
      }

      var rspdata = serviceResource.restUpdateRequest(RENTAL_MAINTENANCE_URL,vm.maintenance);
      rspdata.then(function (data) {
        Notification.success("新建客户成功!");
        $location.path(path);

      },function (reason) {
        Notification.error(reason.data.message);
      })
    }

  }
})();
