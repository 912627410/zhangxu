/**
 * Created by riqian.ma on 2017/7/29.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalCustomerMngController', rentalCustomerMngController);

  /** @ngInject */
  function rentalCustomerMngController($scope, $window, $location,$state,$filter, $anchorScroll, serviceResource,NgTableParams,ngTableDefaults,Notification,permissions,treeFactory,DEFAULT_SIZE_PER_PAGE,RENTAL_CUSTOMER_PAGE_URL) {
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


    vm.query = function (page, size, sort, customer) {
      console.log("111222");
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
        Notification.error("获取客户数据失败");
      });
    };


    vm.query(null,null,null,null);

    vm.validateOperPermission=function(){
      return permissions.getPermissions("machine:oper");
    }

    //重置查询框
    vm.reset = function () {
      vm.customer = null;
      vm.org=null;
      vm.querySubOrg=false;
    }

    /**
     * 跳转到更新页面
     * @param id
     */
    vm.update=function(id){
      $state.go('rental.updateCustomer', {id: id});
    }
 /**
     * 跳转到查看页面
     * @param id
     */
    vm.view=function(id){
      $state.go('rental.viewCustomer', {id: id});
    }


    vm.new=function(){
      $state.go('rental.newCustomer');
    }


  }
})();
