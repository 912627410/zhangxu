/**
 * Created by mengwei on 17-3-10.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineworkreportMngController', machineworkreportMngController);

  /** @ngInject */
  function machineworkreportMngController($rootScope, $scope, $http, $filter,NgTableParams,ngTableDefaults,DEFAULT_SIZE_PER_PAGE) {
    var vm = this;
    vm.hourGap = 4;
    vm.selected = []; //选中的省份id

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE; //默认每页记录数
    ngTableDefaults.settings.counts = [];//默认表格设置

    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 5);
    vm.startDate = startDate;
    var endDate = new Date();

    vm.startDateDeviceData = startDate;
    vm.endDateDeviceData = endDate;

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




      var myChart = echarts.init(document.getElementById('chart-map-panel'));

      var option = {
        title: {
          text: '车辆工作报告',
          left: 'center'
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
        toolbox: {
          show: true,
          orient: 'vertical',
          top: 'center',
          right: 20,
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
          roam: true,
          scaleLimit: {
            min: 0.5
          }
        },
        series: [],
        progressive: 0, //渐进式渲染时每一帧绘制图形数量，设为 0 时不启用渐进式渲染，支持每个系列单独配置。
        hoverLayerThreshold: 10000 //图形数量阈值，决定是否开启单独的 hover 层，在整个图表的图形数量大于该阈值时开启单独的 hover 层。
      };



    var devicePointList = {
      seriesName:"装载机|3",
      mapPointList:[
        {address:"山东省滨州市邹平县明集镇集茂路21号",
          name:"VLG0955NVF0600739|山东省滨州市邹平县明集镇集茂路21号",
          value:[117.63796268200072, 36.95021594681207],
          workDate:"2016-03-01"},{
          address:"山东省临沂市河东区梅埠街道杭州路52号",
          name:"VLG0953NJG0602329|山东省临沂市河东区梅埠街道杭州路52号",
          value:[118.47763070547113, 34.96639894774448],
          workDate:"2016-03-01"},{
          address:"内蒙古自治区兴安盟科尔沁右翼前旗科尔沁镇静水湾·林园小区",
          name:"VLG00953TG0603103|内蒙古自治区兴安盟科尔沁右翼前旗科尔沁镇静水湾·林园小区",
          value:[121.97651446884184, 46.09568704235086],
          workDate:"2016-02-27"
        }
      ]
    }

    //绘制位置信息
    function drawPointMap(devicePointList) {
      var legendData = [];
      var series = [];
      angular.forEach(devicePointList, function (value, key,data) {
        var legendItem = data.seriesName.split('|')[0] + ' ' + data.seriesName.split('|')[1] + '台';
        series.push({
          name: legendItem,
          type: 'scatter',
          coordinateSystem: 'geo',
          data: data.mapPointList,
          symbolSize: 7,
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

        legendData.push(legendItem);
      });
      option.series = series;
      option.legend.data = legendData;
    }
    drawPointMap(devicePointList);
    myChart.setOption(option);


    var heatmapChart = echarts.init(document.getElementById('chart-heatmap-panel'));
    var hourName = [
      ['0-2h', '2-4h', '4-6h', '6-8h', '8-10h', '10-12h', '12-14h', '14-16h', '16-18h', '18-20h', '20-22h', '22-24h'],
      ['0-4h', '4-8h', '8-12h', '12-16h', '16-20h', '20-24h'],
      ['0-6h', '6-12h', '12-18h', '18-24h'],
      ['0-8h', '8-16h', '16-24h']
    ];
    var heatmapData = {
      "2016-02-27":{
        "装载机":[
          {runoffCount:720,machineCount:84,workDuration:3948},
          {runoffCount:195,machineCount:13,workDuration:4584},
          {runoffCount:215,machineCount:11,workDuration:6288},
          {runoffCount:110,machineCount:3, workDuration:2574},
          {runoffCount:90, machineCount:2, workDuration:2058},
          {runoffCount:10, machineCount:1, workDuration:1248}
        ]
      },
      "2016-02-28":{
        "装载机":[
          {runoffCount:498,machineCount:57,workDuration:3390},
          {runoffCount:245,machineCount:18,workDuration:6138},
          {runoffCount:204,machineCount:11,workDuration:6288},
          {runoffCount:239,machineCount:8,workDuration:6234},
          {runoffCount:192,machineCount:4,workDuration:6216},
          {runoffCount:17,machineCount:1,workDuration:1206}
        ]
      },
      "2016-02-29":{
        "装载机":[
          {runoffCount:1055,machineCount:95,workDuration:3390},
          {runoffCount:296,machineCount:16,workDuration:6138},
          {runoffCount:220,machineCount:12,workDuration:6288},
          {runoffCount:137,machineCount:5,workDuration:6234},
          {runoffCount:197,machineCount:6,workDuration:6216},
          {runoffCount:24,machineCount:1,workDuration:1206}
        ]
      }
    }
    var heatmapOption = {
      title: {
        text: '工作热力图',
        left: 'center',
        subtext: '全国',
      },
      tooltip: {
        trigger: 'item',
        formatter: function (params) {
          return "工作日期：" + params.value[0] + "<br />"
            + "工作时长：" + params.value[1] + "<br />"
            + "车辆数量：" + params.value[2] + " 台";
        }
      },
      toolbox: {
        show: true,
        orient: 'vertical',
        top: 'center',
        right: 20,
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
      animation: false,
      grid: {
        top: 80,
        left: 35,
        right: 80,
        bottom: 20,
        containLabel: true
      },
      xAxis: {
        name: '工作日期',
        type: 'category',
        data: [],
        splitArea: {
          show: true
        }
      },
      yAxis: {
        name: '工作时长(小时)',
        type: 'category',
        data: hourName[1],
        splitArea: {
          show: true
        }
      },
      visualMap: {
        min: 0,
        max: 100,
        calculable: true,
        orient: 'vertical',
        left: 'right',
        bottom: '10%'
      },
      series: [{
        name: '车辆数量',
        type: 'heatmap',
        data: [],
        label: {
          normal: {
            show: true
          }
        },
        itemStyle: {
          emphasis: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };

    function drawHeatMap(heatmapData) {
      var xdays = [];
      var yhours = [];
      var zdata = [];
      var maxData = 0;
      var hourGap = vm.hourGap;
      var hourNameIndex = hourGap / 2 - 1;
      angular.forEach(heatmapData, function (value,key) {
        xdays.push(key);
        angular.forEach(value, function (value2,key2) {
          angular.forEach(value2, function ( value3,key3) {
            maxData = Math.max(maxData, value3.machineCount);
            var x_data = [];
            x_data.push(key);
            x_data.push(hourName[hourNameIndex][key3]);
            x_data.push(value3.machineCount);
            zdata.push(x_data);
          });
        });
      });

      heatmapOption.xAxis.data = xdays;
      heatmapOption.yAxis.data = hourName[hourNameIndex];// yhours;
      heatmapOption.series[0].data = zdata;
      if (maxData > 0) {
        heatmapOption.visualMap.max = maxData
      }
      //var titleName = $("#machineType").find('option:selected').text() + '工作热力图';
      //heatmapOption.title.text = titleName;

    }
    drawHeatMap(heatmapData);
    heatmapChart.setOption(heatmapOption);



    vm.ProvinceList = [
      { id:"1",
        value:"北京市"
      },{
        id:"2",
        value:"上海市"
      },{
        id:"3",
        value:"天津市"
      },{
        id:"4",
        value:"重庆市"
      },{
        id:"5",
        value:"安徽省"
      }
    ]

    vm.selectAll = function () {


    }

    vm.tableParams = new NgTableParams({
    }, {
      dataset: vm.ProvinceList
    });

    vm.updateAllSelection = function ($event) {
      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      vm.tableParams.data.forEach(function (provinceinfo) {
        updateSelected(action, provinceinfo.value);
      })
    }

    var updateSelected = function (action, value) {
      if (action == 'add' && vm.selected.indexOf(value) == -1) {
        vm.selected.push(value);
      }
      if (action == 'remove' && vm.selected.indexOf(value) != -1) {
        var idx = vm.selected.indexOf(value);
        vm.selected.splice(value, 1);

      }
    }

    vm.updateSelection = function ($event, value, status) {
      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      updateSelected(action, value);
    }

    vm.isSelected = function (value) {
      return vm.selected.indexOf(value) >= 0;
    }

 vm.draw = function () {
   console.log(vm.selected);
 }

    $http.get('assets/json/ChineseCities.json').success(function(data, status) {
      vm.division=data;
    }).error(function(data, status) {
      alert("error")
    });


    myChart.on("click", function (param){
      console.log(param);
      alert(param.name)
    })


    var queryObj = {
      province:'',
      city:'',
      startDateDeviceData:'',
      endDateDeviceData:'',
      machineType:'',
      licenseId:''
    }

    var queryStartData = startDate.getFullYear() + '-' + (startDate.getMonth() + 1) + '-' + startDate.getDate();
    var queryEndData = endDate.getFullYear() + '-' + (endDate.getMonth() + 1) + '-' + endDate.getDate();
    vm.generateReport = function () {

      if(vm.machine){
        queryObj.machineType = vm.machine.machineType;
        queryObj.licenseId = vm.machine.licenseId;
      }
      if(vm.province){
        queryObj.province = vm.province.name;
      }
      if(vm.city){
        queryObj.city = vm.city.name;
      }
      if(vm.startDateDeviceData){
        queryObj.startDateDeviceData = queryStartData;
      }
      if(vm.endDateDeviceData){
        queryObj.endDateDeviceData = queryEndData;
      }

    }







  }
})();

