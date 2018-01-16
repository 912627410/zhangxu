/**
 * Created by shuangshan on 16/1/20.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateMachineController', updateMachineController);

  /** @ngInject */
  function updateMachineController($rootScope,$scope,$http,$confirm,$uibModalInstance,treeFactory,machineService,DEIVCIE_FETCH_UNUSED_URL,MACHINE_URL,ENGINE_TYPE_LIST_URL,serviceResource, Notification,machine) {
    var vm = this;
    vm.machine = machine;
    vm.operatorInfo =$rootScope.userInfo;

    var salaryTypePromise = machineService.getSalaryTypeList();
    salaryTypePromise.then(function (data) {
      vm.salaryTypeList= data;
    }, function (reason) {
      Notification.error('获取人工成本类型失败');
    });

    var upkeepPriceTypePromise = machineService.getUpkeepPriceTypeList();
    upkeepPriceTypePromise.then(function (data) {
      vm.upkeepPriceTypeList= data;
    }, function (reason) {
      Notification.error('获取保养费用类型失败');
    });

    var machineStatePromise = machineService.getMachineStateList();
    machineStatePromise.then(function (data) {
      vm.machineStateList= data;
      for(var i=0;i<vm.machineStateList.length;i++){
        if(vm.machine.machineState ==  vm.machineStateList[i].machineState){
          vm.machine.machineState =vm.machineStateList[i].code;
        }
      }
    }, function (reason) {
      Notification.error('获取车辆状态失败');
    });


    if(null!=vm.machine.deviceinfo) {
      vm.oldMachine=vm.machine.deviceinfo;
    }

    //动态查询未使用的本组织的设备
    vm.refreshDeviceList = function(value) {
      vm.deviceinfoList=[];
      if(value==""){
        return;
      }

      var params = {deviceNum: value};
      return $http.get(
        DEIVCIE_FETCH_UNUSED_URL,
        {params: params}
      ).then(function(response) {
        //vm.deviceinfoList = response.data
        vm.deviceinfoList=response.data;

        if(null!=vm.machine.deviceinfo)
        vm.deviceinfoList.push(vm.oldMachine);

      });
    };

    //得到发动机类型集合
    var engineTypeData = serviceResource.restCallService(ENGINE_TYPE_LIST_URL, "QUERY");
    engineTypeData.then(function (data) {
      vm.engineTypeList = data;
    }, function (reason) {
      Notification.error('获取发动机类型失败');
    });

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

    //组织树的显示
    vm.openTreeInfo= function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.machine.org = selectedItem;
      });
    }

    //默认不是通过扫码输入
    vm.deviceNumFromScanner = false;
    vm.deviceNumContentFromScanner = '';

    //用于判断设备号输入的数据是否是通过扫码输入
    //扫码格式是 ".LG4130002690.43985.C202B5"
    vm.deviceNumInputChanged = function(deviceNum){
      if (deviceNum.length == 26){
        if (deviceNum.substring(0,1) == '.' && deviceNum.substring(13,14) == '.' && deviceNum.substring(19,20) == '.'){
          vm.deviceNumFromScanner = true;
          vm.deviceNumContentFromScanner = deviceNum.substring(20);
        }
        else{
          vm.deviceNumFromScanner = false;
          vm.deviceNumContentFromScanner = '';
        }
      }
      else{
        vm.deviceNumFromScanner = false;
        vm.deviceNumContentFromScanner = '';
      }
    }

    //更换GPS的号码
    vm.newDeviceNumFromScanner = false;
    vm.newDeviceNumContentFromScanner = '';

    //用于判断设备号输入的数据是否是通过扫码输入
    //扫码格式是 ".LG4130002690.43985.C202B5"
    vm.newDeviceNumInputChanged = function(deviceNum){
      if (deviceNum.length == 26){
        if (deviceNum.substring(0,1) == '.' && deviceNum.substring(13,14) == '.' && deviceNum.substring(19,20) == '.'){
          vm.newDeviceNumFromScanner = true;
          vm.newDeviceNumContentFromScanner = deviceNum.substring(20);
        }
        else{
          vm.newDeviceNumFromScanner = false;
          vm.newDeviceNumContentFromScanner = '';
        }
      }
      else{
        vm.newDeviceNumFromScanner = false;
        vm.newDeviceNumContentFromScanner = '';
      }
    }

    vm.ok = function (machine,newDeviceNum) {
      //TODO,为了解决提交报400错误,先人为把sim卡中包含的设备信息设为空 by riqian.ma 20160215

      var postInfo=machine;
      if (machine.deviceinfo){
        //条码输入
        if (machine.deviceinfo.deviceNum.length == 26 && vm.deviceNumFromScanner == true && vm.deviceNumContentFromScanner != null & vm.deviceNumContentFromScanner !='') {
          machine.deviceinfo.deviceNum = vm.deviceNumContentFromScanner;
        }
        postInfo.deviceinfo={deviceNum:machine.deviceinfo.deviceNum};
      }
      else{
        postInfo.deviceinfo=null;
      }
      postInfo.org={id:machine.org.id};



      //更换GPS
      if (newDeviceNum != null){
        postInfo.newDeviceNum=newDeviceNum;
      }

      var restPromise = serviceResource.restUpdateRequest(MACHINE_URL,postInfo);
      restPromise.then(function (data){
        if(data.code===0){
          if (newDeviceNum != null){
            Notification.success("更新GPS信息成功,请到新绑定GPS远程控制页面重新下发绑定命令!");
          }
          else{
            Notification.success("修改车辆信息成功!");
          }

          $uibModalInstance.close(data.content);
        }else{
          Notification.error(data.message);
        }
      },function(reason){
        vm.errorMsg=reason.data.message;
        Notification.error(reason.data.message);
      });
    };


    vm.changeGPS = function(machine,newDeviceNum){
      if (machine.deviceinfo==null||machine.deviceinfo.deviceNum == null || machine.deviceinfo.deviceNum == ''){
        Notification.warning({message: '原GPS终端号码不能为空', positionX: 'center'});
        return;
      }

      if (newDeviceNum == null){
        Notification.warning({message: '请输入要更换的GPS终端号码', positionX: 'center'});
      }
      else{
        $confirm({text: '更换GPS信息时原GPS的一次性固定秘钥将被同步至新GPS,新GPS的秘钥会被覆盖,此操作不能回退,确定要更换吗?', title: '更换GPS信息', ok: '确认', cancel: '取消'})
          .then(function () {
            vm.ok(machine,newDeviceNum);
          })
      }
    }
    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
})();
