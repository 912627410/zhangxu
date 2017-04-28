
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('simMngController', simMngController);

  /** @ngInject */
  function simMngController($rootScope,$scope,$timeout,$uibModal,treeFactory,NgTableParams, ngTableDefaults,Notification,simService,serviceResource,
                            SIM_PROVIDER_URL,DEFAULT_SIZE_PER_PAGE,SIM_URL, SIM_PAGE_URL) {

    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    //初始化查询参数
    vm.sim={
      "phoneNumber":"",
      "deviceinfo":{},
      "provider":"",
    //  "org":{},


    };

    // vm.initQueryCondition=function(){
    //   vm.sim={
    //     "phoneNumber":"",
    //     "deviceinfo":{},
    //
    //   };
    // }
    //
    // vm.initQueryCondition();

    //查询sim卡的供应商集合
    var simProviderData = serviceResource.restCallService(SIM_PROVIDER_URL, "QUERY");
    simProviderData.then(function (data) {
      vm.sim.simProviderList = data;
    }, function (reason) {
      Notification.error('获取SIM卡供应商集合失败');
    })


    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    //日期控件相关
    //date picker
    vm.activeTimeStartOpenStatus = {
      opened: false
    };

    vm.activeTimeStartOpen = function ($event) {
      vm.activeTimeStartOpenStatus.opened = true;
    };

    vm.activeTimeEndOpenStatus = {
      opened: false
    };

    vm.activeTimeEndOpen = function ($event) {
      vm.activeTimeEndOpenStatus.opened = true;
    };


    var date = new Date();
    date.setDate(date.getDate()-30);  //默认查询最近一个月的异常数据
    vm.sim.activeTimeStart=date;
    vm.sim.activeTimeEnd=new Date();




    vm.query=function(page,size,sort,sim){
       var rspData=simService.queryPage(page,size,sort,sim,vm.org);
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

    vm.newSim = function (size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/simManagement/newSim.html',
        controller: 'newSimController as newSimController',
        size: size,
        backdrop:false,
        scope:$scope,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          }
        }
      });

      modalInstance.result.then(function () {
        vm.query();
      }, function () {
        //取消
      });
    };

    vm.reset = function () {
      vm.sim.phoneNumber="";
      vm.sim.serialNumber="";
      vm.sim.provider="";

      vm.org = null;
    }


    vm.updateSim = function (abc,size) {
      var sourceSim = angular.copy(abc); //深度copy

        var modalInstance = $uibModal.open({
          animation: vm.animationsEnabled,
          templateUrl: 'app/components/simManagement/updateSim.html',
          controller: 'updateSimController as updateSimController',
          size: size,
          backdrop: false,
          scope:$scope,
          resolve: {
            sim: function () {
              return abc;
            }
          }
        });


      modalInstance.result.then(function(result) {
       console.log("111");
        var tabList=vm.tableParams.data;
        //恢复列表中的值
        for(var i=0;i<tabList.length;i++){
          if(tabList[i].id==result.id){
            tabList[i]=result;
          }
        }


      }, function(reason) {

        //恢复列表中的值
        for(var i=0;i<vm.tableParams.data.length;i++){
          if(vm.tableParams.data[i].id==sourceSim.id){
            vm.tableParams.data[i]=sourceSim;
          }

        }
      });

    };

    //批量导入
    vm.uploadSim = function (size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/simManagement/uploadSim.html',
        controller: 'uploadSimController as uploadSimController',
        size: size,
        backdrop:false,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          }
        }
      });

      modalInstance.result.then(function () {
        //正常返回
      }, function () {
        //取消
      });
    };


    //组织树的显示
    vm.openTreeInfo= function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.org =selectedItem;
      });
    }

    vm.currentSim = function (sim, size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/simManagement/currentSim.html',
        controller: 'currentSimController as currentSimController',
        size: size,
        backdrop:false,
        resolve: {
          sim: function () {
            return sim;
          }
        }
      });

      modalInstance.result.then(function () {
        //正常返回
      }, function () {
        //取消
      });
    };

  }
})();
