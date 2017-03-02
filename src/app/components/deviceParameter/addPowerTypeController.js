/**
 * Created by bo on 16/4/2.
 */
(function () {
    'use strict';
    angular.module('GPSCloud')
        .controller('addPowerTypeController', addPowerTypeCtrl);
    function addPowerTypeCtrl($rootScope, $uibModalInstance, serviceResource, DEVCE_POWERTYPE) {
        var vm = this;
        vm.operatorInfo = $rootScope.userInfo;
        vm.ok = function (newPowerType) {
            var newPowerTypes = new Array();
            newPowerType.status = 1;  //dafault value
            newPowerTypes.push(newPowerType);
            serviceResource.addConfigInfo(vm.operatorInfo,newPowerTypes,DEVCE_POWERTYPE,function(rspData){
                serviceResource.handleRsp("新建驱动类型出错",rspData);
            });
            $uibModalInstance.close();
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
})();
