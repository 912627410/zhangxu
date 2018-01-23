/**
 *
 *@author weihua
 *@create 2018-01-19 16:22
 *@email hua.wei@nvrchina.com.cn
 *@description
 */
(function () {
    'use strict';

    angular
        .module('GPSCloud')
        .controller('minemngUpdateWorkFaceController', minemngUpdateWorkFaceController);

    function minemngUpdateWorkFaceController($scope, $uibModalInstance,MINEMNG_UPDAT_WORKFACE ,workFace, serviceResource ,Notification) {
      var vm =this;
      vm.operatorInfo = $scope.userInfo;
      vm.workFace= angular.copy(workFace);

      /**
       * 确定
       */
      vm.ok=function () {
        if(vm.workFace == null || vm.workFace === 'undefined' || vm.workFace === '') {
          Notification.warning("请录入信息");
          return;
        }
        if(vm.workFace.name == null || vm.workFace.name === 'undefined' || vm.workFace.name === '') {
          Notification.warning("请录入作业面名称");
          return;
        }
        if(vm.workFace.altitude== null || vm.workFace.altitude === 'undefined' || vm.workFace.altitude=== '') {
          Notification.warning("请录入海拔高度");
          return;
        }
        var restPromise =serviceResource.restUpdateRequest(MINEMNG_UPDAT_WORKFACE,vm.workFace);
        restPromise.then(function (data) {
          if(data.code==0){
            Notification.success("修改成功!");
            $uibModalInstance.close(data.content);
          }else{
            Notification.error(data.message);
          }

        },function (reason) {
          Notification.error(reason.data);
        });

      };

      /**
       * 取消
       */
      vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
      };

    }
})();
