/**
 * Created by riqian.ma on 1/8/17.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('viewRentalCustomerController', viewRentalCustomerController);

  /** @ngInject */
  function viewRentalCustomerController($rootScope,$stateParams,$uibModalInstance,treeFactory,serviceResource,RENTAL_CUSTOMER_URL, Notification,rentalCustomer) {
    var vm = this;
    var path="/rental/customer";
    vm.operatorInfo =$rootScope.userInfo;
    vm.rentalCustomer=rentalCustomer;
    vm.back = function () {
      $uibModalInstance.dismiss('cancel');

    };

    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.org =selectedItem;
      });
    }


    //查询要修改的客户信息
    vm.getCustomer=function(){
      var id=$stateParams.id;
      var url=RENTAL_CUSTOMER_URL+"?id="+id;
      var rspdata = serviceResource.restCallService(url,"GET");

      rspdata.then(function (data) {
        vm.rentalCustomer=data.content;
        vm.org=vm.rentalCustomer.org;
      },function (reason) {
        Notification.error(reason.data.message);
      })

    }

    //vm.getCustomer();


  }
})();
