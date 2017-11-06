/**
 * Created by bo on 16/4/2.
 */
(function () {
    'use strict';
    angular.module('GPSCloud')
        .controller('updatePowerTypeController', updatePowerTypeCtrl);
    function updatePowerTypeCtrl($rootScope, $uibModalInstance, serviceResource, devicePowerType, Notification, DEVCE_POWERTYPE) {
        var vm = this;
        vm.operatorInfo = $rootScope.userInfo;
        vm.devicePowerType = devicePowerType;

        vm.ok = function (devicePowerType) {
            var devicePowerTypes = new Array();
            devicePowerTypes.push(devicePowerType);
            var rspData = serviceResource.restCallService(DEVCE_POWERTYPE, "UPDATE", devicePowerTypes);
            rspData.then(function (data) {
                if (data.content != "success") {
                    Notification.error('更新驱动类型出错');
                }
                else {
                    Notification.success('更新驱动类型成功');
                    $uibModalInstance.close();
                }
            }, function (reason) {
                Notification.error('更新驱动类型出错');
            });
          };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
})();
