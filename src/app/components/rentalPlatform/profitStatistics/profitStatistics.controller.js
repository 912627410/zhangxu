/**
 * Created by mengwei on 17-7-31.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('profitStatisticsController', profitStatisticsController);

  /** @ngInject */
  function profitStatisticsController($scope, $window, $location, $anchorScroll, NgTableParams, ngTableDefaults, serviceResource,DEVCE_HIGHTTYPE) {
    var vm = this;


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

    //自适应高度
    var windowHeight = $window.innerHeight; //获取窗口高度
    console.log(windowHeight)

    var profitItem= document.getElementsByClassName('profitItem');
    for(var i = 0;i<profitItem.length;i++){
      profitItem[i].style.height = windowHeight + 'px';
    }


    window.onresize = function(){
      lineChart.resize();
      topPie.resize();
      bottomPie.resize();
      profitBar.resize();

    }



    /**
     * 去到某个喵点
     * @param 喵点id
     */
    vm.gotoAnchor = function (x) {
      $location.hash(x);
      $anchorScroll();
    }


    vm.type = 'all';
    vm.typeList = ['All','剪叉','直臂','曲臂'];

    var deviceHeightTypeUrl = DEVCE_HIGHTTYPE + "?search_EQ_status=1";
    var deviceHeightTypeData = serviceResource.restCallService(deviceHeightTypeUrl, "GET");
    deviceHeightTypeData.then(function (data) {
      vm.deviceHeightTypeList = data.content;
    }, function (reason) {
      Notification.error('获取高度类型失败');
    })

    vm.Brand = 'all'
    vm.BrandList = ['brand1','brand2','brand3'];



    vm.search = function () {

    }


    //income
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
          data:['租金收入','其他收入']
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
            data : ['周一','周二','周三','周四','周五','周六','周日']
          }
        ],
        yAxis : [
          {
            type : 'value'
          }
        ],
        series : [
          {
            name:'租金收入',
            type:'line',
            stack: '总量',
            areaStyle: {normal: {}},
            data:[120, 132, 101, 134, 90, 230, 210]
          },
          {
            name:'其他收入',
            type:'line',
            stack: '总量',
            areaStyle: {normal: {}},
            data:[220, 182, 191, 234, 290, 330, 310]
          }
        ]
      };
    lineChart.setOption(option);

    //cost
    var topPie =  echarts.init(document.getElementById('topPie'));
    var topPieOption = {
      tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b}: {c} ({d}%)"
      },
      legend: {
        orient: 'vertical',
        x: 'left',
        data:['贷款额','还款额','其他']
      },
      series: [
        {
          name:'访问来源',
          type:'pie',
          selectedMode: 'single',
          radius: '60%',
          data:[
            {value:335, name:'贷款额', selected:true},
            {value:679, name:'还款额'},
            {value:1548, name:'其他'}
          ]
        }
      ]
    };
    topPie.setOption(topPieOption);

    var bottomPie = echarts.init(document.getElementById('bottomPie'));
    var bottomPieoption = {
      title : {
        text: '成本相关',
        subtext: '',
        x:'center'
      },
      tooltip : {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: ['折旧','维修','保养','配件','人工']
      },
      series : [
        {
          name: '访问来源',
          type: 'pie',
          radius : '55%',
          center: ['50%', '60%'],
          data:[
            {value:335, name:'折旧'},
            {value:310, name:'维修'},
            {value:234, name:'保养'},
            {value:135, name:'配件'},
            {value:1548, name:'人工'}
          ],
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
    bottomPie.setOption(bottomPieoption);

    //profit
    var profitBar = echarts.init(document.getElementById('profitBar'));
    var profitBarOption = {
      tooltip : {
        trigger: 'axis',
        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
          type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      legend: {
        data: ['剪叉', '直臂','曲臂']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis:  {
        type: 'value'
      },
      yAxis: {
        type: 'category',
        data: ['周一','周二','周三','周四','周五','周六','周日']
      },
      series: [
        {
          name: '剪叉',
          type: 'bar',
          stack: '总量',
          label: {
            normal: {
              show: true,
              position: 'insideRight'
            }
          },
          data: [320, 302, 301, 334, 390, 330, 320]
        },
        {
          name: '直臂',
          type: 'bar',
          stack: '总量',
          label: {
            normal: {
              show: true,
              position: 'insideRight'
            }
          },
          data: [120, 132, 101, 134, 90, 230, 210]
        },
        {
          name: '曲臂',
          type: 'bar',
          stack: '总量',
          label: {
            normal: {
              show: true,
              position: 'insideRight'
            }
          },
          data: [220, 182, 191, 234, 290, 330, 310]
        }
      ]
    };
    profitBar.setOption(profitBarOption);

  }
})();
