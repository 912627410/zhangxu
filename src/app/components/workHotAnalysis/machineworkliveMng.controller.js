/**
 * Created by mengwei on 17-3-24.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineworkliveMngController', machineworkliveMngController);

  /** @ngInject */
  function machineworkliveMngController($rootScope, $scope, $http, $filter) {
    var vm = this;
    var cityName = '';
    var cityEnName = '';
    var TAI_CN = ' 台';
    var HOUR_CN = ' 小时';
    var TIMES_CN = ' 次';

    vm.startDateDeviceData = new Date();
    //date picker
    vm.startDateOpenStatusDeviceData = {
      opened: false
    };
    vm.startDateOpenDeviceData = function ($event) {
      vm.startDateOpenStatusDeviceData.opened = true;
    };
    vm.maxDate = new Date();
    vm.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };


    var myChart = echarts.init(document.getElementById('chart-panel'));
    var option = {
      title: {
        text: '车辆工作实况',
        left: 'center',
        subtextStyle: {
          fontSize: 14,
          color: '#666666'
        },
        top: 5
      },
      toolbox: {
        show: true,
        orient: 'vertical',
        top: 'center',
        right: 100,
        itemGap: 30,
        feature: {
          restore: {show: true},
          saveAsImage: {show: true}
        },
        iconStyle: {
          emphasis: {
            color: '#2F4056'
          }
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: function (params) {
          var names = params.name.split("|");
          var deviceNo = names[0];
          var addr = "";
          if (names.length > 1) {
            addr = names[1];
          }
          return "产品类型：" + params.seriesName.split(' ')[0] + "<br />"
            + "车辆编号：" + deviceNo + "<br />"
            + "地理位置：" + addr;
        }
      },
      legend: {
        orient: 'vertical',
        y: 'top',
        x: 'left'
      },
      geo: {
        map: 'china',
        label: {
          emphasis: {
            show: true
          }
        },
        // roam: true,
        // scaleLimit: {
        //   min: 0.5
        // }
      },
      series: [],
      progressive: 0, //渐进式渲染时每一帧绘制图形数量，设为 0 时不启用渐进式渲染，支持每个系列单独配置。
      hoverLayerThreshold: 10000 //图形数量阈值，决定是否开启单独的 hover 层，在整个图表的图形数量大于该阈值时开启单独的 hover 层。
    };

    var convertData = function (seriesName, mapPointList, log) {
      var avg = (log.machineTypeMap && log.machineTypeMap[seriesName]) ? log.machineTypeMap[seriesName] : 0;
      var res = [];
      for (var i = 0; i < mapPointList.length; i++) {
        if (mapPointList[i].value[2] >= avg) {
          var itemStyle1 = {normal: {opacity: 1}};
          res.push({
            name: mapPointList[i].name,
            value: mapPointList[i].value,
            itemStyle: itemStyle1
          });
        } else {
          var itemStyle2 = {normal: {opacity: 0.7}};
          res.push({
            name: mapPointList[i].name,
            value: mapPointList[i].value,
            itemStyle: itemStyle2
          });
        }
      }
      return res;
    };




    var data = {
      log:{
        activeMachineCount:3928,
        alarmCount:0,
        avgRunoffCount:17.48,
        avgWorkDuration:6.05,
        machineCount:0,
        machineTypeMap:{装载机: 6.15, 挖掘机: 5.28},
        runoffCount:68650,
        workDuration:23750.6
      },
      position:[
        {
          seriesName:"装载机",
          activeMachineCount:3465,
          activePresent:"Infinity",
          machineCount:0,
          mapPointList:[
            {
              address:"安徽省阜阳市颍州区阜阳开发区京九街道六里安置区宝龙城市广场(建设中)",
              name:"VLG0953NEF0602323|安徽省阜阳市颍州区阜阳开发区京九街道六里安置区宝龙城市广场(建设中)",
              value:[115.81904512676611, 32.87564479066392, 8],
              workDate:"2017-01-02"
            },{
              address:"云南省昭通市昭阳区靖安镇靖玉线",
              name:"VLG0933LCF0602334|云南省昭通市昭阳区靖安镇靖玉线",
              value:[103.76801930161912, 27.60616420193751, 5.4],
              workDate:"2017-01-02"
            },{
              address:"辽宁省葫芦岛市绥中县小庄子镇叼龙咀岬角",
              name:"VLG0953NKG0602328|辽宁省葫芦岛市绥中县小庄子镇叼龙咀岬角",
              value:[120.46001564046729, 40.21205942599861, 8.6],
              workDate:"2017-01-02"
            }]
        },{
          seriesName:"挖掘机",
          activeMachineCount:461,
          activePresent:"Infinity",
          machineCount:0,
          mapPointList:[{
            address:"贵州省六盘水市盘县坪地彝族乡三棵树",
            name:"VLGE606FLG0600561|贵州省六盘水市盘县坪地彝族乡三棵树",
            value:[104.52582271130437, 26.15797012217874, 2.2],
            workDate:"2017-01-02"
          },{
            address:"湖南省湘西土家族苗族自治州永顺县塔卧镇汪家寨",
            name:"VLGE608FJG0600292|湖南省湘西土家族苗族自治州永顺县塔卧镇汪家寨",
            value:[109.99884854447389, 29.185195090617313, 8.6],
            workDate:"2017-01-02"
          },{
            address:"四川省成都市新都区三河街道四川成工机电设备有限公司元贞国际机械城",
            name:"VLGE609FTG0600111|四川省成都市新都区三河街道四川成工机电设备有限公司元贞国际机械城",
            value:[104.13257437269623, 30.79051292484285, 0.1],
            workDate:"2017-01-02"
          }]
        }
      ],
      yesterdayLog:{
        activeMachineCount:3726,
        avgRunoffCount:17.22,
        avgWorkDuration:6.1,
        machineTypeMap:{装载机: 6.2, 挖掘机: 5.31},
        runoffCount:64147,
        workDuration:22713.1
      }
    }


    if (data && data.position) {
      var point = data.position;
      var legendData = [];
      var series = [];

      point.forEach(function (item, i) {
        series.push({
          name: item.seriesName + ' 活跃数: ' + item.activeMachineCount + TAI_CN,
          type: 'scatter',
          coordinateSystem: 'geo',
          data: convertData(item.seriesName, item.mapPointList, data.log),
          symbolSize: 6,
          label: {
            normal: {
              formatter: '{b}',
              position: 'right',
              show: false
            },
            emphasis: {
              show: false
            }
          }
        });
        legendData.push(item.seriesName
          //+ ' 在役数: ' + item.machineCount + TAI_CN
          + ' 活跃数: ' + item.activeMachineCount + TAI_CN);
        //+ ', 占比: ' + item.activePresent + '%');

      });

      option.title.text = ' 车辆工作实况';
      option.series = series;
      option.legend.data = legendData;

    }



    myChart.setOption(option);


    var queryWorkHotObj = {
      machineType:'',
      licenseId:'',
      startDate:''
    }
    vm.viewWorkLive = function () {

      if(vm.machine){
        queryWorkHotObj.machineType = vm.machine.machineType;
        queryObj.licenseId = vm.machine.licenseId;
      }
      if( vm.startDateDeviceData){
        queryWorkHotObj.startDate = vm.startDateDeviceData;
      }

    }

  }
})();
