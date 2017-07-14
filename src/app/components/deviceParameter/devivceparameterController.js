/**
 * Created by bo on 16/4/2.
 */
(function () {
    'use strict';
    angular.module('GPSCloud')
        .controller('devivceparameterController', devivceparameterCtrl);
    function devivceparameterCtrl($rootScope,$scope, $uibModal, $log, $window, serviceResource,permissions,Notification,DEVCE_MF,DEVCE_POWERTYPE,DEVCE_DEVICETYPE,DEVCE_HIGHTTYPE,ORG_TREE_JSON_DATA_URL,ORG_URL,ORG_ID_URL,ORG_PARENTID_URL) {
        var vm = this;
        vm.operatorInfo = $rootScope.userInfo;


        vm.loadDeviceMF = function(){

            if (vm.operatorInfo){
                var rspData = serviceResource.getConfigInfo(vm.operatorInfo,DEVCE_MF);
                rspData.then(function(data){
                    vm.deviceMFList = data.content;
                },function(reason){
                    serviceResource.handleRsp("获取厂商参数出错",reason);
                });

            }
        };

        vm.loadDeviceType = function(){

            if (vm.operatorInfo){
                var rspData = serviceResource.getConfigInfo(vm.operatorInfo,DEVCE_DEVICETYPE);
                rspData.then(function(data){
                    vm.deviceTypeList = data.content;
                },function(reason){
                    serviceResource.handleRsp("获取设备类型出错",reason);
                });

            }
        };

        vm.loadDevicePowerType = function(){

            if (vm.operatorInfo){
                var rspData = serviceResource.getConfigInfo(vm.operatorInfo,DEVCE_POWERTYPE);
                rspData.then(function(data){
                    vm.devicePowerTypeList = data.content;
                },function(reason){
                    serviceResource.handleRsp("获取设备驱动类型出错",reason);
                });

            }
        };

        vm.loadDeviceHeightType = function(){

            if (vm.operatorInfo){
                var rspData = serviceResource.getConfigInfo(vm.operatorInfo,DEVCE_HIGHTTYPE);
                rspData.then(function(data){
                    vm.deviceHeightTypeList = data.content;
                },function(reason){
                    serviceResource.handleRsp("获取设备高度类型出错",reason);
                });

            }
        };

        vm.animationsEnabled = true;
        vm.toggleAnimation = function () {
            vm.animationsEnabled = !vm.animationsEnabled;
        };


//new Manufacture
        vm.newMF = function (size) {
            var modalInstance = $uibModal.open({
                animation: vm.animationsEnabled,
                templateUrl: 'app/components/deviceParameter/newMF.html',
                controller: 'addMFController as addMFCtrl',
                size: size,
                resolve: {
                    deviceMF: function () {
                        return vm.deviceMF;
                    }
                }
            });

            modalInstance.result.then(function () {
                $log.info('new MF is added: ' + new Date());
                vm.loadDeviceMF();
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

//update MF
        vm.updateMF = function (deviceMF,size) {
            var modalInstance = $uibModal.open({
                animation: vm.animationsEnabled,
                templateUrl: 'app/components/deviceParameter/updateMF.html',
                controller: 'updateMFController as updateMFCtrl',
                size: size,
                resolve: {
                    deviceMF: function () {
                        return deviceMF;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                vm.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
                vm.loadDeviceMF();
            });
        };

//update MF status
        vm.updateDeviceMFStatus = function (deviceMF) {
            if (vm.operatorInfo) {
                if (deviceMF.status == 0) {
                    deviceMF.status = 1;
                } else {
                    deviceMF.status = 0;
                }
                var updatedMFs = new Array();
                updatedMFs.push(deviceMF);
                var rspData = serviceResource.restCallService(DEVCE_MF, "UPDATE", updatedMFs);
                rspData.then(function (data) {
                    if (data.result != "Success") {
                        Notification.error('操作出错');
                    }
                    else {
                        Notification.success('操作成功');
                    }
                }, function (reason) {
                    Notification.error('操作出错');
                });
            }
        };

//new device type
        vm.newDeviceType = function (size) {
            var modalInstance = $uibModal.open({
                animation: vm.animationsEnabled,
                templateUrl: 'app/components/deviceParameter/newDeviceType.html',
                controller: 'addDeviceTypeController as addDeviceTypeCtrl',
                size: size,
                resolve: {
                    deviceType: function () {
                        return vm.deviceType;
                    }
                }
            });

            modalInstance.result.then(function () {
                $log.info('new device type is added: ' + new Date());
                vm.loadDeviceType();
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

//update device type
        vm.updateDeviceType = function (deviceType,size) {
            var modalInstance = $uibModal.open({
                animation: vm.animationsEnabled,
                templateUrl: 'app/components/deviceParameter/updateDeviceType.html',
                controller: 'updateDeviceTypeController as updateDeviceTypeCtrl',
                size: size,
                resolve: {
                    deviceType: function () {
                        return deviceType;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                vm.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
                vm.loadDeviceType();
            });
        };

//update device type status
        vm.updateDeviceTypeStatus = function (deviceType) {
            if (vm.operatorInfo) {
                if (deviceType.status == 0) {
                    deviceType.status = 1;
                } else {
                    deviceType.status = 0;
                }
                var deviceTypes = new Array();
                deviceTypes.push(deviceType);
                var rspData = serviceResource.restCallService(DEVCE_DEVICETYPE, "UPDATE", deviceTypes);
                rspData.then(function (data) {
                    if (data.result != "Success") {
                        Notification.error('操作出错');
                    }
                    else {
                        Notification.success('操作成功');
                    }
                }, function (reason) {
                    Notification.error('操作出错');
                });
            }
        };

//new device power type
        vm.newPowerType = function (size) {
            var modalInstance = $uibModal.open({
                animation: vm.animationsEnabled,
                templateUrl: 'app/components/deviceParameter/newPowerType.html',
                controller: 'addPowerTypeController as addPowerTypeCtrl',
                size: size,
                resolve: {
                    devicePowerType: function () {
                        return vm.devicePowerType;
                    }
                }
            });

            modalInstance.result.then(function () {
                $log.info('new power type is added: ' + new Date());
                vm.loadDevicePowerType();
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

//update deivce power type
        vm.updatePowerType = function (devicePowerType,size) {
            var modalInstance = $uibModal.open({
                animation: vm.animationsEnabled,
                templateUrl: 'app/components/deviceParameter/updatePowerType.html',
                controller: 'updatePowerTypeController as updatePowerTypeCtrl',
                size: size,
                resolve: {
                    devicePowerType: function () {
                        return devicePowerType;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                vm.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
                vm.loadDevicePowerType();
            });
        };

//update device power type status
        vm.updateDevicePowerTypeStatus = function (devicePowerType) {
            if (vm.operatorInfo) {
                if (devicePowerType.status == 0) {
                  devicePowerType.status = 1;
                } else {
                  devicePowerType.status = 0;
                }
                var devicePowerTypes = new Array();
                devicePowerTypes.push(devicePowerType);
                var rspData = serviceResource.restCallService(DEVCE_POWERTYPE, "UPDATE", devicePowerTypes);
                rspData.then(function (data) {
                    if (data.result != "Success") {
                        Notification.error('操作出错');
                    }
                    else {
                        Notification.success('操作成功');
                    }
                }, function (reason) {
                    Notification.error('操作出错');
                });
            }
        };

//new device height type
        vm.newHeightType = function (size) {
            var modalInstance = $uibModal.open({
                animation: vm.animationsEnabled,
                templateUrl: 'app/components/deviceParameter/newHeightType.html',
                controller: 'addHeightTypeController as addHeightTypeCtrl',
                size: size,
                resolve: {
                    deviceHeightType: function () {
                        return vm.deviceHeightType;
                    }
                }
            });

            modalInstance.result.then(function () {
                $log.info('new height type is added: ' + new Date());
                vm.loadDeviceHeightType();
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };


//update deivce height type
        vm.updateHeightType = function (deviceHeightType,size) {
            var modalInstance = $uibModal.open({
                animation: vm.animationsEnabled,
                templateUrl: 'app/components/deviceParameter/updateHeightType.html',
                controller: 'updateHeightTypeController as updateHeightTypeCtrl',
                size: size,
                resolve: {
                    deviceHeightType: function () {
                        return deviceHeightType;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                vm.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
                vm.loadDeviceHeightType();
            });
        };

//update device height type status
        vm.updateDeviceHeightTypeStatus = function (deviceHeightType) {
            if (vm.operatorInfo) {
                if (deviceHeightType.status == 0) {
                    deviceHeightType.status = 1;
                } else {
                    deviceHeightType.status = 0;
                }
                var deviceHeightTypes = new Array();
                deviceHeightTypes.push(deviceHeightType);
                var rspData = serviceResource.restCallService(DEVCE_HIGHTTYPE, "UPDATE", deviceHeightTypes);
                rspData.then(function (data) {
                    if (data.result != "Success") {
                        Notification.error('操作出错');
                    }
                    else {
                        Notification.success('操作成功');
                    }
                }, function (reason) {
                    Notification.error('操作出错');
                });
            }
        };

    }
})();
