/**
 * Created by bo on 16/4/2.
 */
(function () {
    'use strict';
    angular.module('GPSCloud')
        .controller('updatePowerTypeController', updatePowerTypeCtrl);
    function updatePowerTypeCtrl($rootScope, $uibModalInstance, serviceResource, devicePowerType, DEVCE_POWERTYPE) {
        var vm = this;
        vm.operatorInfo = $rootScope.userInfo;
        vm.devicePowerType = devicePowerType;

        vm.ok = function (devicePowerType) {
            var devicePowerTypes = new Array();
            devicePowerTypes.push(devicePowerType);
            serviceResource.updateConfigInfo(vm.operatorInfo,devicePowerTypes,DEVCE_POWERTYPE,function(rspData){
                serviceResource.handleRsp("更新驱动类型出错",rspData);
            });
            $uibModalInstance.close();
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
})();
