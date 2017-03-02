/**
 * Created by bo on 16/4/2.
 */
(function () {
    'use strict';
    angular.module('GPSCloud')
        .controller('devivceparameterController', devivceparameterCtrl);
    function devivceparameterCtrl($rootScope,$scope, $uibModal, $log, serviceResource,permissions,Notification,DEVCE_MF,DEVCE_POWERTYPE,DEVCE_DEVICETYPE,DEVCE_HIGHTTYPE,ORG_TREE_JSON_DATA_URL,ORG_URL,ORG_ID_URL,ORG_PARENTID_URL) {
        var vm = this;
        vm.operatorInfo = $rootScope.userInfo;

        var rootParent={id:0}; //默认根节点为0
        //通过后台返回的结构生成json tree
        vm.unflatten=function( array, parent, tree ){
            tree = typeof tree !== 'undefined' ? tree : [];
            parent = typeof parent !== 'undefined' ? parent : { id: 0 };
            var children = _.filter( array, function(child) {
                return child.parentId == parent.id;
            });

            if( !_.isEmpty( children )  ){
                if( parent.id == 0){
                    tree = children;

                }else{
                    parent['children'] = children
                }
                _.each( children, function( child ){ vm.unflatten( array, child,null ) } );
            }


            //alert("tree="+tree);
            return tree;
        };


        vm.loadDeviceMF = function(){
            if (!permissions.getPermissions("config:mfPage")) {
                return;
            }

            if (vm.operatorInfo){
                var rspData = serviceResource.getConfigInfo(vm.operatorInfo,DEVCE_MF);
                rspData.then(function(data){
                    vm.deviceMFList = data.content;
                },function(reason){
                    serviceResource.handleRsp("获取厂商参数出错",reason);
                });

            }
        };





        vm.revertConfigStatus = function(deviceConfig,action){
            if (vm.operatorInfo){
                if (deviceConfig.status == 0)
                {
                    deviceConfig.status =1;
                }
                else{
                    deviceConfig.status =0;
                }
                var deviceConfigs = new Array();
                deviceConfigs.push(deviceConfig);
                serviceResource.updateConfigInfo(vm.operatorInfo,deviceConfigs,action,function(rspData){
                    if (rspData.result != "Success")
                    {
                        //rollback update
                        if (deviceConfigs.status == 0)
                        {
                            deviceConfigs.status =1;
                        }
                        else{
                            deviceConfigs.status =0;
                        }
                    }
                    serviceResource.handleRsp("操作出错",rspData);
                });
            }
        };

        vm.loadDeviceType = function(){
            if (!permissions.getPermissions("config:devicetypePage")) {
                return;
            }

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
            if (!permissions.getPermissions("config:devicepowertypeOper")) {
                return;
            }

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
            if (!permissions.getPermissions("config:deviceheighttypeOper")) {
                return;
            }

            if (vm.operatorInfo){
                var rspData = serviceResource.getConfigInfo(vm.operatorInfo,DEVCE_HIGHTTYPE);
                rspData.then(function(data){
                    vm.deviceHeightTypeList = data.content;
                },function(reason){
                    serviceResource.handleRsp("获取设备高度类型出错",reason);
                });

            }
        };

//生成局部组织树
        vm.loadLocalOrgTree = function () {
            if (!permissions.getPermissions("config:organazitionPage")) {
                return;
            }

            if(vm.operatorInfo){
                var rspData = serviceResource.restCallService(ORG_TREE_JSON_DATA_URL,"QUERY");
                rspData.then(function (data) {
                    var orgParent = rootParent;
                    if(vm.operatorInfo.userdto.organizationDto!=null){
                        orgParent.id=vm.operatorInfo.userdto.organizationDto.id;
                        rootParent.id=orgParent.id;
                    }
                    var list=data;
                    for(var i=0;i<list.length;i++){
                        if(list[i].id==rootParent.id){
                            list[i].parentId=0;
                            break;
                        }
                    }
                    vm.orgChart=vm.unflatten (list);
                },function (reason) {
                    Notification.error('获取组织机构信息失败');
                })
            }
        }
        vm.showOrgTree = false;

        vm.openOrgTree = function(){
            vm.showOrgTree = !vm.showOrgTree;
        }

        vm.my_tree_handler = function(branch) {
            $scope.$emit("OrgSelectedEvent",branch);
        };

        vm.user_tree_handler = function(eventName,branch) {
            $scope.$emit(eventName,branch);
        };

        if ($scope.orgChart && $scope.orgChart.length > 0){
            vm.my_data=[$scope.orgChart[0]];
        }
        else{
            Notification.error('获取组织机构信息失败');
        }

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
            });
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

//update MF
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
            });
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
            });
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
            });
        };





//new org
        vm.addOrg = function (size) {
            var modalInstance = $uibModal.open({
                animation: vm.animationsEnabled,
                templateUrl: 'app/components/deviceParameter/newOrg.html',
                controller: 'addOrgController as addOrgCtrl',
                size: size,
                backdrop: false,
                resolve: {
                    selectedOrg: function () {
                        return vm.selectedOrg;

                    }
                }
            });

            modalInstance.result.then(function () {
                //when close
            }, function () {
                //取消
            });
        };
//update org
        vm.updateOrg = function (size) {
            if(vm.selectedOrg.parentId=="0"){
                Notification.error("不可以更新根组织!");
            }else{
                var url = ORG_ID_URL+"?id=" + vm.selectedOrg.parentId;
                var orgPromise = serviceResource.restCallService(url,"GET");
                orgPromise.then(function (data) {
                    var parentOrg = data.content;
                    var modalInstance = $uibModal.open({
                        animation:vm.animationsEnabled,
                        templateUrl:'app/components/deviceParameter/updateOrg.html',
                        controller: 'updateOrgController as updateOrgCtrl',
                        size: size,
                        backdrop: false,
                        resolve: {
                            selectedOrg: function () {
                                return vm.selectedOrg;
                            },
                            parentOrg:function () {
                                return parentOrg;
                            }
                        }
                    });

                    modalInstance.result.then(function () {
                        //when close
                    }, function () {
                        //取消
                    });
                },function (reason) {

                });
            }
        };
//delete org
        /*
        vm.deleteOrg = function () {
            if(vm.selectedOrg==null){
                Notification.error("请选择要删除的组织!");
            }else {
                var url = ORG_PARENTID_URL+"?parentId=" + vm.selectedOrg.id;
                var orgPromise = serviceResource.restCallService(url,"QUERY");
                orgPromise.then(function (data) {
                    var childOrg=data;
                    console.log(childOrg.length);
                    if(childOrg.length>'0'){
                        Notification.error("该组织下存在子组织,无法删除!");
                    }else {
                        var restPromise = serviceResource.restDeleteRequest(ORG_URL,vm.selectedOrg);
                        restPromise.then(function (data) {
                            Notification.success("删除部门成功");
                        },function (reason) {
                            Notification.error("删除部门失败");
                        })
                    }
                },function (reason) {

                });
            }
            modalInstance.result.then(function (selectedItem) {
                vm.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };
    */
    }
})();
