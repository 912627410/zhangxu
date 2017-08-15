/**
 * Created by mengwei on 17-8-7.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('incomeStatisticsController', incomeStatisticsController);

  /** @ngInject */
  function incomeStatisticsController($scope,$rootScope, $window,ngTableDefaults,NgTableParams,DEFAULT_SIZE_PER_PAGE, $location, $anchorScroll, serviceResource,DEVCE_HIGHTTYPE,USER_MACHINE_TYPE_URL,Notification,RENTAL_INCOME_URL,$filter,DEVCE_MF,RENTAL_ASSET_STATISTICS_DATA_URL) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.queryIncome = {};
    vm.selectAll = false;//是否全选标志
    vm.selected = []; //选中的设备id


    //定义偏移量
    $anchorScroll.yOffset = 50;
    //定义页面的喵点
    $scope.navs = [{
      "title": "income", "icon": "fa-map"
    }, {
      "title": "Cost", "icon": "fa-signal"
    }, {
      "title": "profit", "icon": "fa-exclamation-triangle"
    }];

    /**
     * 去到某个喵点
     * @param 喵点id
     */
    vm.gotoAnchor = function (x) {
      $location.hash(x);
      $anchorScroll();
    }

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE; //默认每页记录数
    ngTableDefaults.settings.counts = [];//默认表格设置

    vm.orderinfoList = [{id:1,name:"order1"},
                       {id:2,name:"order2"},
                       {id:3,name:"order3"},
                       {id:4,name:"order4"},
                       {id:5,name:"order5"},
                       {id:6,name:"order6"}]
    vm.ordertableParams = new NgTableParams({}, {dataset: vm.orderinfoList});

    vm.machineinfoList = [{id:11,name:"machine1"},
        {id:22,name:"machine2"},
        {id:33,name:"machine3"},
        {id:44,name:"machine4"},
        {id:55,name:"machine5"},
        {id:66,name:"machine6"}]
    vm.machinetableParams =new NgTableParams({}, {dataset: vm.machineinfoList});

    //订单号和车号复选框多选与全选
    var updateSelected = function (action, id) {
      if (action == 'add' && vm.selected.indexOf(id) == -1) {
        vm.selected.push(id);
      }
      if (action == 'remove' && vm.selected.indexOf(id) != -1) {
        var idx = vm.selected.indexOf(id);
        vm.selected.splice(idx, 1);

      }
    }
    vm.updateSelection = function ($event, id, status) {
      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      updateSelected(action, id);
    }

    vm.updateOrderAllSelection = function ($event) {
      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      vm.ordertableParams.data.forEach(function (deviceinfo) {
        updateSelected(action, deviceinfo.id);
      })

    }

    vm.updateMachineAllSelection = function ($event) {
      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      // alert(action);
      vm.machinetableParams.data.forEach(function (machineInfo) {
        updateSelected(action, machineInfo.id);
      })
    }

    vm.isSelected = function (id) {
      return vm.selected.indexOf(id) >= 0;
    }
    vm.Orderchecked = function () {
      var operStatus = false;
      if (vm.selectAll) {
        operStatus = false;
        vm.selectAll = false;
      } else {
        operStatus = true;
        vm.selectAll = true;
      }

      vm.ordertableParams.data.forEach(function (orderInfo) {
        orderInfo.checked = operStatus;
      })
    }
    vm.machinechecked = function () {
      var operStatus = false;
      if (vm.selectAll) {
        operStatus = false;
        vm.selectAll = false;
      } else {
        operStatus = true;
        vm.selectAll = true;
      }

      vm.tableParams.data.forEach(function (machineInfo) {
        machineInfo.checked = operStatus;
      })
    }


    //开始时间与结束时间
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
    vm.startDate = startDate;
    vm.endDate = new Date();

    vm.startDateDeviceData = startDate;
    vm.endDateDeviceData = new Date();

    //date picker
    vm.startDateOpenStatusDeviceData = {
      opened: false
    };
    vm.endDateOpenStatusDeviceData = {
      opened: false
    };

    vm.startDateOpenDeviceData = function ($event) {
      vm.startDateOpenStatusDeviceData.opened = true;
    };
    vm.endDateOpenDeviceData = function ($event) {
      vm.endDateOpenStatusDeviceData.opened = true;
    };

    vm.maxDate = new Date();
    vm.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };





    vm.type = 'all';
    vm.typeList = ['All','剪叉','直臂','曲臂'];

    var deviceHeightTypeUrl = DEVCE_HIGHTTYPE + "?search_EQ_status=1";
    var deviceHeightTypeData = serviceResource.restCallService(deviceHeightTypeUrl, "GET");
    deviceHeightTypeData.then(function (data) {
      vm.deviceHeightTypeList = data.content;
    }, function (reason) {
      Notification.error('获取高度类型失败');
    })

    //查询当前用户拥有的车辆类型明细
    vm.getMachineType = function(){
      var restCallURL = USER_MACHINE_TYPE_URL;
      if(vm.operatorInfo){
        restCallURL += "?orgId="+ vm.operatorInfo.userdto.organizationDto.id;
      }
      var rspData = serviceResource.restCallService(restCallURL, "QUERY");
      rspData.then(function (data) {
        if(data.length>0){
          vm.machineTypeList = data;
        } else {
          //在用户的所在组织不存在车辆类型时,默认查询其上级组织拥有的车辆类型
          if(vm.operatorInfo){
            var restCallURL1 = USER_MACHINE_TYPE_URL;
            restCallURL1 += "?orgId="+ vm.operatorInfo.userdto.organizationDto.parentId;
          }
          var rspData1 = serviceResource.restCallService(restCallURL1, "QUERY");
          rspData1.then(function (data1) {
            vm.machineTypeList = data1;
          });
        }
      }, function (reason) {
        vm.machineList = null;
        Notification.error("获取车辆类型数据失败");
      });
    }
    vm.getMachineType();



    // var machineMFUrl = MACHINE_MF + "?search_EQ_status=1";
    // var machineMFData = serviceResource.restCallService(machineMFUrl, "GET");
    // machineMFData.then(function (data) {
    //   vm.machineMFList = data.content;
    // }, function (reason) {
    //   Notification.error('获取厂商失败');
    // })

    var deviceMFUrl = DEVCE_MF + "?search_EQ_status=1";
    var deviceMFData = serviceResource.restCallService(deviceMFUrl, "GET");
    deviceMFData.then(function (data) {
      vm.machineMFList = data.content;
    }, function (reason) {
      Notification.error('获取厂商失败');
    })

    vm.Brand = 'all'
    vm.BrandList = ['brand1','brand2','brand3'];


    //income query
    vm.query = function (queryIncome) {
      console.log( vm.selected )
      var restCallURL = RENTAL_INCOME_URL;
      restCallURL += "?startDate=" + $filter('date')(vm.startDate,'yyyy-MM-dd');
      restCallURL += "&endDate=" + $filter('date')(vm.endDate,'yyyy-MM-dd');
      if(null!=queryIncome.machineTypeId&&queryIncome.machineTypeId !=""&&queryIncome.machineTypeId!=undefined){
        restCallURL += "&machineType="+ queryIncome.machineTypeId;
      }
      if(null!=queryIncome.heightTypeId&&queryIncome.heightTypeId!=""){
        restCallURL += "&heightTypeId="+ queryIncome.heightTypeId;
      }
      if(null!=queryIncome.machineManufacture&&queryIncome.machineManufacture!=""){
        restCallURL += "&brand="+ queryIncome.machineManufacture;
      }


      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
        vm.incomeData = data;
      },function (reason) {
        Notification.error("获取收入数据失败")
      })

    }


    //income line
    var lineChart = echarts.init(document.getElementById('incomeLine'));
    var option = {
      title: {
        text: '收入统计'
      },
      tooltip : {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      legend: {
        data:['实收','应收']
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis : [
        {
          type : 'category',
          boundaryGap : false,
          data : ['第一周','第二周','第三周','第四周','第五周','第六周']
        }
      ],
      yAxis : [
        {
          type : 'value'
        }
      ],
      series : [
        {
          name:'实收',
          type:'line',
          stack: '总量',
          areaStyle: {normal: {}},
          data:[120, 132, 101, 134, 90, 230]
        },
        {
          name:'应收',
          type:'line',
          stack: '总量',
          areaStyle: {normal: {}},
          data:[220, 182, 191, 234, 290, 330]
        }
      ]
    };
    lineChart.setOption(option);

    window.onresize = function(){
      lineChart.resize();
    }
    var incomeStatisticInfo = {
      totalMachines: 0,
      totalOrders: 0,
    };

    var rspdata = serviceResource.restCallService(RENTAL_ASSET_STATISTICS_DATA_URL, "GET");
    rspdata.then(function (data) {

      var MachineStatisticsList = data.machineStatistics;
      MachineStatisticsList.forEach(function (machineStatistics) {
        incomeStatisticInfo.totalMachines += machineStatistics.machineNumber
      })
      console.log(incomeStatisticInfo.totalMachines);
      var RentalOrderStatisticsList = data.rentalOrderStatistics;
      RentalOrderStatisticsList.forEach(function (rentalOrderStatistics) {
        incomeStatisticInfo.totalOrders += rentalOrderStatistics.rentalOrderNumber
      })
      console.log(incomeStatisticInfo.totalOrders);
    }, function (reason) {
      Notification.error('获取收入统计信息失败');
    })

    vm.incomeStatisticInfo = incomeStatisticInfo;


  }
})();
