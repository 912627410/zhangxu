/**
 * Created by mengwei on 17-3-3.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('workStartMngController', workStartMngController);

  /** @ngInject */
  function workStartMngController($rootScope, $scope, $http, $filter) {
    var vm = this;


    vm.startDateDeviceData = new Date();
    vm.statisticalStatusData = {
      opened: false
    };
    vm.statisticalData = function ($event) {
      vm.statisticalStatusData.opened = true;
    };

    vm.maxDate = new Date();
    vm.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };

    function randomData() {
      return Math.round(Math.random()*1000);
    }



    var mapChart = echarts.init(document.getElementById('map-container'));
    var chinaOption = {
      title: {
        text: '车辆开工热度分布',
        subtext: '全国',
        left: 'center'
      },
      tooltip: [
        {
          trigger: 'item',
          backgroundColor: 'rgba(219,219,216,0.8)',
          textStyle: {
            color: '#333333'
          },
          formatter: function(params) {
            if(params.componentSubType == 'map') {
              var unit =  '小时' ;
              var name = '平均开工时长';

              if(params.value) {
                return params.data.name + '<br />'
                  + name + '：' +  params.data.value + unit +  '<br />'
                  + '车辆数量：' + params.data.count + ' 台';
              }
              return params.name + '<br />'
                + name + '：' + 0 + unit +  '<br />'
                + '车辆数量：' + 0 + ' 台';
            }
            return '';
          }
        }
      ],
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
      visualMap: {
        type: 'continuous',
        min: 0,
        left: 20,
        bottom: 15,
        calculable: true,
        precision: 2,
        seriesIndex: [0],
        color: ['#980000','#f6f3d2','#075e89'],
        text: ['高', '低']
      },
      geo: {
        map: 'china',
        label: {
          normal: {
            show: false
          },
          emphasis: {
            show: true
          }
        },
        // roam: true,
        // scaleLimit: {
        //   min: 0.5
        // }
      },
      series: [
        {
          name: '开工热度',
          type: 'map',
          map: 'china',
          // roam: true,
          // scaleLimit: {
          //   min: 0.5
          // },
          showLegendSymbol: false,
          label: {
            emphasis: {
              show: true
            }
          },
          data: [{name: "山东", count: 829, value: 94.85},

            {name: "河北", count: 574, value: 161.98},

            {name: "山东", count: 829, value: 94.85},

            {name: "河北", count: 574, value: 161.98},

            {name: "云南", count: 481, value: 70.3},

            {name: "山西", count: 425, value: 101.45},

            {name: "河南", count: 307, value: 78.87},

            {name: "安徽", count: 249, value: 71.22},

            {name: "西藏", count: 226, value: 28.78},

            {name: "贵州", count: 186, value: 62.52},

            {name: "广东", count: 182, value: 68.87},

            {name: "内蒙古", count: 160, value: 111.8},

            {name: "江西", count: 154, value: 66.27},

            {name: "湖北", count: 145, value: 60.42},

            {name: "辽宁", count: 143, value: 116.67},

            {name: "江苏", count: 142, value: 80.73},

            {name: "", count: 132, value: 91.13},

            {name: "湖南", count: 126, value: 52.87},

            {name: "四川", count: 115, value: 76.77},

            {name: "陕西", count: 112, value: 85.65},

            {name: "甘肃", count: 111, value: 38.3},

            {name: "广西", count: 106, value: 91.05},

            {name: "福建省", count: 86, value: 72.67},

            {name: "浙江", count: 73, value: 60.97},

            {name: "吉林", count: 57, value: 54.43},

            {name: "黑龙江", count: 51, value: 138.38},

            {name: "海南", count: 50, value: 78.6},

            {name: "北京", count: 37, value: 94.1},

            {name: "宁夏", count: 35, value: 120},

            {name: "重庆", count: 28, value: 56.18},

            {name: "青海", count: 27, value: 77.55},

            {name: "天津", count: 8, value: 94.27},

            {name: "新疆", count: 4, value: 34.93},

            {name: "上海", count: 1, value: 46.1}]

        }
      ]
    };



    mapChart.setOption(chinaOption);

    mapChart.on("click", function (param){
      console.log(param);
      var n = getindex(param.name,provincesText);
      var Cname = provinces[n];
      showProvince(Cname);
    })

    function getindex(name,arr){
      for (var i = 0; i < arr.length; i++) {
        if(name==arr[i]){
          return i;
        }
      }
    }


    function showProvince(Cname) {

      $http.get('assets/json/province/'+Cname+'.json').success(function (geoJson){

        var myChart = echarts.init(document.getElementById('map-container'));

        echarts.registerMap(Cname, geoJson);
        var option;
        var n = getindex(Cname,provinces);
        var name = provincesText[n];
        console.log(name)
        myChart.setOption(
          option = {
            title: {
              text: name,
              left: 'center',
              textStyle:{
                color:'#000'
              }
            },
            visualMap: {
              type: 'continuous',
              min: 0,
              max: 200,
              left: 20,
              bottom: 15,
              calculable: true,
              precision: 2,
              seriesIndex: [0],
              color: ['#980000', '#f6f3d2', '#075e89'],
              text: ['高', '低']
            },
            toolbox: {
              show: true,
              itemSize: 20,
              itemGap: 30,
              left: 'right',
              feature: {
                restore: {},
                saveAsImage: {}
              }
            },
            series: [
              {
                type: 'map',
                mapType: Cname,
                // roam: true,
                label: {
                  emphasis: {
                    show: true
                  }
                },
                itemStyle: {
                  normal: {
                  },
                  emphasis: {
                    areaColor: '#389BB7',
                    borderWidth: 0
                  }
                },
                animation: false
              }
            ]
          });
      });
    }


    var provinces = ['shanghai', 'hebei','shanxi','neimenggu','liaoning','jilin','heilongjiang','jiangsu','zhejiang','anhui','fujian','jiangxi','shandong','henan','hubei','hunan','guangdong','guangxi','hainan','sichuan','guizhou','yunnan','xizang','shanxi1','gansu','qinghai','ningxia','xinjiang', 'beijing', 'tianjin', 'chongqing', 'xianggang', 'aomen'];
    var provincesText = ['上海', '河北', '山西', '内蒙古', '辽宁', '吉林','黑龙江',  '江苏', '浙江', '安徽', '福建', '江西', '山东','河南', '湖北', '湖南', '广东', '广西', '海南', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆', '北京', '天津', '重庆', '香港', '澳门'];



    var pdsChart = echarts.init(document.getElementById('pds-container'));
    var pdsOption = {
      title: {
        text: '区域工作车辆分布',
        padding: [10, 20]
      },
      tooltip: {
        trigger: 'axis',
        axisPointer : {
          type : 'shadow'
        },
        backgroundColor: 'rgba(219,219,216,0.8)',
        textStyle: {
          color: '#333333'
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
        data:[ '工作车辆数量','月均工作时长']
      },
      grid: {
        left: '3%',
        right: 80,
        bottom: 30,
        borderColor: '#e6e6e6',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: true,
          interval: 0,
          rotate: 45,
          textStyle: {
            color: '#666666'
          }
        },
        nameTextStyle: {
          color: '#666666'
        },
        data: provincesText
      },
      yAxis: [
        {
          type: 'value',
          name: '车辆数量(台)',
          boundaryGap: ['0%', '10%'],
          minInterval: 1,
          splitLine: {
            show: false
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: true,
            textStyle: {
              color: '#666666'
            }
          },
          nameTextStyle: {
            color: '#666666'
          }
        },
        {
          type: 'value',
          name: '工作时长(小时)',
          boundaryGap: ['0%', '10%'],
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: true,
            textStyle: {
              color: '#666666'
            }
          },
          nameTextStyle: {
            color: '#666666'
          }
        }
      ],
      series: [
        {
          name:'工作车辆数量',
          type:'bar',
          barMaxWidth: '35',
          itemStyle: {
            normal: {
              color: '#7cb5ec'
            }
          },
          data:[
            {name: "山东",  value: 829},

            {name: "河北",  value: 574},

            {name: "山东",  value: 829},

            {name: "河北",  value: 574},

            {name: "云南",  value: 481},

            {name: "山西", value: 425},

            {name: "河南",  value: 307},

            {name: "安徽",  value: 307},

            {name: "西藏",  value: 226},

            {name: "贵州", value: 186},

            {name: "广东", value: 182},

            {name: "内蒙古",  value: 160},

            {name: "江西",  value: 154},

            {name: "湖北",  value: 145},

            {name: "辽宁",  value: 143},

            {name: "江苏",  value: 142},

            {name: "",  value: 132},

            {name: "湖南",  value: 126},

            {name: "四川",  value: 115},

            {name: "陕西",  value: 112},

            {name: "甘肃",  value: 111},

            {name: "广西",  value: 106},

            {name: "福建省",  value: 86},

            {name: "浙江",  value: 73},

            {name: "吉林",  value: 57},

            {name: "黑龙江",  value: 51},

            {name: "海南",  value: 50},

            {name: "北京",  value: 37},

            {name: "宁夏",  value: 35},

            {name: "重庆",  value: 28},

            {name: "青海",  value: 27},

            {name: "天津", value: 8},

            {name: "新疆",  value: 4},

            {name: "上海", value: 1}
          ]
        },
        {
          name:'月均工作时长',
          type:'line',
          //smooth: true,
          yAxisIndex: 1,
          symbol: 'circle',
          itemStyle: {
            normal: {
              color: '#f7a35c'
            }
          },
          data:[
            {name: "山东", count: 829, value: 94.85},

            {name: "河北", count: 574, value: 161.98},

            {name: "山东", count: 829, value: 94.85},

            {name: "河北", count: 574, value: 161.98},

            {name: "云南", count: 481, value: 70.3},

            {name: "山西", count: 425, value: 101.45},

            {name: "河南", count: 307, value: 78.87},

            {name: "安徽", count: 249, value: 71.22},

            {name: "西藏", count: 226, value: 28.78},

            {name: "贵州", count: 186, value: 62.52},

            {name: "广东", count: 182, value: 68.87},

            {name: "内蒙古", count: 160, value: 111.8},

            {name: "江西", count: 154, value: 66.27},

            {name: "湖北", count: 145, value: 60.42},

            {name: "辽宁", count: 143, value: 116.67},

            {name: "江苏", count: 142, value: 80.73},

            {name: "", count: 132, value: 91.13},

            {name: "湖南", count: 126, value: 52.87},

            {name: "四川", count: 115, value: 76.77},

            {name: "陕西", count: 112, value: 85.65},

            {name: "甘肃", count: 111, value: 38.3},

            {name: "广西", count: 106, value: 91.05},

            {name: "福建省", count: 86, value: 72.67},

            {name: "浙江", count: 73, value: 60.97},

            {name: "吉林", count: 57, value: 54.43},

            {name: "黑龙江", count: 51, value: 138.38},

            {name: "海南", count: 50, value: 78.6},

            {name: "北京", count: 37, value: 94.1},

            {name: "宁夏", count: 35, value: 120},

            {name: "重庆", count: 28, value: 56.18},

            {name: "青海", count: 27, value: 77.55},

            {name: "天津", count: 8, value: 94.27},

            {name: "新疆", count: 4, value: 34.93},

            {name: "上海", count: 1, value: 46.1}
          ]
        }
      ]
    };
    pdsChart.setOption(pdsOption);


    //车辆各年份月度工作情况
    var mmuChart = echarts.init(document.getElementById('mmu-container'));
    var mmuOption = {
      title: {
        text: '月度工作车辆分布',
        padding: [10, 20]
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
      tooltip: {
        trigger: 'axis',
        axisPointer : {
          type : 'shadow'
        },
        backgroundColor: 'rgba(219,219,216,0.8)',
        textStyle: {
          color: '#333333'
        }
      },
      legend: {
        data:['2016','2017']
      },
      grid: {
        left: '3%',
        right: 80,
        bottom: '3%',
        borderColor: '#e6e6e6',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: true,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: '#666666'
          }
        },
        nameTextStyle: {
          color: '#666666'
        },
        data: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
      },
      yAxis: {
        name: '车辆数量(台)',
        type: 'value',
        minInterval: 1,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: '#666666'
          }
        },
        nameTextStyle: {
          color: '#666666'
        }
      },
      series: [
        {
          name:'2016',
          type: 'line',
          data:[0,0,0,0,1546,1886,2141,2545,3138,3612,4024,4221]
        },{
          name:'2017',
          type: 'line',
          data:[4380,5362]
        }
      ]
    };
    mmuChart.setOption(mmuOption);



    var queryWorkHotObj = {
      machineType:'',
      experimentalcar:'',
      startDate:''
    }
    vm.drawWorkHot = function () {
      if(vm.machine){
        queryWorkHotObj.machineType = vm.machine.machineType;
      }
      if(vm.experimentalcar){
       queryWorkHotObj.experimentalcar = vm.experimentalcar;
      }
      if( vm.startDateDeviceData){
       queryWorkHotObj.startDate = vm.startDateDeviceData;
      }

    }



  }
})();
