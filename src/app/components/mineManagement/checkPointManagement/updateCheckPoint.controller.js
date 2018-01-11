/**
 *
 * @author syLong
 * @create 2018-01-03 23:38
 * @email  yalong.shang@nvr-china.com
 * @description
 */
(function () {
    'use strict';

    angular
        .module('GPSCloud')
        .controller('updateCheckPointController', updateCheckPointController);

    function updateCheckPointController($rootScope, $scope, Notification, $uibModalInstance, $uibModal, serviceResource, checkPoint, MINEMNG_CHECK_POINT) {
      var vm = this;
      vm.userInfo = $rootScope.userInfo;
      vm.checkPoint = angular.copy(checkPoint);
      vm.checkPoint.radius = vm.checkPoint.radius + "";


      vm.ok = function () {
        if(vm.checkPoint == null || vm.checkPoint === "" || vm.checkPoint === "undefined") {
          Notification.warning("请录入信息");
          return;
        }
        if(vm.checkPoint.name == null || vm.checkPoint.name === "") {
          Notification.warning("请录入编号");
          return;
        }
        if(vm.checkPoint.longitudeNum == null || vm.checkPoint.longitudeNum === "") {
          Notification.warning("请录入经度");
          return;
        }
        if(vm.checkPoint.latitudeNum == null || vm.checkPoint.latitudeNum === "") {
          Notification.warning("请录入纬度");
          return;
        }
        if(vm.checkPoint.radius == null || vm.checkPoint.radius === "") {
          Notification.warning("请录入工作半径");
          return;
        }
        var restPromise = serviceResource.restUpdateRequest(MINEMNG_CHECK_POINT, vm.checkPoint);
        restPromise.then(function (data) {
          if(data.code === 0) {
            Notification.success(data.content);
            $uibModalInstance.close();
          } else{
            Notification.error(data.content);
          }
        }, function (reason) {
          Notification.error(reason.data);
        });
      };


      /**
       * 取消
       */
      vm.cancel = function(){
        $uibModalInstance.dismiss('cancel');
      };
    }
})();
