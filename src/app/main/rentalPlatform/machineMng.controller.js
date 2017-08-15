/**
 * Created by xielongwang on 2017/7/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalMachineMngController', rentalMachineMngController);

  /** @ngInject */
  function rentalMachineMngController($rootScope, $scope, $window, $location, $anchorScroll, NgTableParams, ngTableDefaults, languages, serviceResource, Notification, RENTAL_HOME_MAP_GPSDATA_URL, RENTAL_ALARM_MSG_URL, RENTAL_MACHINE_COUNT_URL) {
    var vm = this;
    //定义页面导航
    $scope.navs = [{
      "title": "rental", "alias": "当前位置", "icon": "fa-map"
    }, {
      "title": "rental.machineCurrentStatus", "alias": "当前状态", "icon": "fa-signal"
    }, {
      "title": "rental.machineAlarmInfo", "alias": "报警信息", "icon": "fa-exclamation-triangle"
    }];
    vm.rightBoxBottomHeight = 20;
    vm.rightBoxTopHeightTemp = 20;
    //定义报警类型,1:围栏报警 2:保养提醒 3:离线提醒(长时间未回传数据)
    vm.fenceAlarm = 0;//围栏报警
    vm.machineAlarm = 0;//车辆报警
    vm.keepAlarm = 0;//保养报警
    vm.offLineAlarm = 0;//离线报警
    //定义车辆类型数量 1:"剪叉",2:"直臂",3:"曲臂"
    vm.machineCount = 0;//总数
    vm.shearFork = 0;//剪叉
    vm.straightArm = 0;//直臂
    vm.crankArm = 0;//曲臂
    /**
     * 自适应高度函数
     * @param windowHeight
     */
    vm.adjustWindow = function (windowHeight) {
      var baseBoxContainerHeight = windowHeight - 50 - 10 - 25 - 5 - 90 - 15 - 7;//50 topBar的高,10间距,25面包屑导航,5间距90msgBox高,15间距,8 预留
      //baseBox自适应高度
      vm.baseBoxContainer = {
        "min-height": baseBoxContainerHeight + "px"
      }
      var baseBoxMapContainerHeight = baseBoxContainerHeight - 45;//地图上方的header高度
      //地图的自适应高度
      vm.baseBoxMapContainer = {
        "min-height": baseBoxMapContainerHeight + "px"
      }

      var rightBoxTopHeight = baseBoxContainerHeight / 2;
      vm.rightBoxTopHeightTemp = rightBoxTopHeight - 20;
      //地图的右边自适应高度
      vm.rightBoxTopHeight = {
        "min-height": vm.rightBoxTopHeightTemp + "px"
      }
      vm.rightBoxBottomHeight = rightBoxTopHeight;
    }
    //初始化高度
    vm.adjustWindow($window.innerHeight);
    /**
     * 初始化地图数据
     */
    vm.loadHomeDeviceData = function () {
      var rspdata = serviceResource.restCallService(RENTAL_HOME_MAP_GPSDATA_URL, "GET");
      rspdata.then(function (data) {
        vm.drawPointAggregation("homeMap", data.content, 4);
      }, function (reason) {
        Notification.error(languages.findKey('failedToGetDeviceInformation'));
      })
    }
    /**
     * 点聚合绘制
     * @param mapId 页面上地图的id
     * @param pointArray 点集合
     * @param zone 缩放级别
     * @param
     */
    vm.drawPointAggregation = function (mapId, pointArray, zone) {
      //点聚合方式和自定义弹出框
      serviceResource.refreshMapWithDeviceInfo(mapId, pointArray, zone, [104.06, 30.83], true, function () {

      });
    };
    //加载地图设备数据
    vm.loadHomeDeviceData();
    /**
     * 监听窗口大小改变后重新自适应高度
     */
    $scope.$watch('height', function (oldHeight, newHeight) {
      vm.adjustWindow(newHeight);
      barChart.resize({height: vm.rightBoxBottomHeight});
    })
    /**
     * 根据类型获取报警信息的数量
     * @param type
     */
    vm.getAlarmCountByType = function (alarmType) {
      if (alarmType == 4) {//车辆报警单独处理

        return;
      }

      var url = RENTAL_ALARM_MSG_URL + "?alarmType=" + alarmType;
      var respData = serviceResource.restCallService(url, "GET");
      respData.then(function (data) {
        var msgNum = data.content;
        if (alarmType == 1) {
          vm.fenceAlarm = msgNum;
        }
        if (alarmType == 2) {
          vm.keepAlarm = msgNum;//保养报警
        }
        if (alarmType == 3) {
          vm.offLineAlarm = msgNum;//离线报警
        }
      }, function (reason) {
        Notification.error("获取信息失败");
      })
    }
    vm.getAlarmCountByType(1);//围栏报警
    vm.getAlarmCountByType(2);//保养提醒
    vm.getAlarmCountByType(3);//离线提醒
    vm.getAlarmCountByType(4);//车辆报警
    /**
     * 根据车辆类型获取车辆数量
     * @param machineType
     */
    vm.getMachineCountByType = function (machineType) {
      var url = RENTAL_MACHINE_COUNT_URL;
      if (machineType) {
        url = url + "?type=" + machineType;
      }
      var respData = serviceResource.restCallService(url, "GET");
      respData.then(function (data) {
        var msgNum = data.content;
        if (machineType==undefined || machineType==null){
          vm.machineCount=msgNum;
        }
        if (machineType == 1) {
          vm.shearFork = msgNum;//剪叉
        }
        if (machineType == 2) {
          vm.straightArm = msgNum;//直臂
        }
        if (machineType == 3) {
          vm.crankArm = msgNum;//曲臂
        }
      }, function (reason) {
        Notification.error("获取信息失败");
      })

    }
    vm.getMachineCountByType(1);//剪叉
    vm.getMachineCountByType(2);//直臂
    vm.getMachineCountByType(3);//曲臂
    vm.getMachineCountByType();//总数
    /**
     * 名称转到某个视图
     * @param view 视图名称
     */
    vm.gotoView = function (view) {
      $rootScope.$state.go(view);
    }

    var barChart = echarts.init(document.getElementById('machineBarChart'), '', {
      width: 'auto',
      height: vm.rightBoxBottomHeight - 20 + 'px'
    });

    var option = {
      color: ['#3398DB'],
      backgroundColor: '#ffffff',
      tooltip: {
        trigger: 'axis',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
          type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [
        {
          name: '直接访问',
          type: 'bar',
          barWidth: '60%',
          data: [10, 52, 200, 334, 390, 330, 220]
        }
      ]
    };
    barChart.setOption(option);

    var homePie = echarts.init(document.getElementById('homePie'), '', {
      width: 'auto',
      height: vm.rightBoxBottomHeight - 10 + 'px'
    });
    var homePieoption = {
      tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b}: {c} ({d}%)"
      },
      series: [
        {
          name: '访问来源',
          type: 'pie',
          selectedMode: 'single',
          radius: [0, '30%'],

          label: {
            normal: {
              position: 'inner'
            }
          },
          labelLine: {
            normal: {
              show: false
            }
          },
          data: [
            {value: 335, name: '直达', selected: true},
            {value: 679, name: '营销广告'},
            {value: 1548, name: '搜索引擎'}
          ]
        },
        {
          name: '访问来源',
          type: 'pie',
          radius: ['40%', '55%'],

          data: [
            {value: 335, name: '直达'},
            {value: 310, name: '邮件营销'},
            {value: 234, name: '联盟广告'},
            {value: 135, name: '视频广告'},
            {value: 1048, name: '百度'},
            {value: 251, name: '谷歌'},
            {value: 147, name: '必应'},
            {value: 102, name: '其他'}
          ]
        }
      ]
    };
    homePie.setOption(homePieoption);

    var middlePicBox = document.getElementsByClassName('middlePicBox')[0];
    middlePicBox.style.height = vm.rightBoxTopHeightTemp - 10 + 'px';

    var machineNumlis = document.getElementsByClassName('machineNumlis');
    var lineHeight = vm.rightBoxTopHeightTemp - 30;
    machineNumlis[0].style.lineHeight = (lineHeight / 3) + 'px';
    machineNumlis[1].style.lineHeight = (lineHeight / 3) + 'px';
    machineNumlis[2].style.lineHeight = (lineHeight / 3) + 'px';


    /**
     * miniMap
     */

    var miniMap = document.getElementsByClassName('miniMap'),
      miniMap1 = echarts.init(miniMap[0]),
      miniMap2 = echarts.init(miniMap[1]),
      miniMap3 = echarts.init(miniMap[2]),
      miniMap4 = echarts.init(miniMap[3]),
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
          top:'25%',
          left: '-10%',
          right: '6%',
          bottom: '-16%',
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
          axisLabel: {
            show:false
          },
          data: ['8月01日', '8月02日', '8月03日', '8月04日', '8月05日', '8月06日', '8月07日']
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
          data: [60, 70, 100, 150, 200, 220, 220],
          smooth: true,
          smoothMonotone: 'x'
        }
      };

    miniMap1.setOption(miniOption);
    miniMap2.setOption(miniOption);
    miniMap3.setOption(miniOption);
    miniMap4.setOption(miniOption);

  }
})();
