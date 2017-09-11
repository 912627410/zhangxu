/**
 * Created by riqian.ma on 2017/7/29.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalOrgFenceMngController', rentalOrgFenceMngController);

  /** @ngInject */
  function rentalOrgFenceMngController($scope, $window,$state,$confirm, $location, $filter,$anchorScroll, serviceResource,NgTableParams,ngTableDefaults,treeFactory,Notification,permissions,rentalService,
                                       DEFAULT_SIZE_PER_PAGE,RENTAL_ORG_FENCE_PAGE_URL,RENTAL_ORG_FENCE_DELETE_STATUS) {
    var vm = this;

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    //定义偏移量
    $anchorScroll.yOffset = 50;
    //定义页面的喵点
    vm.anchorList = ["currentLocation", "currentState", "alarmInfo"];

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


    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.org =selectedItem;
      });
    }



    vm.query = function (page, size, sort, rentalOrgFence) {
      var restCallURL = RENTAL_ORG_FENCE_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != rentalOrgFence) {



        if (null != rentalOrgFence.status&&rentalOrgFence.status!="") {
          restCallURL += "&search_EQ_status=" + rentalOrgFence.status.value;
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
        }, {
          dataset: data.content
        });
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        vm.machineList = null;
        Notification.error("获取围栏数据失败");
      });
    };


    vm.query(null,null,null,null);

    vm.validateOperPermission=function(){
      return permissions.getPermissions("machine:oper");
    }

    vm.new=function(id){
      $state.go('rental.newOrgFence');
    }

    //重置查询框
    vm.reset = function () {
      vm.rentalOrgFence = null;
      vm.org=null;
      vm.id=null;
    }

    /**
     * 跳转到更新页面
     * @param id
     */
    vm.update=function(id){
      $state.go('rental.updateOrgFence', {id: id});
    }

    vm.view=function(id){
      $state.go('rental.viewOrgFence', {id: id});
    }

    vm.delete = function (id) {
      $confirm({text: '确定要删除吗?',title: '删除确认', ok: '确定', cancel: '取消'})
        .then(function() {
          var restPromise = serviceResource.restUpdateRequest(RENTAL_ORG_FENCE_DELETE_STATUS, id);
          restPromise.then(function (data) {
            Notification.success("删除成功!");
            vm.query(null, null, null, null);
          }, function (reason) {
            Notification.error("删除成功出错!");
          });
        });
    };


  }
})();
