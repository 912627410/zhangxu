/**
 * Created by bo on 16/4/2.
 */
(function () {
    'use strict';
    angular.module('GPSCloud')
        .controller('addMFController', addMFCtrl);
    function addMFCtrl($rootScope, $uibModalInstance, serviceResource, Notification, DEVCE_MF) {
        var vm = this;
        vm.operatorInfo = $rootScope.userInfo;
        vm.ok = function (newMF) {
            var newMFs = new Array();
            newMF.status = 1;  //dafault value
            newMFs.push(newMF);
            var rspData = serviceResource.restCallService(DEVCE_MF, "ADD", newMFs);
            rspData.then(function(data){
                if (data.result != "Success") {
                    Notification.error('新建生产厂家出错');
                } else {
                    Notification.success('新建生产厂家成功');
                    $uibModalInstance.close();
                }
            },function(reason){
                Notification.error('新建生产厂家出错');
            });
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
})();
