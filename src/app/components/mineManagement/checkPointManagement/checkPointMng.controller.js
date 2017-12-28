/**
 *
 * @author syLong
 * @create 2017-12-27 22:08
 * @email  yalong.shang@nvr-china.com
 * @description
 */
(function () {
    'use strict';

    angular
        .module('GPSCloud')
        .controller('checkPointMngController', checkPointMngController);
    function checkPointMngController($rootScope, $scope, Notification, $uibModal, serviceResource, MINEMNG_CHECK_POINT) {
      var vm = this;
      vm.userInfo = $rootScope.userInfo;

      /**
       * 加载check point列表
       */
      vm.query = function () {
        var rspURL = MINEMNG_CHECK_POINT;
        var filter = "";
        if(vm.queryName != null && vm.queryName !== "") {
          filter = "?name=" + vm.queryName;
        }
        if(vm.queryRadius != null && vm.queryRadius !== "") {
          if(filter !== "") {
            filter += "&radius=" + vm.queryRadius;
          } else {
            filter = "?radius=" + vm.queryRadius;
          }
        }
        if(filter !== "") {
          rspURL += filter;
        }

        var rspData = serviceResource.restCallService(rspURL, "QUERY");
        rspData.then(function(data){
          if(data.length <= 0){
            Notification.warning("没有check point数据");
            vm.checkPointList = null;
          } else {
            vm.checkPointList = data;
          }
        },function(reason){
          Notification.error(reason.data);
        });
      };
      vm.query();

      /**
       * 新增
       */
      vm.addCheckPoint = function(size) {
        var modalInstance = $uibModal.open({
          animation: vm.animationsEnabled,
          templateUrl: 'app/components/mineManagement/checkPointManagement/newCheckPoint.html',
          controller: 'newCheckPointController as newCheckPointCtrl',
          size: size,
          backdrop:false,
          scope:$scope,
          resolve: {
            operatorInfo: function () {
              return vm.userInfo;
            }
          }
        });
        modalInstance.result.then(function (result) {
          vm.checkPointList.unshift(result);
        }, function () {
          //取消
        });
      };

      /**
       * 重置查询框
       */
      vm.reset = function () {
        vm.queryName = null;
        vm.queryRadius = null;
      };

    }
})();
