/**
 * Created by mengwei on 17-8-7.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('incomeStatisticsController', incomeStatisticsController);

  /** @ngInject */
  function incomeStatisticsController($scope,$rootScope,$window,ngTableDefaults,NgTableParams, $location, $uibModal,$anchorScroll, serviceResource,DEVCE_HIGHTTYPE,USER_MACHINE_TYPE_URL,Notification,RENTAL_INCOME_URL,$filter,DEVCE_MF,RENTAL_ASSET_STATISTICS_DATA_URL,RENTAL_ORDER_PAGE_URL,MACHINE_PAGE_URL,DEFAULT_MINSIZE_PER_PAGE,RENTAL_INCOME_ORDER_QUERY) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.queryIncome = {};
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
      var baseBoxContainerHeight = windowHeight -50 -25 -5 - 105-10- 40 - 20-50; //50 topBar的高,5间距,25面包屑导航,5间距90msgBox高,15间距,20 search;line
      //baseBox自适应高度
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



    vm.startDateSetting = {
      //dt: "请选择开始日期",
      open: function($event) {
        vm.startDateSetting.status.opened = true;
      },
      dateOptions: {
        formatYear: 'yy',
        startingDay: 1
      },
      status: {
        opened: false
      }
    };
    // 日期控件相关
    // date picker
    vm.startDateOpenStatus = {
      opened: false
    };

    vm.startDateOpen = function ($event) {
      vm.startDateOpenStatus.opened = true;
    };

    vm.endDateOpenStatus = {
      opened: false
    };

    vm.endDateOpen = function ($event) {
      vm.endDateOpenStatus.opened = true;
    };

    var startDay = new Date();
    startDay.setDate(startDay.getDate() - 30);
    vm.startDay = startDay;
    vm.endDay = new Date();

    // vm.rentalOrder = {
    //   startDate:vm.startDay ,
    //   endDate:vm.endDay,
    //   customerName:'',
    //   workplace:''
    // }




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
    // vm.query(null,vm.startDate,vm.endDate);



    vm.queryByOrder = function (page, size, sort,rentalOrder) {
      var xAxisDate = [];
      var realComeDate = [];
      var incomeDate = [];


      vm.leftOrderListQuery  (page, size, sort, rentalOrder);


      var restCallURL = RENTAL_INCOME_ORDER_QUERY;
      restCallURL += "?startDate=" + $filter('date')(rentalOrder.startDate, 'yyyy-MM-dd');
      restCallURL += "&endDate=" + $filter('date')(rentalOrder.endDate,'yyyy-MM-dd');

      if (null != rentalOrder.customerName&&rentalOrder.customerName!="") {
        restCallURL += "&customerName="+ vm.customerName; + rentalOrder.customerName;
      }

      if (null != rentalOrder.workplace&&rentalOrder.workplace!="") {
        restCallURL += "&workplace="+ vm.workplace;
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


    vm.leftOrderListQuery = function (page, size, sort, rentalOrder) {

      var restCallURL = RENTAL_ORDER_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_MINSIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != rentalOrder) {

        if (null != rentalOrder.customerName&&rentalOrder.customerName!="") {
          restCallURL += "&search_LIKE_rentalCustomer.name=" + rentalOrder.customerName;
        }

        if (null != rentalOrder.workplace&&rentalOrder.workplace!="") {
          restCallURL += "&search_LIKE_workplace=" + rentalOrder.workplace;
        }

        if (null != rentalOrder.startDate&&rentalOrder.startDate!="") {
          restCallURL += "&search_DGTE_startDate=" + $filter('date')(rentalOrder.startDate, 'yyyy-MM-dd');
        }

        if (null != rentalOrder.endDate&&rentalOrder.endDate!="") {
          restCallURL += "&search_DLTE_endDate=" + $filter('date')(rentalOrder.endDate, 'yyyy-MM-dd');
        }

      }



      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {

        vm.tableParams = new NgTableParams({
          // initial sort order
          // sorting: { name: "desc" }
        }, {
          dataset: data.content
        });
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        vm.machineList = null;
        Notification.error("获取车辆数据失败");
      });
    };

   // vm.queryByOrder(null,null,null,rentalOrder)

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
          data: ['', '', '']
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
