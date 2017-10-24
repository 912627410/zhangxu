/**
 * Created by mengwei on 17-8-7.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('incomeStatisticsController', incomeStatisticsController);

  /** @ngInject */
  function incomeStatisticsController($scope,$rootScope,$window,ngTableDefaults,NgTableParams,$uibModal, $location,$anchorScroll, serviceResource,DEVCE_HIGHTTYPE,MACHINE_DEVICETYPE_URL,Notification,$filter,DEVCE_MF,RENTAL_ORDER_PAGE_URL,DEFAULT_MINSIZE_PER_PAGE,RENTAL_INCOME_ORDER_QUERY,RENTAL_MACHINEINCOME_PAGE_URL,RENTAL_INCOME_MACHINE_QUERY,RENTAL_TOTALINCOME_URL,languages) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.queryIncome = {};
    vm.incomeData = [];
    var xAxisDate = [];
    var realComeDate = [];
    var incomeDate = [];
    vm.pageSize = 10;
    vm.queryIncome={machineType:"",
      heightType:"",
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

    vm.totalIncome = 0;
    vm.jcTotalIncome =0;
    vm.zbTotalIncome = 0;
    vm.qbTotalIncome = 0;

    vm.queryIncomeByType = function () {

      var incomeTotalURL = RENTAL_TOTALINCOME_URL ;
      var incomeTotalData = serviceResource.restCallService(incomeTotalURL, "GET");
      incomeTotalData.then(function (data) {
        vm.incomeTotalData = data.content;
        for(var i = 0;i<vm.incomeTotalData.length;i++){
          if( vm.incomeTotalData[i].devicetypeid==1){
            vm.jcTotalIncome = vm.incomeTotalData[i].totalRevenue;
          }
          if( vm.incomeTotalData[i].devicetypeid==2){
            vm.zbTotalIncome = vm.incomeTotalData[i].totalRevenue;
          }
          if( vm.incomeTotalData[i].devicetypeid==3){
            vm.qbTotalIncome = vm.incomeTotalData[i].totalRevenue;
          }

        }
        vm.totalIncome = vm.jcTotalIncome + vm.zbTotalIncome + vm.qbTotalIncome;

      }, function (reason) {
        Notification.error('获取失败');
      })

    }
    vm.queryIncomeByType();



    //开始时间,结束时间
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    vm.startDate = startDate;
    vm.endDate = new Date();

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

    vm.startDateOpenDeviceData1 = function ($event) {
      vm.startDateOpenStatusDeviceData.opened = true;
    };
    vm.endDateOpenDeviceData1 = function ($event) {
      vm.endDateOpenStatusDeviceData.opened = true;
    };

    vm.maxDate = new Date();
    vm.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };

    /**
     * 得到机器类型集合
     */
    var machineTypeData = serviceResource.restCallService(MACHINE_DEVICETYPE_URL, "GET");
    machineTypeData.then(function (data) {
      vm.machineTypeList = data.content;
    }, function (reason) {
      Notification.error(languages.findKey('rentalGetDataError'));
    })

    //查询高度类型
    var deviceHeightTypeUrl = DEVCE_HIGHTTYPE + "?search_EQ_status=1";
    var deviceHeightTypeData = serviceResource.restCallService(deviceHeightTypeUrl, "GET");
    deviceHeightTypeData.then(function (data) {
      vm.deviceHeightTypeList = data.content;
    }, function (reason) {
      Notification.error('获取高度类型失败');
    })


    //查询厂商List
    var deviceMFUrl = DEVCE_MF + "?search_EQ_status=1";
    var deviceMFData = serviceResource.restCallService(deviceMFUrl, "GET");
    deviceMFData.then(function (data) {
      vm.machineMFList = data.content;
    }, function (reason) {
      Notification.error('获取厂商失败');
    })


    //选择订单客户
    vm.selectCustomer = function (size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/rentalPlatform/fleetMng/rentalCustomerListMng.html',
        controller: 'customerListController as customerListCtrl',
        size: size,
        backdrop: false,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          }
        }
      });

      modalInstance.result.then(function (result) {
        vm.rentalOrder.rentalCustomer=result;
        console.log(result)
      }, function () {
      });
    };


    //切换查询类型
    vm.orderQuery = true;
    vm.machineQuery = false;
    vm.change = function (queryType) {
       if(queryType==1){
         vm.orderQuery = true;
         vm.machineQuery = false;
       }
       if(queryType==2){
         vm.orderQuery = false;
         vm.machineQuery = true;
       }
    }

   //重置搜索框
   vm.reset = function () {
     vm.rentalOrder= null;
     vm.rentalMachine = null;
   }


    //收入统计右侧折线图
    var lineChart = echarts.init(document.getElementById('incomeLine'), '', {
      width: 'auto',
      height: vm.baseBoxContainerHeight - 20 + 'px'
    });
    var option = {
      title: {
        text: languages.findKey('incomeStatistics')
      },
      tooltip : {
        trigger: 'axis'
      },
      legend: {
        data:[languages.findKey('rentalIncomeReceived'),languages.findKey('rentalIncomeReceivable')]
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
          name:languages.findKey('rentalIncomeReceived'),
          type:'line',
          areaStyle: {normal: {}},
          data:realComeDate
        },
        {
          name:languages.findKey('rentalIncomeReceivable'),
          type:'line',
          areaStyle: {normal: {}},
          data:incomeDate
        }
      ]
    };
    lineChart.setOption(option);


   //根据订单参数进行收入统计
    vm.queryByOrder = function (page, size, sort,rentalOrder) {
      if(vm.startDate==null||vm.endDate==null){
        Notification.error("请选择开始时间或者结束时间");
        return;
      }
      vm.leftOrderListQuery  (page, size, sort, rentalOrder);
      vm.rightDataQueryByOrder(rentalOrder);
    }

    //左侧订单表格
    vm.leftOrderListQuery = function (page, size, sort, rentalOrder) {

      var restCallURL = RENTAL_ORDER_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_MINSIZE_PER_PAGE || vm.pageSize;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != rentalOrder) {

        if (null != rentalOrder.rentalCustomer.name&&rentalOrder.rentalCustomer.name!="") {
          restCallURL += "&search_LIKE_rentalCustomer.name=" + rentalOrder.rentalCustomer.name;
        }

        if (null != rentalOrder.workplace&&rentalOrder.workplace!="") {
          restCallURL += "&search_LIKE_location=" + rentalOrder.workplace;
        }

        //订单状态为结束的订单
        restCallURL += "&search_EQ_status=" + '3';
      }
      if (null != vm.startDate&&vm.startDate!="") {
        restCallURL += "&search_DGT_endDate=" + $filter('date')(vm.startDate, 'yyyy-MM-dd');
      }

      if (null != vm.endDate&&vm.endDate!="") {
        restCallURL += "&search_DLT_endDate=" + $filter('date')(vm.endDate, 'yyyy-MM-dd');
      }

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
        vm.orderIncometableParams = new NgTableParams({

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
    //右侧根据订单统计的收入数据
    vm.rightDataQueryByOrder = function (rentalOrder) {
      var xAxisDate = [];
      var realComeDate = [];
      var incomeDate = [];
      var restCallURL = RENTAL_INCOME_ORDER_QUERY;
      restCallURL += "?startDate=" + $filter('date')(vm.startDate, 'yyyy-MM-dd');
      restCallURL += "&endDate=" + $filter('date')(vm.endDate,'yyyy-MM-dd');
      if (null != rentalOrder) {

        if (null != rentalOrder.rentalCustomer.id&&rentalOrder.rentalCustomer.id!="") {
          restCallURL += "&customerId="+ rentalOrder.rentalCustomer.id;
        }

        if (null != rentalOrder.workplace&&rentalOrder.workplace!="") {
          restCallURL += "&workplace="+ vm.workplace;
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
        Notification.error("按订单参数查询获取收入数据失败")
      })
    }


    //根据车辆参数进行收入统计
    vm.queryByMachine = function (page, size, sort,rentalMachine) {
      if(vm.startDate==null||vm.endDate==null){
        Notification.error("请选择开始时间或者结束时间");
        return;
      }
      vm.leftMachineListQuery (page, size, sort, rentalMachine);
      vm.rightDataQueryByMachine(rentalMachine);

    }
    //左侧车辆表格
    vm.leftMachineListQuery = function (page, size, totalElements, rentalMachine) {

      var restCallURL = RENTAL_MACHINEINCOME_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || vm.pageSize;
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl ;
      if (totalElements != null || totalElements != undefined) {
        restCallURL += "&totalElements=" + totalElements;
      }
      restCallURL += "&startDate=" + $filter('date')(vm.startDate, 'yyyy-MM-dd');
      restCallURL += "&endDate=" + $filter('date')(vm.endDate,'yyyy-MM-dd');
      if (null != rentalMachine) {

        if (null != rentalMachine.machineType&&rentalMachine.machineType!="") {
          restCallURL += "&machineType=" + rentalMachine.machineType;
        }

        if (null != rentalMachine.heightType&&rentalMachine.heightType!="") {
          restCallURL += "&heightTypeId=" + rentalMachine.heightType.id;
        }

        if (null != rentalMachine.machineManufacture&&rentalMachine.machineManufacture!="") {
          restCallURL += "&machineManufacture=" + rentalMachine.machineManufacture.id
        }
      }

        var rspData = serviceResource.restCallService(restCallURL, "GET");
        rspData.then(function (data) {

          vm.machineIncometableParams = new NgTableParams({
            // initial sort order
            // sorting: { name: "desc" }
          }, {
            dataset: data.content
          });
          vm.machineTotalElements = data.totalElements;
          vm.pageNumber =  data.number + 1;
        }, function (reason) {
          vm.machineList = null;
          Notification.error("获取车辆数据失败");
        });


    }
    //右侧根据车辆统计的收入数据
    vm.rightDataQueryByMachine = function (rentalMachine) {
      var xAxisDate = [];
      var realComeDate = [];
      var incomeDate = [];
      var restCallURL = RENTAL_INCOME_MACHINE_QUERY;
      restCallURL += "?startDate=" + $filter('date')(vm.startDate, 'yyyy-MM-dd');
      restCallURL += "&endDate=" + $filter('date')(vm.endDate,'yyyy-MM-dd');

      if (null != rentalMachine) {

        if (null != rentalMachine.machineType&&rentalMachine.machineType!="") {
          restCallURL += "&machineType=" +rentalMachine.machineType;
        }

        if (null != rentalMachine.heightType&&rentalMachine.heightType!="") {
          restCallURL += "&heightTypeId=" +rentalMachine.heightType.id;
        }

        if (null != rentalMachine.machineManufacture&&rentalMachine.machineManufacture!="") {
          restCallURL += "&machineManufacture=" +rentalMachine.machineManufacture.id;
        }
      }

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
        vm.incomeData = data.content;
        for(var i = 0;i<vm.incomeData.length;i++){
          xAxisDate.push($filter('date')(vm.incomeData[i].statisticalCycle, 'yyyy-MM-dd'));
          realComeDate.push(vm.incomeData[i].realIncome.toFixed(2));
          incomeDate.push(vm.incomeData[i].accountsReceivable.toFixed(2));
        }
        option.xAxis[0].data = xAxisDate;
        option.series[0].data = realComeDate;
        option.series[1].data = incomeDate;
        lineChart.setOption(option);
      },function (reason) {
        Notification.error("按车辆参数查询获取收入数据失败")
      })
    }

    //上方四个曲线图
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
          name: languages.findKey('rentalIncomeReceived'),
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
