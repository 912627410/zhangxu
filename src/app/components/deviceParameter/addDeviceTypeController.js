/**
 * Created by bo on 16/4/2.
 */
(function () {
    'use strict';
    angular.module('GPSCloud')
        .controller('addDeviceTypeController', addDeviceTypeCtrl);
    function addDeviceTypeCtrl($rootScope, $uibModalInstance, serviceResource, Notification, DEVCE_DEVICETYPE) {
        var vm = this;
        vm.operatorInfo = $rootScope.userInfo;
        vm.ok = function (newDeivceType) {
            var newDeivceTypes = new Array();
            newDeivceType.status = 1;  //dafault value
            newDeivceTypes.push(newDeivceType);
            var rspData = serviceResource.restCallService(DEVCE_DEVICETYPE, "ADD", newDeivceTypes);
            rspData.then(function(data){
                if (data.result != "Success") {
                    Notification.error('新建设备类型出错');
                } else {
                    Notification.success('新建设备类型成功');
                    $uibModalInstance.close();
                }
            },function(reason){
                Notification.error('新建设备类型出错');
            });
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
})();
