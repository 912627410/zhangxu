/**
 * Created by riqian.ma on 1/8/17.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newRentalOrderController', newRentalOrderController);

  /** @ngInject */
  function newRentalOrderController($rootScope,$scope,$http,$confirm,$uibModal,$location,treeFactory,serviceResource,RENTAL_CUSTOMER_URL, Notification) {
    var vm = this;
    var path="/rental/order";
    vm.operatorInfo =$rootScope.userInfo;
    vm.cancel = function () {
      $location.path(path);

    };

    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.org =selectedItem;
      });
    }



    vm.ok = function () {
      var rspdata = serviceResource.restAddRequest(RENTAL_CUSTOMER_URL,vm.rentalCustomer);
      vm.rentalCustomer.org=vm.org;
      rspdata.then(function (data) {
        Notification.success("新建客户成功!");
        $location.path(path);

      },function (reason) {
        Notification.error(reason.data.message);
      })
    }


    //新建角色
    vm.selectCustomer = function (size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/rentalPlatform/fleetMng/rentalCustomerListMng.html',
        controller: 'customerListController as customerListController',
        size: size,
        backdrop: false,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          }
        }
      });

      modalInstance.result.then(function (result) {
        vm.customer=result;
        console.log(vm.customer);
      }, function () {
      });
    };

  }
})();
