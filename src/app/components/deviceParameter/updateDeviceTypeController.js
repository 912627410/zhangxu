/**
 * Created by bo on 16/4/2.
 */
(function () {
    'use strict';
    angular.module('GPSCloud')
        .controller('updateDeviceTypeController', updateDeviceTypeCtrl);
    function updateDeviceTypeCtrl($rootScope, $uibModalInstance, serviceResource, deviceType, DEVCE_DEVICETYPE) {
        var vm = this;
        vm.operatorInfo = $rootScope.userInfo;
        vm.deviceType = deviceType;

        vm.ok = function (deviceType) {
            var deviceTypes = new Array();
            deviceTypes.push(deviceType);
            serviceResource.updateConfigInfo(vm.operatorInfo,deviceTypes,DEVCE_DEVICETYPE,function(rspData){
                serviceResource.handleRsp("更新设备类型信息出错",rspData);
            });
            $uibModalInstance.close();
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
})();
