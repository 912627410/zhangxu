/**
 * Created by bo on 16/4/2.
 */
(function () {
    'use strict';
    angular.module('GPSCloud')
        .controller('addPowerTypeController', addPowerTypeCtrl);
    function addPowerTypeCtrl($rootScope, $uibModalInstance, serviceResource, Notification, DEVCE_POWERTYPE) {
        var vm = this;
        vm.operatorInfo = $rootScope.userInfo;
        vm.ok = function (newPowerType) {
            var newPowerTypes = new Array();
            newPowerType.status = 1;  //dafault value
            newPowerTypes.push(newPowerType);
            var rspData = serviceResource.restCallService(DEVCE_POWERTYPE, "ADD", newPowerTypes);
            rspData.then(function(data){
                if (data.content != "success") {
                    Notification.error('新建驱动类型出错');
                } else {
                    Notification.success('新建驱动类型成功');
                    $uibModalInstance.close();
                }
            },function(reason){
                Notification.error('新建驱动类型出错');
            });
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
})();
