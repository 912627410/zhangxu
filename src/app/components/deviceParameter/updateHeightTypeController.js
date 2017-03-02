/**
 * Created by bo on 16/4/2.
 */
(function () {
    'use strict';
    angular.module('GPSCloud')
        .controller('updateHeightTypeController', updateHeightTypeCtrl);
    function updateHeightTypeCtrl($rootScope, $uibModalInstance, serviceResource, DEVCE_HIGHTTYPE) {
        var vm = this;
        vm.operatorInfo = $rootScope.userInfo;
        vm.deviceHeightType = deviceHeightType;

        vm.ok = function (deviceHeightType) {
            var deviceHeightTypes = new Array();
            deviceHeightTypes.push(deviceHeightType);
            serviceResource.updateConfigInfo(vm.operatorInfo,deviceHeightTypes,DEVCE_HIGHTTYPE,function(rspData){
                serviceResource.handleRsp("更新高度类型信息出错",rspData);
            });
            $uibModalInstance.close();
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
})();
