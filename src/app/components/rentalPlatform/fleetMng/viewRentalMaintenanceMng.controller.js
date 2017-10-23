/**
 * Created by riqian.ma on 1/8/17.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('viewRentalMaintenanceController', viewRentalMaintenanceController);

  /** @ngInject */
  function viewRentalMaintenanceController($rootScope,$scope,$http,$confirm,$location,$stateParams,NgTableParams,ngTableDefaults,rentalService,treeFactory,serviceResource,RENTAL_MAINTENANCE_URL, Notification,languages) {
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
      Notification.error(languages.findKey('faGetState'));
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


  }
})();
