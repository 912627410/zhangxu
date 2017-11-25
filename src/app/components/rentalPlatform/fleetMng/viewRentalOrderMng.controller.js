/**
 * Created by riqian.ma on 1/8/17.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('viewRentalOrderController', viewRentalOrderController);

  /** @ngInject */
  function viewRentalOrderController($rootScope,$window,$stateParams,$uibModalInstance,serviceResource,RENTAL_ORDER_URL, retalOrderTotalVo,Notification,RENTAL_ORDER_MACHINE_HISTORY_URL,NgTableParams) {
    var vm = this;
    vm.jcOption = {
      deviceType :{id:1}
    }
    vm.qbOption = {
      deviceType :{id:2}
    }
    vm.zbOption = {
      deviceType :{id:3}
    }
    vm.retalOrderTotalVo=retalOrderTotalVo;
    vm.rentalOrder = vm.retalOrderTotalVo.orderVo;
    vm.orderMachineTypeVoList=vm.retalOrderTotalVo.orderMachineTypeVoList;
    for(var i = 0;i<vm.orderMachineTypeVoList.length;i++){
      if(vm.orderMachineTypeVoList[i].deviceType.id ==1){
        vm.jcOption = vm.orderMachineTypeVoList[i]
      }
      if(vm.orderMachineTypeVoList[i].deviceType.id ==2){
        vm.qbOption = vm.orderMachineTypeVoList[i]
      }
      if(vm.orderMachineTypeVoList[i].deviceType.id ==3){
        vm.zbOption = vm.orderMachineTypeVoList[i]
      }
    }
    //订单下车辆List查询
    vm.carlist = function (sort, id) {
      var restCallURL = RENTAL_ORDER_MACHINE_HISTORY_URL;
      var sortUrl = sort || "id,desc";
      restCallURL += "?sort=" + sortUrl;
      restCallURL += "&id="+id;

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {

        vm.tableParams = new NgTableParams({
          // initial sort order
          // sorting: { name: "desc" }
        }, {
          dataset: data.content
        });
      }, function (reason) {
        Notification.error(languages.findKey('faGetWorkData'));
      });
    };
    vm.carlist(null,vm.rentalOrder.id);


    // vm.rentalOrder={};



    var path="/rental/order";
    vm.operatorInfo =$rootScope.userInfo;
    vm.back = function () {
      $uibModalInstance.dismiss('cancel');

    };


    vm.rightBoxBottomHeight=20;
    vm.rightBoxTopHeightTemp=20;
    /**
     * 自适应高度函数
     * @param windowHeight
     */
    vm.adjustWindow = function (windowHeight) {
      var baseBoxContainerHeight = windowHeight - 50 - 10 -25 -5 - 90 - 15 - 7;//50 topBar的高,10间距,25面包屑导航,5间距90msgBox高,15间距,8 预留
      //baseBox自适应高度
      vm.baseBoxContainer = {
        "min-height": baseBoxContainerHeight + "px"
      }
      var baseBoxMapContainerHeight = baseBoxContainerHeight - 45;//地图上方的header高度
      //地图的自适应高度
      vm.baseBoxMapContainer = {
        "min-height": baseBoxMapContainerHeight + "px"
      }

      var rightBoxTopHeight=baseBoxContainerHeight/2;
      vm.rightBoxTopHeightTemp=rightBoxTopHeight-20;
      //地图的右边自适应高度
      vm.rightBoxTopHeight = {
        "min-height": vm.rightBoxTopHeightTemp+ "px"
      }
      vm.rightBoxBottomHeight=rightBoxTopHeight;
    }
    //初始化高度
    vm.adjustWindow($window.innerHeight);



    //查询要修改的客户信息
    vm.getOrder=function(){
      var id=$stateParams.id;
      var url=RENTAL_ORDER_URL+"?id="+id;
      var rspdata = serviceResource.restCallService(url,"GET");

      rspdata.then(function (data) {

        vm.rentalOrder = data.content.orderVo;
        vm.orderMachineTypeVoList = data.content.orderMachineTypeVoList;
        for(var i = 0;i<vm.orderMachineTypeVoList.length;i++){
          if(vm.orderMachineTypeVoList[i].deviceType.id == 1){
            vm.jcOption = vm.orderMachineTypeVoList[i]
          }
          if(vm.orderMachineTypeVoList[i].deviceType.id == 2){
            vm.zbOption = vm.orderMachineTypeVoList[i]
          }
          if(vm.orderMachineTypeVoList[i].deviceType.id == 3){
            vm.qbOption = vm.orderMachineTypeVoList[i]
          }
        }


      },function (reason) {
        Notification.error(reason.data.message);
      })

    }

    //vm.getOrder();


  }
})();
