/**
 * Created by mengwei on 17-3-1.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('MachineeleArchivesmngController', MachineeleArchivesmngController);

  /** @ngInject */
  function MachineeleArchivesmngController($rootScope, $scope,$http,$filter) {
    var vm = this;

    vm.experimentalcarList= [{
      id:1,
      name:"中试基地试验车"
    },{
      id:2,
      name: "内蒙古试验车"
    },{
      id:3,
      name: "山东试验车"
    }]

    vm.show = true;
    vm.falg = "<<";
    vm.closeChange = function () {
      vm.show=!vm.show;
      if(vm.show){
        document.getElementById('menuSwitch').className='cond-show';
        document.getElementById("right-container").style.width="78%";
        vm.falg = "<<";
      }else{
        document.getElementById('menuSwitch').className='cond-hidden';
        document.getElementById("right-container").style.width="98%";
        vm.falg = ">>";
      }
    }



    var startDate = new Date();
    vm.startDate = startDate;

    vm.startDateDeviceData = startDate;

    //date picker
    vm.startDateOpenStatusDeviceData = {
      opened: false
    };

    vm.startDateOpenDeviceData = function ($event) {
      vm.startDateOpenStatusDeviceData.opened = true;
    };




    function randomData() {
      return Math.round(Math.random()*1000);
    }

    //var myChart = echarts.init(document.getElementById('chart-panel'));


    $http.get('../bower_components/echarts/map/json/china.json').success(function (chinaJson) {
     var date = new Date();
      echarts.registerMap('china', chinaJson);
      var chart = echarts.init(document.getElementById('chart-panel'));
      var mapOption = {
        title: {
          text: '试验车工作概览',
          left: 'center'
        },
        toolbox: {
          show: true,
          orient: 'vertical',
          top: 'center',
          right: '50',
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
            //console.log(params)
            var names = params.name.split("|");
            var deviceNo = names[0];
            var addr = "";
            if (names.length > 1) {
              addr = names[1];
            }
            return  "试验批次："+ params.data.batchNumber + "<br />"
              + "产品类型：" + params.data.batchTypeName + "<br />"
              + "车辆编号：" + deviceNo + "<br />"
              + "地理位置：" + addr;
          }
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
        legend: {
          orient: 'horizontal',
          y: 'top',
          x: 'left',
          left: 20,
          data:['活跃','休息']
        },
        series: [
            {
              name: '活跃',
              type: 'scatter',
              coordinateSystem: 'geo',
              symbolSize: 8,
              label: {
                normal: {
                  formatter: '{b}',
                  position: 'right',
                  show: false
                },
                emphasis: {
                  show: false
                }
              },
              //获取“活跃车辆的数据信息"
              data:[
                {
                  address: "河北省沧州市海兴县苏基镇302省道",
                  batchNumber: "内蒙古试验车",
                  batchTypeName: "挖掘机",
                  name: "VLG00953LG0603029|河北省沧州市海兴县苏基镇302省道",
                  value: [117.54895103497566, 38.157625339445964],
                  workDate: "2016-09-13"
                }, {
                  address: "云南省玉溪市红塔区大营街街道长坡",
                  batchNumber: "中试基地试验车",
                  batchTypeName: "装载机",
                  name: "VLGL955FHG0600168|云南省玉溪市红塔区大营街街道长坡",
                  value: [102.48894811945645, 24.374711459308926],
                  workDate: "2016-09-13"
                }, {
                  address: "云南省昆明市安宁市县街街道安箐公路",
                  batchNumber: "中试基地试验车",
                  batchTypeName: "装载机",
                  name: "VLGL956FEG0600106|云南省昆明市安宁市县街街道安箐公路",
                  value: [102.4062605129483, 24.89335673070697],
                  workDate: "2016-09-13"
                }, {
                  address: "云南省玉溪市红塔区大营街街道长坡",
                  batchNumber: "中试基地试验车",
                  batchTypeName: "装载机",
                  name: "VLGL955FEG0600172|云南省玉溪市红塔区大营街街道长坡",
                  value: [102.48874522783665, 24.37460075884324],
                  workDate: "2016-09-13"
                }
              ]
            },
          {
            name: '休息',
            type: 'scatter',
            coordinateSystem: 'geo',
            symbolSize: 8,
            label: {
              normal: {
                formatter: '{b}',
                position: 'right',
                show: false
              },
              emphasis: {
                show: false
              }
            },
            //获取“休息车辆的数据信息”
            data: [
              {
                address: "河北省沧州市海兴县苏基镇302省道",
                batchNumber: "内蒙古试验车",
                batchTypeName: "挖掘机",
                name: "VLG00953LG0603029|河北省沧州市海兴县苏基镇302省道",
                value: [117.54895103497566, 38.157625339445964],
                workDate: "2016-09-13"
              }, {
                address: "河北省沧州市海兴县苏基镇302省道",
                batchNumber: "内蒙古试验车",
                batchTypeName: "挖掘机",
                name: "VLG00953LG0603029|河北省沧州市海兴县苏基镇302省道",
                value: [111, 25],
                workDate: "2016-09-13"
              }

            ]
          }]
      };
      chart.setOption(mapOption);

    });











  }
})();

