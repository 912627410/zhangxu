/**
 * Created by bo on 16/4/2.
 */
(function () {
    'use strict';
    angular.module('GPSCloud')
        .controller('updateMFController', updateMFCtrl);
    function updateMFCtrl($rootScope, $uibModalInstance, serviceResource, deviceMF, Notification, DEVCE_MF) {
        var vm = this;
        vm.operatorInfo = $rootScope.userInfo;
        vm.deviceMF = deviceMF;

        vm.ok = function (deviceMF) {
            var updatedMFs = new Array();
            updatedMFs.push(deviceMF);
            var rspData = serviceResource.restCallService(DEVCE_MF, "UPDATE", updatedMFs);
            rspData.then(function (data) {
                if (data.result != "Success") {
                    Notification.error('更新生产厂家信息出错');
                }
                else {
                    Notification.success('更新生产厂家信息成功');
                    $uibModalInstance.close();
                }
            }, function (reason) {
                Notification.error('更新生产厂家信息出错');
            });
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
})();
