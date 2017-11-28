/**
 * Created by riqina.ma on 16/5/24.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('customerListController', customerListController);

  /** @ngInject */

  function customerListController($scope, $uibModalInstance,$uibModal,NgTableParams,ngTableDefaults,DEFAULT_MINSIZE_PER_PAGE,treeFactory, serviceResource,RENTAL_CUSTOMER_PAGE_URL, Notification,languages) {
    var vm = this;
    vm.operatorInfo = $scope.userInfo;

    ngTableDefaults.params.count = DEFAULT_MINSIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    vm.query = function (page, size, sort, customer) {
      var restCallURL = RENTAL_CUSTOMER_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_MINSIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != customer) {

        if (null != customer.name&&customer.name!="") {
          restCallURL += "&search_LIKE_name=" + customer.name;
        }

        if (null != customer.mobile&&customer.mobile!="") {
          restCallURL += "&search_LIKE_mobile=" + customer.mobile;
        }
      }

      if (null != vm.org&&null != vm.org.id&&!vm.querySubOrg) {
        restCallURL += "&search_EQ_orgEntity.id=" + vm.org.id;
      }

      if(null != vm.org&&null != vm.org.id&&vm.querySubOrg){
        restCallURL += "&parentOrgId=" +vm.org.id;
      }

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
        //vm.customerList = data.content;

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
        Notification.error(languages.findKey('FaGetCu'));
      });
    }

    //重置查询框
    vm.reset = function () {
      vm.customer = null;
      vm.org=null;
      vm.querySubOrg=false;
    }


    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.org =selectedItem;
      });
    }

    //提交
    vm.ok = function () {
      $uibModalInstance.close(vm.selectRadio);
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
    vm.query();

    vm.addNewcustomer = function (){
      var modalInstance= $uibModal.open({
        animation: true,
        backdrop: false,
        templateUrl: 'app/components/rentalPlatform/fleetMng/newRentalCustomer.html',
        controller: 'newRentalCustomerController',
        controllerAs:'newRentalCustomerCtrl',
        size: 'lg'
      });
      modalInstance.result.then(function (newVal) {

        vm.tableParams.data.splice(0, 0, newVal);

      }, function () {
        //取消
      });
    }
  }
})();
