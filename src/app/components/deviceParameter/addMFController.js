/**
 * Created by bo on 16/4/2.
 */
(function () {
    'use strict';
    angular.module('GPSCloud')
        .controller('addMFController', addMFCtrl);
    function addMFCtrl($rootScope, $uibModalInstance, serviceResource, DEVCE_MF) {
        var vm = this;
        vm.operatorInfo = $rootScope.userInfo;
        vm.ok = function (newMF) {
            var newMFs = new Array();
            newMF.status = 1;  //dafault value
            newMFs.push(newMF);
            serviceResource.addConfigInfo(vm.operatorInfo,newMFs,DEVCE_MF,function(rspData){
                serviceResource.handleRsp("新建生产厂家出错",rspData);
            });
            $uibModalInstance.close();
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
})();
