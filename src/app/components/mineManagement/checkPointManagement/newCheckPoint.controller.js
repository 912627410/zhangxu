/**
 *
 * @author syLong
 * @create 2017-12-28 8:27
 * @email  yalong.shang@nvr-china.com
 * @description
 */
(function () {
    'use strict';

    angular
        .module('GPSCloud')
        .controller('newCheckPointController', newCheckPointController);

    function newCheckPointController($rootScope, $scope, Notification, $uibModalInstance, $uibModal, serviceResource, operatorInfo, MINEMNG_CHECK_POINT) {
      var vm = this;
      vm.operatorInfo = operatorInfo;

      /**
       * 确定
       */
      vm.ok = function(){
        if(vm.newCheckPoint == null || vm.newCheckPoint === 'undefined' || vm.newCheckPoint === '') {
          Notification.warning("请录入信息");
          return;
        }
        if(vm.newCheckPoint.name == null || vm.newCheckPoint.name === '') {
          Notification.warning("请录入编号");
          return;
        }
        if(vm.newCheckPoint.longitudeNum == null || vm.newCheckPoint.longitudeNum === '') {
          Notification.warning("请录入经度");
          return;
        }
        if(vm.newCheckPoint.latitudeNum == null || vm.newCheckPoint.latitudeNum === '') {
          Notification.warning("请录入纬度");
          return;
        }
        if(vm.newCheckPoint.radius == null || vm.newCheckPoint.radius === '') {
          Notification.warning("请选择工作半径");
          return;
        }
        var restPromise = serviceResource.restAddRequest(MINEMNG_CHECK_POINT, vm.newCheckPoint);
        restPromise.then(function (data) {
          if(data.code === 0){
            Notification.success("新建Check Point成功!");
            $uibModalInstance.close(data.content);
          } else {
            Notification.error(data.message);
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
      }
    }

})();
