/**
 *
 * @author syLong
 * @create 2018-01-12 20:12
 * @email  yalong.shang@nvr-china.com
 * @description
 */
(function () {
    'use strict';

    angular
        .module('GPSCloud')
        .controller('batchUpdateTotalDispatchController', batchUpdateTotalDispatchController);

    function batchUpdateTotalDispatchController($rootScope, $scope, Notification, $uibModalInstance, $uibModal, serviceResource,minemngResource, totalDispatchList, MINEMNG_TOTAL_DISPATCH) {
      var vm = this;
      vm.userInfo = $rootScope.userInfo;
      vm.totalDispatchList = totalDispatchList;

      if(vm.totalDispatchList.length > 0) {
        if(getZeroDate() < vm.totalDispatchList[0].effectiveDate) {
          vm.okDesc = "确定";
        } else {
          vm.okDesc = "发布";
        }
      }


      /**
       * 获取工作面集合
       */
      var workFaceListPromise = minemngResource.getWorkFaceList();
      workFaceListPromise.then(function (data) {
        vm.workFaceList = data;
      }, function (reason) {
        Notification.error(reason.data);
      });

      /**
       * 获取排土场集合
       */
      var dumpFieldListPromise = minemngResource.getDumpFieldList();
      dumpFieldListPromise.then(function (data) {
        vm.dumpFieldList = data;
      }, function (reason) {
        Notification.error(reason.data);
      });

      vm.ok = function () {
        if(vm.totalDispatchList.length <= 0) {
          Notification.warning("请选择需要修改的记录");
          return;
        }
        if(vm.workFace == null || vm.workFace === "") {
          Notification.warning("请选择工作面");
          return;
        }
        if(vm.dumpField == null || vm.dumpField === "") {
          Notification.warning("请选择排土场");
          return;
        }
        var updateTotalDispatch = {
          totalDispatchList: vm.totalDispatchList,
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
