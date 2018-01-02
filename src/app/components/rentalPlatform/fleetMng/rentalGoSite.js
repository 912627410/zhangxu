(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalGoSiteController', rentalGoSiteController);

  function rentalGoSiteController($rootScope, $uibModalInstance, $stateParams, ngTableDefaults, NgTableParams, serviceResource, treeFactory, rentalOrder, commonFactory, $timeout,$uibModal,
                                  rentalService, DEFAULT_SIZE_PER_PAGE, RENTANL_ORDER_MACHINE_BATCH_MOVE_URL, Upload, RENTAL_MACHINE_MONITOR_URL, RENTANL_UNUSED_MACHINE_PAGE_URL, RENTANL_ATTACH_UPLOAD_URL, RENTANL_ENTER_AND_EXIT_ATTACH_UPLOAD_URL, Notification, languages) {

    var vm = this;
    vm.userInfo = $rootScope.userInfo;
    vm.selectAll = false;
    vm.rentalOrder = rentalOrder
    vm.selected = [];
    vm.pageSize = 8;
    var date = new Date();
    vm.goSiteDate = date;
    //时间格式检验
    vm.timeValidate = function (date) {
      if (date == undefined) {
        Notification.error(languages.findKey('exitTimeFormatIsNotCorrect'));
      }
    }
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
    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    vm.machineMonitor = function (licenseId) {
      var restCallUrl = RENTAL_MACHINE_MONITOR_URL + "?licenseId=" + licenseId;
      var deviceDataPromis = serviceResource.restCallService(restCallUrl, "GET");
      deviceDataPromis.then(function (data) {
        //打开模态框
        var currentOpenModal = $uibModal.open({
          animation: true,
          backdrop: false,
          templateUrl: 'app/components/rentalPlatform/machineMng/machineMonitor.html',
          controller: 'machineMonitorController',
          controllerAs: 'vm',
          openedClass: 'hide-y',//class名 加载到整个页面的body 上面可以取消右边的滚动条
          windowClass: 'top-spacing',//class名 加载到ui-model 的顶级div上面
          size: 'super-lgs',
          resolve: { //用来向controller传数据
            deviceInfo: function () {
              return data.content;
            }
          }
        });
      }, function (reason) {
        Notification.error(languages.findKey('failedToGetDeviceInformation'));
      })
    }

    //组织树的显示
    vm.openTreeInfo = function () {
      treeFactory.treeShow(function (selectedItem) {
        vm.org = selectedItem;
      });
    }

    //加载品牌信息
    var deviceManufactureListPromise = rentalService.getDeviceManufactureList();
    deviceManufactureListPromise.then(function (data) {
      vm.deviceManufactureList = data.content;
      //    console.log(vm.userinfoStatusList);
    }, function (reason) {
      Notification.error(languages.findKey('getVendorFail'));
    })

    //加载高度信息
    var deviceHeightTypeListPromise = rentalService.getDeviceHeightTypeList();
    deviceHeightTypeListPromise.then(function (data) {
      vm.deviceHeightTypeList = data.content;
    }, function (reason) {
      Notification.error(languages.findKey('getHeFail'));
    })

    //加载车辆类型信息
    var deviceTypeListPromise = rentalService.getDeviceTypeList();
    deviceTypeListPromise.then(function (data) {
      vm.deviceTypeList = data.content;
    }, function (reason) {
      Notification.error(languages.findKey('getTypeFail'));
    })

    //加载车辆驱动信息
    var devicePowerTypeListPromise = rentalService.getDevicePowerTypeList();
    devicePowerTypeListPromise.then(function (data) {
      vm.devicePowerTypeList = data.content;
    }, function (reason) {
      Notification.error(languages.findKey('getDriFail'));
    })

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    vm.reset = function () {
      vm.searchConditions = null;
      vm.org = null;
    }

    vm.batchMoveMachine = function (file) {
      var recordTime = serviceResource.getChangeChinaTime(vm.goSiteDate);
      var startMonth = recordTime.getMonth() + 1;  //getMonth返回的是0-11
      recordTime = recordTime.getFullYear() + '-' + startMonth + '-' + recordTime.getDate() + ' ' + recordTime.getHours() + ':' + recordTime.getMinutes() + ':' + recordTime.getSeconds();
      var rentalOrderMachineOperVo = {
        "addMachineIdList": vm.selected,
        "orderId": vm.rentalOrder.id,
        "operationType": 1,
        "recordTime": vm.goSiteDate
      };
      var restPromise = serviceResource.restUpdateRequest(RENTANL_ENTER_AND_EXIT_ATTACH_UPLOAD_URL, rentalOrderMachineOperVo);
      restPromise.then(function (data) {
        if (data.code == 0) {
          if (file) {
            var Id = data.content;
            vm.fileUpload(Id, file);
          }
          Notification.success(languages.findKey('transVehicle'));
          $uibModalInstance.close(vm.selected.length);
        }
      }, function (reason) {
        Notification.error(languages.findKey('transVehiclFail'));
      });

    }
    //附件上传
    vm.fileUpload = function (id, files) {
      var uploadUrl = RENTANL_ATTACH_UPLOAD_URL;
      uploadUrl += "?enterfactoryrecordid=" + id
      if (files != null) {
        angular.forEach(files, function (file) {
          file.upload = Upload.upload({
            url: uploadUrl,
            file: file
          });
          file.upload.then(function (response) {
              $timeout(function () {
                file.result = response.data;
                if (file.result.code != 0) {
                  Notification.error(data.message);
                }
              })
            },
            function (reason) {
              vm.errorMsg = reason.data.message;
              Notification.error("新增文件失败!");
              Notification.error(vm.errorMsg);
            }, function (evt) {
            });
        })
      }
    }
    vm.queryMachine = function (searchConditions, page, size, sort) {
      var restCallURL = RENTANL_UNUSED_MACHINE_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || 8;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      restCallURL += "&orgId=" + vm.userInfo.userdto.organizationDto.id;
      if (searchConditions != null) {
        if (searchConditions.licenseId != null) {
          restCallURL += "&licenseId=" + searchConditions.licenseId;
        }
        if (searchConditions.type != null) {
          restCallURL += "&typeId=" + searchConditions.type.id;
        }
        if (searchConditions.powerType != null) {
          restCallURL += "&powerTypeId=" + searchConditions.powerType.id;
        }
        if (searchConditions.heightType != null) {
          restCallURL += "&heightTypeId=" + searchConditions.heightType.id;
        }

        if (searchConditions.factory != null) {
          restCallURL += "&factoryId=" + searchConditions.factory.id;
        }
        if (searchConditions.address != null) {
          restCallURL += "&address=" + searchConditions.address;
        }
      }
      if (null != vm.org && null != vm.org.id && !vm.querySubOrg) {
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
    vm.queryMachine(null, null, null, null, null);

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
