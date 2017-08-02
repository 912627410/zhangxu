/**
 * Created by xielongwang on 2017/7/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalMachineMngController', rentalMachineMngController);

  /** @ngInject */
  function rentalMachineMngController($scope, $window, $location, $anchorScroll, NgTableParams, ngTableDefaults, serviceResource) {
    var vm = this;

    ngTableDefaults.params.count = 12;

    ngTableDefaults.settings.counts = [];
    //定义偏移量
    $anchorScroll.yOffset = 50;
    //定义页面的喵点
    $scope.navs = [{
      "title": "currentLocation", "icon": "fa-map"
    }, {
      "title": "currentState", "icon": "fa-signal"
    }, {
      "title": "alarmInfo", "icon": "fa-exclamation-triangle"
    }];
    //自适应高度
    var windowHeight = $window.innerHeight; //获取窗口高度

    function adjustWindow(windowHeight) {
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

    }
    adjustWindow(windowHeight);
    //初始化地图
    serviceResource.refreshMapWithDeviceInfo("homeMap", null, 4);
    /**
     * 去到某个喵点
     * @param 喵点id
     */
    vm.gotoAnchor = function (x) {
      $location.hash(x);
      $anchorScroll();
    }

    /**
     * 监听窗口大小改变后重新自适应高度
     */
    $scope.$watch('height', function(old, newv){
      barChart.resize({height : barChartHeight});
      adjustWindow(newv);
    })


    vm.simpleList = [{
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }
    ]

    vm.customConfigParams = new NgTableParams({}, {dataset: vm.simpleList});


    var barChartHeight = windowHeight - 50 - 15 - 90 - 15 - 7 - 45 - 90 - 90 + 'px';

    var barChart = echarts.init(document.getElementById('machineBarChart'),'',{width : 'auto',height : barChartHeight});

    var option = {
      color: ['#3398DB'],
      tooltip : {
        trigger: 'axis',
        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
          type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
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
          data : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        }
      ],
      yAxis : [
        {
          type : 'value'
        }
      ],
      series : [
        {
          name:'直接访问',
          type:'bar',
          barWidth: '60%',
          data:[10, 52, 200, 334, 390, 330, 220]
        }
      ]
    };

    barChart.setOption(option);


    vm.customConfigParams = new NgTableParams({}, {dataset: vm.simpleList});

  }
})();