/**
 * Created by riqian.ma on 1/8/17.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newRentalCustomerController', newRentalCustomerController);

  /** @ngInject */
  function newRentalCustomerController($rootScope,$uibModalInstance,treeFactory,serviceResource,RENTAL_CUSTOMER_URL, Notification,languages) {
    var vm = this;
    var path="/rental/customer";
    vm.operatorInfo =$rootScope.userInfo;


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

        Notification.success(languages.findKey('newCuS'));
        $uibModalInstance.close(data.content);

      },function (reason) {
        Notification.error(reason.data.message);
      })
    }

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  }
})();
