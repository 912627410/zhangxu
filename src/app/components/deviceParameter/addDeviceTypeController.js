/**
 * Created by bo on 16/4/2.
 */
(function () {
    'use strict';
    angular.module('GPSCloud')
        .controller('addDeviceTypeController', addDeviceTypeCtrl);
    function addDeviceTypeCtrl($rootScope, $uibModalInstance, serviceResource, DEVCE_DEVICETYPE) {
        var vm = this;
        vm.operatorInfo = $rootScope.userInfo;
        vm.ok = function (newDeivceType) {
            var newDeivceTypes = new Array();
            newDeivceType.status = 1;  //dafault value
            newDeivceTypes.push(newDeivceType);
            serviceResource.addConfigInfo(vm.operatorInfo,newDeivceTypes,DEVCE_DEVICETYPE,function(rspData){
                serviceResource.handleRsp("新建设备类型出错",rspData);
            });
            $uibModalInstance.close();
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
})();
