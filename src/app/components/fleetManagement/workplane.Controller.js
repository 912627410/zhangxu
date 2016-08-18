/**
 * Created by develop on 7/21/16.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('workplaneMngController', workplaneMngController);

  /** @ngInject */
  function workplaneMngController($rootScope, $scope, $uibModal, $confirm,$filter,permissions, NgTableParams,treeFactory, ngTableDefaults, Notification, serviceResource, WORKPLANE_PAGE, WORKPLANE_URL) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    ngTableDefaults.params.count = 10;
    ngTableDefaults.settings.counts = [];

    vm.query = function (page, size, sort, workplane) {
      var restCallURL = WORKPLANE_PAGE;
      var pageUrl = page || 0;
      var sizeUrl = size || 10;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != workplane) {

        if (null != workplane.id&&workplane.id!="") {
          restCallURL += "&search_LIKE_id=" + $filter('uppercase')(workplane.id);
        }
        if (null != workplane.name&&workplane.name!="") {
          restCallURL += "&search_LIKE_name=" + $filter('uppercase')(workplane.name);
        }

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
        Notification.error("获取作业面数据失败");
      });
    };

    vm.query();

    //重置查询框
    vm.reset = function () {
      vm.workplane = null;
    }


    vm.newWorkplane = function (size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/fleetManagement/newWorkplane.html',
        controller: 'newWorkplaneController as newWorkplaneCtrl',
        size: size,
        backdrop: false,
      });

      modalInstance.result.then(function (result) {
        vm.tableParams.data.splice(0, 0, result);

      }, function () {
        //取消
      });
    };

    //更新
    vm.updateWorkplane = function (workplane, size) {
      var sourceWorkplane = angular.copy(workplane); //深度copy

      var singlUrl = WORKPLANE_URL + "?id=" + workplane.id;
      var deviceinfoPromis = serviceResource.restCallService(singlUrl, "GET");
      deviceinfoPromis.then(function (data) {
        var operWorkplane = data.content;
        var modalInstance = $uibModal.open({
          animation: vm.animationsEnabled,
          templateUrl: 'app/components/fleetManagement/updateWorkplane.html',
          controller: 'updateWorkplaneController as updateWorkplaneController',
          size: size,
          backdrop: false,
          resolve: {
            workplane: function () {
              return operWorkplane;
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


      }, function (reason) {
        Notification.error('获取作业面信息失败');
      });
    };


  }
})();
