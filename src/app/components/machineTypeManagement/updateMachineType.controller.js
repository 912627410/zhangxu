/**
 * @author songyutao
 * @create 2017-07-04
 * @email yutao.song@nvr-china.com
 * @describe 车辆类型管理页面的修改车辆类型模态框JS
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateMachineTypeController', updateMachineTypeController);

  /** @ngInject */
  function updateMachineTypeController($scope, $uibModalInstance, serviceResource,MACHINE_TYPE_URL, Notification,machineTypeInfo) {
    var vm = this;
    vm.operatorInfo = $scope.userInfo;

    vm.machineTypeInfo = machineTypeInfo;

    vm.ok = function (machineTypeInfo) {

      if(!machineTypeInfo.typeName){
        Notification.warning("请输入车辆类型");
        return;
      }
      var restPromise = serviceResource.restCallService(MACHINE_TYPE_URL,"UPDATE",machineTypeInfo);
      restPromise.then(function (data) {
          if(data.code===0){
            Notification.success("修改车辆类型信息成功!");
            $uibModalInstance.close(data.content);
          }else{
            vm.machineTypeInfo = machineTypeInfo;
            Notification.error(data.message);
          }
        }, function (reason) {
          vm.errorMsg=reason.data.message;
          Notification.error(reason.data.message);
        }

      );
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  }
})();
