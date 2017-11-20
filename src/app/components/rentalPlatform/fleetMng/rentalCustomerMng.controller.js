/**
 * Created by riqian.ma on 2017/7/29.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalCustomerMngController', rentalCustomerMngController);

  /** @ngInject */

  function rentalCustomerMngController($window, $uibModal,serviceResource,NgTableParams,ngTableDefaults,Notification,treeFactory,
                                       DEFAULT_SIZE_PER_PAGE,RENTAL_CUSTOMER_PAGE_URL,RENTAL_CUSTOMER_URL,languages) {
    var vm = this;

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];


    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.org =selectedItem;
      });
    }

    /**
     * 自适应高度函数
     * @param windowHeight
     */
    vm.adjustWindow = function (windowHeight) {
      var baseBoxContainerHeight = windowHeight - 50 - 15 - 90 - 15 - 7;//50 topBar的高,15间距,90msgBox高,15间距,8 预留
      //baseBox自适应高度
      vm.baseBoxContainer = {
        "min-height": baseBoxContainerHeight + "px"
      }
    }
    //初始化高度
    vm.adjustWindow($window.innerHeight);

    //分页查询客户信息
    vm.query = function (page, size, sort, customer) {
      var restCallURL = RENTAL_CUSTOMER_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
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
    };
    vm.query(null,null,null,null);


    //重置查询框
    vm.reset = function () {
      vm.customer = null;
      vm.org=null;
      vm.querySubOrg=false;
    }


    //修改客户信息
    vm.updateCustomer = function(customer){

      var customerUrl=RENTAL_CUSTOMER_URL+"?id="+ customer.id;
      var rspdata = serviceResource.restCallService(customerUrl,"GET");
      rspdata.then(function (data) {
        var rentalCustomer=data.content;

        var modalInstance= $uibModal.open({
        animation: true,
        templateUrl: 'app/components/rentalPlatform/fleetMng/updateRentalCustomerMng.html',
        controller: 'updateRentalCustomerController',
        controllerAs:'updateRentalCustomerCtrl',
        size: 'md',
        resolve: {
          rentalCustomer: function () {
            return rentalCustomer;
          }
        }
      });
        modalInstance.result.then(function (result) {
          var tabList=vm.tableParams.data;
          //更新内容
          for(var i=0;i<tabList.length;i++){
            if(tabList[i].id==result.id){
              tabList[i]=result;
            }
          }
        }, function () {
          //取消
        });
      })
    }

     /**
     * 跳转到查看页面
     * @param id
     */
    vm.view=function(id){
      var customerUrl=RENTAL_CUSTOMER_URL+"?id="+ id;
      var rspdata = serviceResource.restCallService(customerUrl,"GET");
      rspdata.then(function (data) {
        var rentalCustomer=data.content;
        var modalInstance = $uibModal.open({
          animation: true,
          backdrop: false,
          templateUrl: 'app/components/rentalPlatform/fleetMng/viewRentalCustomerMng.html',
          controller: 'viewRentalCustomerController',
          controllerAs:'viewRentalCustomerCtrl',
          size: 'md',
          resolve: {
            rentalCustomer: function () {
              return rentalCustomer;
            }

          }
        });
      }, function () {
        //取消
      });

    }

    //新建客户信息
    vm.new=function(){
      var modalInstance= $uibModal.open({
        animation: true,
        backdrop: false,
        templateUrl: 'app/components/rentalPlatform/fleetMng/newRentalCustomer.html',
        controller: 'newRentalCustomerController',
        controllerAs:'newRentalCustomerCtrl',
        size: 'md'
      });
      modalInstance.result.then(function (newCus) {
        vm.page.totalElements += 1;
        vm.tableParams.data.splice(0, 0, newCus);
      }, function () {
        //取消
      });

    }

  }
})();
