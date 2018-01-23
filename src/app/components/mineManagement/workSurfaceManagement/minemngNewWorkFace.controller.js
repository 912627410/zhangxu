/**
 *增加作业面
 *@author weihua
 *@create 2018-01-19 16:19
 *@email hua.wei@nvrchina.com.cn
 *@description
 */
(function () {
    'use strict';

    angular
        .module('GPSCloud')
        .controller('minemngNewWorkFaceController', minemngNewWorkFaceController);

    function minemngNewWorkFaceController($scope,$uibModalInstance ,Notification ,serviceResource, MINEMNG_WORKFACE) {
      var vm = this;
      vm.operatorInfo = $scope.userInfo;

      /**
       * 确定
       */
      vm.ok=function () {
        if(vm.newWorkFace == null || vm.newWorkFace === 'undefined' || vm.newWorkFace === '') {
          Notification.warning("请录入信息");
          return;
        }
        if(vm.newWorkFace.name == null || vm.newWorkFace.name === 'undefined' || vm.newWorkFace.name === '') {
          Notification.warning("请录入作业面名称");
          return;
        }
        if(vm.newWorkFace.altitude== null || vm.newWorkFace.altitude === 'undefined' || vm.newWorkFace.altitude=== '') {
          Notification.warning("请录入海拔高度");
          return;
        }
        var restPromise =serviceResource.restAddRequest(MINEMNG_WORKFACE,vm.newWorkFace);
        restPromise.then(function (data) {
          if(data.code==0){
            Notification.success("增加成功!");
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
