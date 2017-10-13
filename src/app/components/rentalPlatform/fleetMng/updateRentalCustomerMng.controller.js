/**
 * Created by riqian.ma on 1/8/17.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateRentalCustomerController', updateRentalCustomerController);

  /** @ngInject */
  function updateRentalCustomerController($rootScope,$uibModalInstance,treeFactory,serviceResource,RENTAL_CUSTOMER_URL, Notification,rentalCustomer) {
    var vm = this;
    vm.rentalCustomer = rentalCustomer
    vm.operatorInfo =$rootScope.userInfo;

    //取消修改
    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.org =selectedItem;
      });
    }

    //确认修改
    vm.ok = function () {
      var rspdata = serviceResource.restUpdateRequest(RENTAL_CUSTOMER_URL,vm.rentalCustomer);
      vm.rentalCustomer.org=vm.org;
      rspdata.then(function (data) {
        Notification.success("修改客户信息成功!");
        $uibModalInstance.close(data.content);

      },function (reason) {
        Notification.error(reason.data.message);
      })
    }

  }
})();
