/**
 * Created by bo on 16/4/2.
 */
(function () {
    'use strict';
    angular.module('GPSCloud')
        .controller('addHeightTypeController', addHeightTypeCtrl);
    function addHeightTypeCtrl($rootScope, $uibModalInstance, serviceResource, DEVCE_HIGHTTYPE) {
        var vm = this;
        vm.operatorInfo = $rootScope.userInfo;
        vm.ok = function (newHeightType) {
            var newHeightTypes = new Array();
            newHeightType.status = 1;  //dafault value
            newHeightTypes.push(newHeightType);
            serviceResource.addConfigInfo(vm.operatorInfo,newHeightTypes,DEVCE_HIGHTTYPE,function(rspData){
                serviceResource.handleRsp("新建高度类型出错",rspData);
            });
            $uibModalInstance.close();
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
})();
