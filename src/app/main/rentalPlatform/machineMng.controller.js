/**
 * Created by xielongwang on 2017/7/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalMachineMngController', rentalMachineMngController);

  /** @ngInject */
  function rentalMachineMngController($rootScope, $scope, $window, $location, $anchorScroll, NgTableParams, ngTableDefaults, languages, serviceResource, Notification, RENTAL_HOME_MAP_GPSDATA_URL, AMAP_GEO_CODER_URL) {
    var vm = this;
    //定义页面导航
    $scope.navs = [{
      "title": "rental", "alias": "当前位置", "icon": "fa-map"
    }, {
      "title": "rental.machineCurrentStatus", "alias": "当前状态", "icon": "fa-signal"
    }, {
      "title": "rental.machineAlarmInfo", "alias": "报警信息", "icon": "fa-exclamation-triangle"
    }];
    vm.rightBoxBottomHeight=20;
    /**
     * 自适应高度函数
     * @param windowHeight
     */
    vm.adjustWindow = function (windowHeight) {
      var baseBoxContainerHeight = windowHeight - 50 - 15 - 90 - 15 - 7;//50 topBar的高,15间距,90msgBox高,15间距,8 预留
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
      //地图的右边自适应高度
      vm.rightBoxTopHeight = {
        "min-height": rightBoxTopHeight-20 + "px"
      }
      vm.rightBoxBottomHeight=rightBoxTopHeight;
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
      serviceResource.refreshMapWithDeviceInfo(mapId,pointArray,zone,[104.06,30.83],true,function () {

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

      return 0;
    }

    /**
     * 名称转到某个视图
     * @param view 视图名称
     */
    vm.gotoView = function (view) {
      $rootScope.$state.go(view);
    }

    var barChart = echarts.init(document.getElementById('machineBarChart'), '', {
      width: 'auto',
      height: vm.rightBoxBottomHeight -20+ 'px'
    });

    var option = {
      color: ['#3398DB'],
      backgroundColor:'#ffffff',
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
      height: vm.rightBoxBottomHeight -10+ 'px'
    });
    var homePieoption = {
      tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b}: {c} ({d}%)"
      },
      series: [
        {
          name:'访问来源',
          type:'pie',
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
          data:[
            {value:335, name:'直达', selected:true},
            {value:679, name:'营销广告'},
            {value:1548, name:'搜索引擎'}
          ]
        },
        {
          name:'访问来源',
          type:'pie',
          radius: ['40%', '55%'],

          data:[
            {value:335, name:'直达'},
            {value:310, name:'邮件营销'},
            {value:234, name:'联盟广告'},
            {value:135, name:'视频广告'},
            {value:1048, name:'百度'},
            {value:251, name:'谷歌'},
            {value:147, name:'必应'},
            {value:102, name:'其他'}
          ]
        }
      ]
    };
    homePie.setOption(homePieoption);

    var middlePicBox = document.getElementsByClassName('middlePicBox')[0];
    middlePicBox.style.height = vm.rightBoxBottomHeight -10+ 'px';
    console.log(vm.rightBoxBottomHeight)

    var machineNumlis = document.getElementsByClassName('machineNumlis');
    var lineHeight = vm.rightBoxBottomHeight -30 ;
    machineNumlis[0].style.lineHeight = (lineHeight/3) + 'px';
    machineNumlis[1].style.lineHeight = (lineHeight/3) + 'px';
    machineNumlis[2].style.lineHeight = (lineHeight/3) + 'px';

  }
})();
