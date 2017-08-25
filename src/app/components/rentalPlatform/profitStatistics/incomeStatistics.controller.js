/**
 * Created by mengwei on 17-8-7.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('incomeStatisticsController', incomeStatisticsController);

  /** @ngInject */
  function incomeStatisticsController($scope,$rootScope,$window,ngTableDefaults,NgTableParams, $location, $anchorScroll, serviceResource,DEVCE_HIGHTTYPE,USER_MACHINE_TYPE_URL,Notification,RENTAL_INCOME_URL,$filter,DEVCE_MF,RENTAL_ASSET_STATISTICS_DATA_URL,RENTAL_ORDER_PAGE_URL,MACHINE_PAGE_URL,DEFAULT_MINSIZE_PER_PAGE) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.queryIncome = {};
    vm.selectAll = false;//是否全选标志
    vm.selected = []; //选中的设备id
    vm.machineNums = [];
    vm.incomeData = [];
    var xAxisDate = [];
    var realComeDate = [];
    var incomeDate = [];
    vm.queryIncome={machineTypeId:"",
      heightTypeId:"",
      machineManufacture:""};

    /**
     * 自适应高度函数
     * @param windowHeight
     */
    vm.adjustWindow = function (windowHeight) {
      var baseBoxContainerHeight = windowHeight - 50 -105- 10 - 25 - 5  - 15 - 20;//50 topBar的高,10间距,25面包屑导航,5间距90msgBox高,15间距,20 search;line
      //baseBox自适应高度
      vm.baseBoxContainer = {
        "min-height": baseBoxContainerHeight + "px"
      }
      var baseBoxContainerHeight = baseBoxContainerHeight - 45;//地图上方的header高度
      //地图的自适应高度
      vm.baseBoxContainer = {
        "min-height": baseBoxContainerHeight + "px"
      }
      vm.baseBoxContainerHeight = baseBoxContainerHeight;
    }

    //初始化高度
    vm.adjustWindow($window.innerHeight);

    /**
     * 监听窗口大小改变后重新自适应高度
     */
    $scope.$watch('height', function (oldHeight, newHeight) {
      vm.adjustWindow(newHeight);
     // lineChart.resize({height: vm.baseBoxContainerHeight});
    })

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

    ngTableDefaults.params.count = DEFAULT_MINSIZE_PER_PAGE; //默认每页记录数
    ngTableDefaults.settings.counts = [];//默认表格设置



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
    startDate.setDate(startDate.getDate() - 30);
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


    var deviceMFUrl = DEVCE_MF + "?search_EQ_status=1";
    var deviceMFData = serviceResource.restCallService(deviceMFUrl, "GET");
    deviceMFData.then(function (data) {
      vm.machineMFList = data.content;
    }, function (reason) {
      Notification.error('获取厂商失败');
    })




    vm.queryOrder = function (page, size, sort) {
      var restCallURL = RENTAL_ORDER_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_MINSIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {

        vm.ordertableParams = new NgTableParams({
          // initial sort order
          // sorting: { name: "desc" }
        }, {
          dataset: data.content
        });
        vm.orderpage = data.page;
        vm.orderpageNumber = data.page.number + 1;
      }, function (reason) {
        vm.orderinfoList = null;
        Notification.error("获取订单数据失败");
      });
    };
    vm.queryOrder(null,null,null);

    vm.queryMachine = function (page, size, sort) {
      var restCallURL = MACHINE_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_MINSIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {

        vm.machinetableParams = new NgTableParams({
          // initial sort order
          // sorting: { name: "desc" }
        }, {
          dataset: data.content
        });
        vm.machinepage = data.page;
        vm.machinepageNumber = data.page.number + 1;
      }, function (reason) {
        vm.machineinfoList = null;
        Notification.error("获取车辆数据失败");
      });
    };

    vm.queryMachine(null,null,null);







    //income line
    var lineChart = echarts.init(document.getElementById('incomeLine'), '', {
      width: 'auto',
      height: vm.baseBoxContainerHeight - 20 + 'px'
    });
    var option = {
      title: {
        text: '收入统计'
      },
      tooltip : {
        trigger: 'axis',
        // axisPointer: {
        //   type: 'cross',
        //   label: {
        //     backgroundColor: '#6a7985'
        //   }
        // }
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
          data : xAxisDate
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
          areaStyle: {normal: {}},
          data:realComeDate
        },
        {
          name:'应收',
          type:'line',
          areaStyle: {normal: {}},
          data:incomeDate
        }
      ]
    };
    lineChart.setOption(option);




    var incomeStatisticInfo = {
      totalMachines: 0,
      totalOrders: 0,
    };
    //上方车辆和订单总数
    var rspdata = serviceResource.restCallService(RENTAL_ASSET_STATISTICS_DATA_URL, "GET");
    rspdata.then(function (data) {

      var MachineStatisticsList = data.machineStatistics;
      MachineStatisticsList.forEach(function (machineStatistics) {
        incomeStatisticInfo.totalMachines += machineStatistics.machineNumber
      })

      var RentalOrderStatisticsList = data.rentalOrderStatistics;
      RentalOrderStatisticsList.forEach(function (rentalOrderStatistics) {
        incomeStatisticInfo.totalOrders += rentalOrderStatistics.rentalOrderNumber
      })

    }, function (reason) {
      Notification.error('获取收入统计信息失败');
    })

    vm.incomeStatisticInfo = incomeStatisticInfo;

    //income query
    vm.query = function (queryIncome,startDate,endDate) {
      console.log( vm.selected );
      var xAxisDate = [];
      var realComeDate = [];
      var incomeDate = [];


      var restCallURL = RENTAL_INCOME_URL;
      restCallURL += "?startDate=" + $filter('date')(startDate,'yyyy-MM-dd');
      restCallURL += "&endDate=" + $filter('date')(endDate,'yyyy-MM-dd');
      if(null!=queryIncome){
        if(null!=queryIncome.machineTypeId&&queryIncome.machineTypeId !=""&&queryIncome.machineTypeId!=undefined){
          restCallURL += "&machineType="+ queryIncome.machineTypeId;
        }
        if(null!=queryIncome.heightTypeId&&queryIncome.heightTypeId!=""){
          restCallURL += "&heightTypeId="+ queryIncome.heightTypeId;
        }
        if(null!=queryIncome.machineManufacture&&queryIncome.machineManufacture!=""){
          restCallURL += "&machineManufacture="+ queryIncome.machineManufacture;
        }
      }

      if(vm.selected.length>0){
        restCallURL += "&orderNums="+ vm.selected;
      }


      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
        vm.incomeData = data.content;
        for(var i = 0;i<vm.incomeData.length;i++){
          xAxisDate.push($filter('date')(vm.incomeData[i].statisticalCycle, 'yyyy-MM-dd'));
          realComeDate.push(vm.incomeData[i].realIncome);
          incomeDate.push(vm.incomeData[i].accountsReceivable);
        }
        option.xAxis[0].data = xAxisDate;
        option.series[0].data = realComeDate;
        option.series[1].data = incomeDate;
        lineChart.setOption(option);
      },function (reason) {
        Notification.error("获取收入数据失败")
      })
    }
    //默认查询最近一个月
    vm.query(null,vm.startDate,vm.endDate);

    var miniChart = document.getElementsByClassName('miniChart'),
      miniChart1 = echarts.init(miniChart[0]),
      miniChart2 = echarts.init(miniChart[1]),
      miniChart3 = echarts.init(miniChart[2]),
      miniChart4 = echarts.init(miniChart[3]),
      miniOption = {
        tooltip: {
          showContent: false,
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            lineStyle:{
              color:'rgba(124, 181, 236, 0.5)'
            }
          }
        },
        grid: {
          top:'35%',
          left: '0%',
          right: '5%',
          bottom: '0%',
          containLabel: true
        },
        xAxis: {
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: 'rgba(124, 181, 236, 0.5)'
            }
          },
          axisTick: {
            show: false
          },
          data: ['上上周', '上周', '本周']
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false
          },
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: false
          }
        },
        series: {
          name: '实收',
          type: 'line',
          label: {
            emphasis: {
              show: true,
              textStyle:{
                color: 'rgba(124, 181, 236, 1)'
              },
              formatter: function(param) {
                return param.data[3];
              },
              position: 'top'
            }
          },
          itemStyle: {
            normal: {
              opacity: 0
            },
            emphasis: {
              color: 'rgba(124, 181, 236, 1)',
              borderColor: '#fff',
              borderWidth: 2,
              opacity: 1
            }
          },
          lineStyle: {
            normal: {
              width:1,
              color: 'rgba(124, 181, 236, 1)'
            }
          },
          areaStyle: {
            normal: {
              color: 'rgba(124, 181, 236, 0.25)'
            }
          },
          data: [60, 70, 100],
          smooth: true,
          smoothMonotone: 'x'
        }
      };

    miniChart1.setOption(miniOption);
    miniChart2.setOption(miniOption);
    miniChart3.setOption(miniOption);
    miniChart4.setOption(miniOption);


  }
})();
