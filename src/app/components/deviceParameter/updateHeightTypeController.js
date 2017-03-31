/**
 * Created by bo on 16/4/2.
 */
(function () {
    'use strict';
    angular.module('GPSCloud')
        .controller('updateHeightTypeController', updateHeightTypeCtrl);
    function updateHeightTypeCtrl($rootScope, $uibModalInstance, serviceResource, deviceHeightType, Notification, DEVCE_HIGHTTYPE) {
        var vm = this;
        vm.operatorInfo = $rootScope.userInfo;
        vm.deviceHeightType = deviceHeightType;

        vm.ok = function (deviceHeightType) {
            var deviceHeightTypes = new Array();
            deviceHeightTypes.push(deviceHeightType);
            var rspData = serviceResource.restCallService(DEVCE_HIGHTTYPE, "UPDATE", deviceHeightTypes);
            rspData.then(function (data) {
                if (data.result != "Success") {
                    Notification.error('更新高度类型信息出错');
                }
                else {
                    Notification.success('更新高度类型信息成功');
                    $uibModalInstance.close();
                }
            }, function (reason) {
                Notification.error('更新高度类型信息出错');
            });
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
})();
