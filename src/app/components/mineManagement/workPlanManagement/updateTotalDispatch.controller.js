/**
 *
 * @author syLong
 * @create 2018-01-02 15:07
 * @email  yalong.shang@nvr-china.com
 * @description
 */
(function () {
    'use strict';

    angular
        .module('GPSCloud')
        .controller('updateTotalDispatchController', updateTotalDispatchController);

    function updateTotalDispatchController($rootScope, $scope, Notification, $uibModalInstance, $uibModal, serviceResource, totalDispatch, minemngResource, MINEMNG_TOTAL_DISPATCH) {
      var vm = this;
      vm.userInfo = $rootScope.userInfo;
      vm.oldTotalDispatch = angular.copy(totalDispatch);
      vm.workFace = totalDispatch.workFace;
      vm.dumpField = totalDispatch.dumpField;

      if(getZeroDate() < totalDispatch.effectiveDate) {
        vm.okDesc = "确定";
      } else {
        vm.okDesc = "发布";
      }

      /**
       * 加载作业面列表
       */
      var workFaceListPromise = minemngResource.getWorkFaceList();
      workFaceListPromise.then(function (data) {
        vm.workFaceList = data;
      }, function (reason) {
        Notification.error(reason.data);
      });

      /**
       * 加载排土场列表
       */
      var dumpFieldListPromise = minemngResource.getDumpFieldList();
      dumpFieldListPromise.then(function (data) {
        vm.dumpFieldList = data;
      }, function (reason) {
        Notification.error(reason.data);
      });


      vm.ok = function () {
        if(vm.workFace === vm.oldTotalDispatch.workFace && vm.oldTotalDispatch.dumpField === vm.dumpField) {
          Notification.warning("内容没有变化");
          return;
        }
        var updateTotalDispatch = {
          totalDispatchList: [totalDispatch],
          workFace: vm.workFace,
          dumpField: vm.dumpField
        };
        var restPromise = serviceResource.restUpdateRequest(MINEMNG_TOTAL_DISPATCH, updateTotalDispatch);
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
