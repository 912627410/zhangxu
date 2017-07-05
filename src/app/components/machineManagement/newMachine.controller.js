/**
 * Created by shuangshan on 16/1/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newMachineController', newMachineController);

  /** @ngInject */
  function newMachineController($rootScope, $scope, machineService, $http, $uibModal, $uibModalInstance, treeFactory, MACHINEANDDEVCE_ORG_JUDGE, DEIVCIE_FETCH_UNUSED_URL, MACHINE_URL, ENGINE_TYPE_LIST_URL, serviceResource, Notification, operatorInfo) {
    var vm = this;
    vm.operatorInfo = operatorInfo;
    vm.notice;

    vm.machine = {
      installTime: new Date(),
      //  buyTime:new Date()
      org: operatorInfo.userdto.organizationDto
    };

    var salaryTypePromise = machineService.getSalaryTypeList();
    salaryTypePromise.then(function (data) {
      vm.salaryTypeList = data;
      //    console.log(vm.userinfoStatusList);
    }, function (reason) {
      Notification.error('获取人工成本类型失败');
    })

    var upkeepPriceTypePromise = machineService.getUpkeepPriceTypeList();
    upkeepPriceTypePromise.then(function (data) {
      vm.upkeepPriceTypeList = data;
      //    console.log(vm.userinfoStatusList);
    }, function (reason) {
      Notification.error('获取保养费用类型失败');
    })

    var fuelTypePromise = machineService.getFuelTypeList();
    fuelTypePromise.then(function (data) {
      vm.fuelConfigList = data.content;
      console.log(vm.fuelConfigList);
    }, function (reason) {
      Notification.error('获取燃油类型失败');
    })

    var machineStatePromise = machineService.getMachineStateList();
    machineStatePromise.then(function (data) {
      vm.machineStateList= data;
      console.log(vm.machineStateList);
    }, function (reason) {
      Notification.error('获取车辆状态失败');
    })





    // 日期控件相关
    // date picker
    vm.buyTimeOpenStatus = {
      opened: false
    };

    vm.buyTimeOpen = function ($event) {
      vm.buyTimeOpenStatus.opened = true;
    };


    //动态查询未使用的本组织的设备
    vm.refreshDeviceList = function (value) {
      vm.deviceinfoList = [];
      if (value == "") {
        return;
      }

      var params = {deviceNum: value};
      return $http.get(
        DEIVCIE_FETCH_UNUSED_URL,
        {params: params}
      ).then(function (response) {
        vm.deviceinfoList = response.data

        //   alert( vm.deviceinfoList.length);
      });
    };

    //得到发动机类型集合
    var engineTypeData = serviceResource.restCallService(ENGINE_TYPE_LIST_URL, "QUERY");
    engineTypeData.then(function (data) {
      vm.engineTypeList = data;
    }, function (reason) {
      Notification.error('获取发动机类型失败');
    })


    //日期控件相关
    //date picker
    vm.installTimeOpenStatus = {
      opened: false
    };

    vm.installTimeOpen = function ($event) {
      vm.installTimeOpenStatus.opened = true;
    };

    vm.buyTimeOpenStatus = {
      opened: false
    };

    vm.buyTimeOpen = function ($event) {
      vm.buyTimeOpenStatus.opened = true;
    };


    vm.ok = function (machine) {
      var postInfo = machine;
      if (machine.licenseId.length < 17) {
        Notification.warning("录入的车号不足17位，请重新录入！");
        return;
      } else if(machine.licenseId.length > 17) {
        Notification.warning("录入的车号超过17位，请重新录入！");
        return;
      }
      if (machine.deviceinfo) {
        //条码输入
        if (machine.deviceinfo.deviceNum.length == 26 && vm.deviceNumFromScanner == true && vm.deviceNumContentFromScanner != null & vm.deviceNumContentFromScanner != '') {
          machine.deviceinfo.deviceNum = vm.deviceNumContentFromScanner;
        }
        postInfo.deviceinfo = {deviceNum: machine.deviceinfo.deviceNum};
      }
      else {
        postInfo.deviceinfo = null;
      }
      postInfo.org = machine.org;
      // postInfo.engineType={id:machine.engineType};
      // postInfo.fuelConfig={id:machine.fuelConfig};


      var restPromise = serviceResource.restAddRequest(MACHINE_URL, postInfo);
      restPromise.then(function (data) {
          if (data.code === 0) {
            if (data.content.autoSendSMSResult) {
              Notification.success("新建车辆信息成功!<br>自动发送激活短信: " + data.content.autoSendSMSResult);
            } else {
              Notification.success("新建车辆信息成功!");
            }
            $uibModalInstance.close(data.content);
          } else {
            vm.machine = machine;
            Notification.error(data.message);
          }
        }, function (reason) {
          // alert(reason.data.message);
          vm.errorMsg = reason.data.message;
          Notification.error(reason.data.message);
        }
      );
    };



      //alert(machine.deviceinfo.id);
      // if(vm.machine.deviceinfo.deviceNum==""){
      //  if(!confirm("设备号没有输入,请注意")){
      //    return;
      //  }
      // }

      //为了减少请求的参数,重新上设置参数
      // vm.machine.deviceinfoId=vm.machine.deviceinfo.id;
      // vm.machine.orgId=vm.machine.org.id;

      //  alert(vm.machine.deviceinfoId+"   "+vm.machine.orgId);
      //   alert(vm.machine.deviceinfo.deviceNum);




    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };


    //默认不是通过扫码输入
    vm.deviceNumFromScanner = false;
    vm.deviceNumContentFromScanner = '';
    //用于判断设备号输入的数据是否是通过扫码输入
    //扫码格式是 ".LG4130002690.43985.C202B5"
    vm.deviceNumInputChanged = function (deviceNum) {
      if (deviceNum.length == 26) {
        if (deviceNum.substring(0, 1) == '.' && deviceNum.substring(13, 14) == '.' && deviceNum.substring(19, 20) == '.') {
          vm.deviceNumFromScanner = true;
          vm.deviceNumContentFromScanner = deviceNum.substring(20);
        }
        else {
          vm.deviceNumFromScanner = false;
          vm.deviceNumContentFromScanner = '';
        }
      }
      else {
        vm.deviceNumFromScanner = false;
        vm.deviceNumContentFromScanner = '';
      }
    }


    //组织树的显示
    vm.openTreeInfo = function () {
      treeFactory.treeShow(function (selectedItem) {
        vm.machine.org = selectedItem;
      });
    }


  }
})();
