/**
 * Created by bo on 16/4/2.
 */
(function () {
    'use strict';
    angular.module('GPSCloud')
        .controller('addHeightTypeController', addHeightTypeCtrl);
    function addHeightTypeCtrl($rootScope, $uibModalInstance, serviceResource, Notification, DEVCE_HIGHTTYPE) {
        var vm = this;
        vm.operatorInfo = $rootScope.userInfo;
        vm.ok = function (newHeightType) {
            var newHeightTypes = new Array();
            newHeightType.status = 1;  //dafault value
            newHeightTypes.push(newHeightType);
            var rspData = serviceResource.restCallService(DEVCE_HIGHTTYPE, "ADD", newHeightTypes);
            rspData.then(function(data){
                if (data.result != "Success") {
                    Notification.error('新建高度类型出错');
                } else {
                    Notification.success('新建高度类型成功');
                    $uibModalInstance.close();
                }
            },function(reason){
                Notification.error('新建高度类型出错');
            });
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
})();
