/**
 * Created by riqian.ma on 1/8/17.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateRentalCustomerController', updateRentalCustomerController);

  /** @ngInject */
  function updateRentalCustomerController($rootScope,$scope,$http,$confirm,$location,$stateParams,treeFactory,serviceResource,RENTAL_CUSTOMER_URL, Notification,languages) {
    var vm = this;
    var path="/rental/customer";
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

    vm.getCustomer();


    vm.ok = function () {
      var rspdata = serviceResource.restUpdateRequest(RENTAL_CUSTOMER_URL,vm.rentalCustomer);
      vm.rentalCustomer.org=vm.org;
      rspdata.then(function (data) {
        Notification.success(languages.findKey('MoCuInSuc'));
        $location.path(path);

      },function (reason) {
        Notification.error(reason.data.message);
      })
    }

  }
})();
