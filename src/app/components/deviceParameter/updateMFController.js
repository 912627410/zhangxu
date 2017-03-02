/**
 * Created by bo on 16/4/2.
 */
(function () {
    'use strict';
    angular.module('GPSCloud')
        .controller('updateMFController', updateMFCtrl);
    function updateMFCtrl($rootScope, $uibModalInstance, serviceResource, deviceMF, DEVCE_MF) {
        var vm = this;
        vm.operatorInfo = $rootScope.userInfo;
        vm.deviceMF = deviceMF;

        vm.ok = function (deviceMF) {
            var updatedMFs = new Array();
            updatedMFs.push(deviceMF);
            serviceResource.updateConfigInfo(vm.operatorInfo,updatedMFs,DEVCE_MF,function(rspData){
                serviceResource.handleRsp("更新生产厂家信息出错",rspData);
            });
            $uibModalInstance.close();
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
})();
