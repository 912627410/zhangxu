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

    function updateTotalDispatchController($rootScope, $scope, Notification, $uibModalInstance, $uibModal, serviceResource, totalDispatch,
                                           MINEMNG_WORKFACE_LIST, MINEMNG_DUMP_FIELD_LIST, MINEMNG_WORK_SHIFT_LIST, MINEMNG_TOTAL_DISPATCH) {
      var vm = this;
      vm.userInfo = $rootScope.userInfo;
      vm.totalDispatch = totalDispatch;

      /**
       * 加载作业面列表
       */
      vm.getWorkfaceList = function () {
        var rspDate = serviceResource.restCallService(MINEMNG_WORKFACE_LIST, "QUERY");
        rspDate.then(function (data) {
          vm.workfaceList = data;
        },function (reason) {
          Notification.error(reason.data);
        })
      };
      vm.getWorkfaceList();

      /**
       * 加载排土场列表
       */
      vm.getDumpFieldList = function () {
        var rspDate = serviceResource.restCallService(MINEMNG_DUMP_FIELD_LIST, "QUERY");
        rspDate.then(function (data) {
          vm.dumpFieldList = data;
        },function (reason) {
          Notification.error(reason.data);
        })
      };
      vm.getDumpFieldList();


      vm.ok = function () {
        if(vm.totalDispatch.workface == null || vm.totalDispatch.workface === "") {
          Notification.warning("请选择工作面");
          return;
        }
        if(vm.totalDispatch.dumpField == null || vm.totalDispatch.dumpField === "") {
          Notification.warning("请选择排土场");
          return;
        }
        var restPromise = serviceResource.restUpdateRequest(MINEMNG_TOTAL_DISPATCH, vm.totalDispatch);
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
