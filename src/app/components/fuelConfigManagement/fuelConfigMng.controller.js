
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('fuelConfigMngController', fuelConfigMngController);

  /** @ngInject */
  function fuelConfigMngController($rootScope,$scope,$filter,$timeout,$uibModal,treeFactory,NgTableParams, ngTableDefaults,Notification,FUEL_CONFIG_PAGE_URL,serviceResource,DEFAULT_SIZE_PER_PAGE,SIM_STATUS_URL,SIM_URL, SIM_PAGE_URL) {

    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.org = {label: ""};


    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

//重置查询框
    vm.reset = function () {
      vm.fuelConfig = null;
      vm.org=null;
    }


    vm.query=function(page,size,sort,fuelConfig){
      var restCallURL = FUEL_CONFIG_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != fuelConfig) {

        if (null != fuelConfig.name&&fuelConfig.name!="") {
          restCallURL += "&search_LIKE_name=" + $filter('uppercase')(fuelConfig.name);
        }


      }

      if (null != vm.org&&null != vm.org.id) {
        restCallURL += "&search_EQ_orgEntity.id=" + vm.org.id;
      }

      var rspData = serviceResource.restCallService(restCallURL, "GET");
       rspData.then(function(data){
         vm.simList = data.content;

         vm.tableParams = new NgTableParams({},
           {
           dataset: data.content
         });
         vm.page = data.page;
         vm.pageNumber = data.page.number + 1;
       },function(reason){
         vm.macheineList = null;
         Notification.error("获取SIM数据失败");
       });
     }

    vm.query();

    vm.newFuelConfig = function (size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/fuelConfigManagement/newFuelConfig.html',
        controller: 'newFuelConfigController as newFuelConfigController',
        size: size,
        backdrop:false,
        scope:$scope,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          }
        }
      });

      modalInstance.result.then(function (result) {
        //console.log(result);
        vm.tableParams.data.splice(0, 0, result);
        vm.page.totalElements += 1;
      }, function () {
        //取消
      });
    };



    vm.updateFuelConfig = function (abc,size) {
      var sourceSim = angular.copy(abc); //深度copy

        var modalInstance = $uibModal.open({
          animation: vm.animationsEnabled,
          templateUrl: 'app/components/fuelConfigManagement/updateFuelConfig.html',
          controller: 'updateFuelConfigController as updateFuelConfigController',
          size: size,
          backdrop: false,
          scope:$scope,
          resolve: {
            fuelConfig: function () {
              return abc;
            }
          }
        });

      modalInstance.result.then(function(result) {

        var tabList=vm.tableParams.data;
        //更新内容
        for(var i=0;i<tabList.length;i++){
          if(tabList[i].id==result.id){
            tabList[i]=result;
          }
        }

      }, function(reason) {

      });


    };



    //组织树的显示
    vm.openTreeInfo= function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.org =selectedItem;
      });
    }

  }
})();
