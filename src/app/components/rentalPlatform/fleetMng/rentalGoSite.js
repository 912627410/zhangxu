
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalGoSiteController', rentalGoSiteController);

  function rentalGoSiteController($rootScope,$uibModalInstance,$stateParams,ngTableDefaults,NgTableParams,serviceResource,treeFactory,rentalOrder,commonFactory,Upload,
                                  rentalService,DEFAULT_SIZE_PER_PAGE,RENTANL_ORDER_MACHINE_BATCH_MOVE_URL,RENTANL_UNUSED_MACHINE_PAGE_URL,Notification,languages) {
    var vm=this;
    vm.userInfo = $rootScope.userInfo;
    vm.selectAll=false;
    vm.rentalOrder = rentalOrder
    vm.selected=[];
    vm.pageSize = 8;
    var date=new Date();
    vm.goSiteDate=date;
    vm.goSiteDateOpenStatusData = {
      opened: false
    };
    vm.goSiteDateOpenData = function ($event) {
      vm.goSiteDateOpenStatusData.opened = true;
    };

    vm.maxDate = new Date();
    vm.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };
    ngTableDefaults.params.count=DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts=[];

    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.org =selectedItem;
      });
    }

    //加载品牌信息
    var deviceManufactureListPromise = rentalService.getDeviceManufactureList();
    deviceManufactureListPromise.then(function (data) {
      vm.deviceManufactureList= data.content;
      //    console.log(vm.userinfoStatusList);
    }, function (reason) {
      Notification.error(languages.findKey('getVendorFail'));
    })

    //加载高度信息
    var deviceHeightTypeListPromise = rentalService.getDeviceHeightTypeList();
    deviceHeightTypeListPromise.then(function (data) {
      vm.deviceHeightTypeList= data.content;
    }, function (reason) {
      Notification.error(languages.findKey('getHeFail'));
    })

    //加载车辆类型信息
    var deviceTypeListPromise = rentalService.getDeviceTypeList();
    deviceTypeListPromise.then(function (data) {
      vm.deviceTypeList= data.content;
    }, function (reason) {
      Notification.error(languages.findKey('getTypeFail'));
    })

    //加载车辆驱动信息
    var devicePowerTypeListPromise = rentalService.getDevicePowerTypeList();
    devicePowerTypeListPromise.then(function (data) {
      vm.devicePowerTypeList= data.content;
    }, function (reason) {
      Notification.error(languages.findKey('getDriFail'));
    })

    //批量进场（批量调入）
    vm.batchMoveMachine = function (file) {
      var rentalOrderMachineOperVo = {"addMachineIdList": vm.selected, "orderId": vm.rentalOrder.id,"operationType":2,"recordTime":vm.goSiteDate};
      file.upload = Upload.upload({
        url: RENTANL_ORDER_MACHINE_BATCH_MOVE_URL,
        data: {
          addMachineIdList: vm.selected,
          orderId: vm.rentalOrder.id,
          operationType:2,
          recordTime:vm.goSiteDate
        },
        file: file
      });
      file.upload.then(function(response){
        $timeout(function(){
          file.result = response.data;
          if(file.result.code == 0){
            Notification.success("新增升级文件成功!");
            $uibModalInstance.close();
          }else{
            Notification.error(data.message);
          }
        })
      },function(reason){
        vm.errorMsg=reason.data.message;
        Notification.error("新增升级文件失败!");
        Notification.error(vm.errorMsg);
      },function(evt){
      });

      // var URL = RENTANL_ORDER_MACHINE_BATCH_MOVE_URL + "?file=" + vm.file;
      //
      //   var rentalOrderMachineOperVo = {"addMachineIdList": vm.selected, "orderId": vm.rentalOrder.id,"operationType":2,"recordTime":vm.goSiteDate};
      //   var restPromise = serviceResource.restUpdateRequest(URL, rentalOrderMachineOperVo);
      //   restPromise.then(function (data) {
      //     if(data.code==0){
      //       Notification.success(languages.findKey('transVehicle'));
      //
      //       }
      //     }, function (reason) {
      //       Notification.error(languages.findKey('transVehiclFail'));
      //     });
        $uibModalInstance.close(vm.selected.length);

    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    vm.reset = function () {
      vm.searchConditions = null;
      vm.org = null;
    }

    vm.queryMachine = function (searchConditions,page,size,sort) {
      var restCallURL = RENTANL_UNUSED_MACHINE_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || 8;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      restCallURL += "&orgId=" + vm.userInfo.userdto.organizationDto.id;
      if (searchConditions!=null){
        if(searchConditions.licenseId!=null){
          restCallURL += "&licenseId=" + searchConditions.licenseId;
        }
        if(searchConditions.type!=null){
          restCallURL += "&typeId=" + searchConditions.type.id;
        }
        if(searchConditions.powerType!=null){
          restCallURL += "&powerTypeId=" + searchConditions.powerType.id;
        }
        if(searchConditions.heightType!=null){
          restCallURL += "&heightTypeId=" + searchConditions.heightType.id;
        }

        if(searchConditions.factory!=null){
          restCallURL += "&factoryId=" + searchConditions.factory.id;
        }
        if(searchConditions.address!=null){
          restCallURL += "&address=" + searchConditions.address;
        }


      }
        if (null != vm.org&&null != vm.org.id&&!vm.querySubOrg) {
             restCallURL += "&orgId=" + vm.org.id;
        }



      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {

        vm.tableParams = new NgTableParams({
          // initial sort order
          // sorting: { name: "desc" }
        }, {
          filterDelay: 0,
          dataset: angular.copy(data.content)
          // dataset: data.content
        });
        vm.totalElements = data.totalElements;
        vm.number = data.number + 1;
        vm.size = data.size;
      }, function (reason) {

        Notification.error("获取车辆数据失败");
      });

    }
    vm.queryMachine(null,null,null,null,null);

    var updateSelected = function (action, machine) {
      if (action == 'add' && vm.selected.indexOf(machine.id) == -1) {
        vm.selected.push(machine.id);
      }
      if (action == 'remove' && vm.selected.indexOf(machine.id) != -1) {
        var idx = vm.selected.indexOf(machine.id);
        vm.selected.splice(idx, 1);

      }
    }

    vm.updateSelection = function ($event, id, status) {

      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      updateSelected(action, id);
    }
    vm.updateAllSelection = function ($event) {
      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');

      vm.tableParams.data.forEach(function (machine) {
        updateSelected(action, machine);
      })

    }
    vm.isSelected = function (id) {
      return vm.selected.indexOf(id) >= 0;
    }

  }
})();
