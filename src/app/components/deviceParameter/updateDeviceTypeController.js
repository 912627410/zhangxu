/**
 * Created by bo on 16/4/2.
 */
(function () {
    'use strict';
    angular.module('GPSCloud')
        .controller('updateDeviceTypeController', updateDeviceTypeCtrl);
    function updateDeviceTypeCtrl($rootScope, $uibModalInstance, serviceResource, deviceType, Notification, DEVCE_DEVICETYPE) {
        var vm = this;
        vm.operatorInfo = $rootScope.userInfo;
        vm.deviceType = deviceType;

        vm.ok = function (deviceType) {
            var deviceTypes = new Array();
            deviceTypes.push(deviceType);
            var rspData = serviceResource.restCallService(DEVCE_DEVICETYPE, "UPDATE", deviceTypes);
            rspData.then(function (data) {
                if (data.content != "success") {
                    Notification.error('更新设备类型信息出错');
                }
                else {
                    Notification.success('更新设备类型信息成功');
                    $uibModalInstance.close();
                }
            }, function (reason) {
                Notification.error('更新设备类型信息出错');
            });
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
})();
