
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('simMngController', simMngController);

  /** @ngInject */
  function simMngController($rootScope,$scope,$timeout,$uibModal,NgTableParams, ngTableDefaults,Notification,simService,serviceResource,DEFAULT_SIZE_PER_PAGE,SIM_STATUS_URL,SIM_URL, SIM_PAGE_URL) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    //初始化查询参数
    vm.sim={
      "phoneNumber":"",
      "deviceinfo":{},

    };

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];


    //vm.query = function(page,size,sort,queryPhoneNumber){
    //
    //  var restCallURL = SIM_PAGE_URL;
    //  var pageUrl = page || 0;
    //  var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
    //  var sortUrl = sort || "id,desc";
    //  restCallURL += "?page=" + pageUrl  + '&size=' + sizeUrl + '&sort=' + sortUrl;
    //  if (queryPhoneNumber){
    //    restCallURL += "&search_LIKE_phoneNumber="+queryPhoneNumber;
    //  }
    //
    //    var rspData = serviceResource.restCallService(restCallURL,"GET");
    //    rspData.then(function(data){
    //
    //      vm.simList = data.content;
    //      vm.page = data.page;
    //      vm.pageNumber = data.page.number + 1;
    //    },function(reason){
    //      vm.macheineList = null;
    //      Notification.error("获取SIM数据失败");
    //    });
    //};
    //
    //if (vm.operatorInfo.userdto.role == "ROLE_SYSADMIN" || vm.operatorInfo.userdto.role == "ROLE_ADMIN"){
    //  vm.query(0,10,null,null);
    //}

    //查询条件相关
    vm.showOrgTree = false;
    vm.openOrgTree = function () {
      vm.showOrgTree = !vm.showOrgTree;
    }

    $scope.$on('OrgSelectedEvent', function (event, data) {
      vm.selectedOrg = data;
      vm.sim.deviceinfo.org = vm.selectedOrg;
      vm.showOrgTree = false;
    })


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

    //查询sim卡的状态集合
    var simStatusData = serviceResource.restCallService(SIM_STATUS_URL, "QUERY");
    simStatusData.then(function (data) {
      vm.sim.simStatusList = data;
    }, function (reason) {
      Notification.error('获取SIM卡状态集合失败');
    })



    vm.query=function(page,size,sort,queryPhoneNumber){
       var rspData=simService.queryPage(page,size,sort,queryPhoneNumber);
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
    if (vm.operatorInfo.userdto.role == "ROLE_SYSADMIN" || vm.operatorInfo.userdto.role == "ROLE_ADMIN"){
      vm.query();
    }

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

    //更新SIM卡
    //vm.updateSim = function (id,size) {
    //  var singleUrl = SIM_URL + "?id=" + id;
    //  var promis = serviceResource.restCallService(singleUrl, "GET");
    //  promis.then(function (data) {
    //    var modalInstance = $uibModal.open({
    //      animation: vm.animationsEnabled,
    //      templateUrl: 'app/components/simManagement/updateSim.html',
    //      controller: 'updateSimController as updateSimController',
    //      size: size,
    //      backdrop: false,
    //      resolve: {
    //        sim: function () {
    //          return data.content;
    //        }
    //      }
    //    });
    //    modalInstance.result.then(function (selectedItem) {
    //      vm.query();
    //    }, function () {
    //    });
    //
    //  }, function (reason) {
    //    Notification.error('获取SIM卡信息失败');
    //  });
    //};

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
        //modalInstance.result.then(function (selectedItem) {
        ////  vm.query();
        //}, function () {
        //});

      modalInstance.result.then(function(result) {
        console.log('client: resolved: ' + result);
        abc=angular.copy(sourceSim);

    //    $scope.$apply(abc);

        abc.phoneNumber=2;
        console.log(abc);

        //vm.tableParams.data.push(abc);//刷新的内容





        //$timeout(function() {
        //  abc=angular.copy(sourceSim);
        //});


      }, function(reason) {
        //console.log('client: rejected: ' + reason);
        //console.log("aaa  ==");
        //console.log(sourceSim);
        // abc=sourceSim;
        //console.log(abc);
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
  }
})();
