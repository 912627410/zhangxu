/**
 * Created by zhenyu on 17-5-23.
 */

(function(){
  'use strict';

  angular
    .module('GPSCloud')
    .controller('activeRateController',activeRateController);

  function activeRateController($scope, $http) {

    var vm = this;
    var back = document.getElementById('backProvince');
    var workMonth = document.getElementById("workMonth");
    var workProvince = document.getElementById("workProvince");
    var workType = document.getElementById("workType");


    var produceType = ["挖掘机","装载机","重机"];
    var cycleType = ["按月","按季度"];
    var cycleValue = ["2017年05月","2017年04月","2017年03月","2017年02月","2017年01月","2016年12月","2016年11月","2016年10月","2016年09月","2016年08月","2016年07月","2016年06月","2016年05月","2016年04月"];


    workMonth.innerHTML = cycleValue[0];
    workProvince.innerHTML = "全国";
    workType.innerHTML = produceType[0];


    //初始化图表
    var barChart = echarts.init(document.getElementById('barChartContainer'));

    //display chart
    function showChart(_produceType,_machineType,_cycleType,_cycleValue,_province) {
      $http({
        method: 'GET',
        url: 'https://iotserver2.nvr-china.com/slice/rest/activeRate/area-machine?produceType='+_produceType+'&machineType='+_machineType+'&cycleType='+_cycleType+'&cycleValue='+_cycleValue+'&province='+_province
      }).then(function (rspJson) {
        rspJson = rspJson.data;

        barChart.setOption(
          {
            legend: {
              data: ['No.1', 'No.2', 'No.3', 'No.4', 'No.5', '其它']
            },
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow'
              },
              backgroundColor:'rgba(220, 220, 220, 0.6)',
              textStyle: {
                color: '#333'
              },
              formatter: function (params) {
                var thisArea = params[0].dataIndex;
                var res = '<div style="display:inline-block;visibility:hidden;margin-right:5px;width:10px;height:10px;"></div>' + '地区：' + params[0].name;
                for (var i = 0; i < params.length; i++) {
                  if (params[i].value != '') {
                    res += '<br/>' + '<div style="display:inline-block;margin-right:5px;width:10px;height:10px;border-radius:10px;background-color:' + params[i].color + '"></div>' + "型号：" + rspJson.machineCount[i][thisArea].name + '<br/>' + '<div style="display:inline-block; visibility:hidden;margin-right:5px;width:10px;height:10px;border-radius:10px;background-color:' + params[i].color + '"></div>' + '机器数量：' + rspJson.machineCount[i][thisArea].value + ' 台' + ' ' + '活跃度：' + rspJson.seriesList[i][thisArea].value + ' %';
                  } else {
                    res += '';
                  }
                }
                return res;
              }
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
            },
            xAxis: {
              name: '',
              type: 'category',
              axisTick: {
                show: false
              },
              axisLine: {
                show: false
              },
              axisLabel: {
                rotate: 45,
                interval: 0
              },
              data: rspJson.cityName
            },
            yAxis: {
              name: '活跃度（%）',
              type: 'value',
              axisTick: {
                show: false
              },
              axisLine: {
                show: false
              }
            },
            series: [{
              name: 'No.1',
              type: 'bar',
              stack: '活跃度',
              barWidth: '60%',
              data: rspJson.machineCount[0]
            }, {
              name: 'No.2',
              type: 'bar',
              stack: '活跃度',
              barWidth: '60%',
              data: rspJson.machineCount[1]
            }, {
              name: 'No.3',
              type: 'bar',
              stack: '活跃度',
              barWidth: '60%',
              data: rspJson.machineCount[2]
            }, {
              name: 'No.4',
              type: 'bar',
              stack: '活跃度',
              barWidth: '60%',
              data: rspJson.machineCount[3]
            }, {
              name: 'No.5',
              type: 'bar',
              stack: '活跃度',
              barWidth: '60%',
              data: rspJson.machineCount[4]
            }, {
              name: '其它',
              type: 'bar',
              stack: '活跃度',
              barWidth: '60%',
              data: rspJson.machineCount[5]
            }]
          }
        );

      }, function(){
        console.log("无法获取数据");
      });
    }

    // showChart("装载机","","1","201703","山东省");
    showChart("挖掘机","","1","201703","");




    //show drill chart
    barChart.on('click',function(params){
      //禁止点击省以下单位
      if(back.style.display != "inline-block"){
        workProvince.innerHTML = params.name;
        back.style.display = "inline-block";
        showChart("挖掘机","",1,201703,params.name);
      }
    });


    //click back
    vm.backProvince = function(){
      back.style.display = "none";
      showChart("挖掘机","",1,201703,"");
      workMonth.innerHTML = cycleValue[0];
      workProvince.innerHTML = "全国";
      workType.innerHTML = produceType[0];
      $scope.produceType.selected = produceType[0];
      $scope.cycleType.selected = cycleType[0];
      $scope.cycleValue.selected = cycleValue[0];
    };



    //ui-select
    $scope.produceType = produceType;
    $scope.cycleType = cycleType;
    $scope.cycleValue = cycleValue;


    $scope.produceType.selected = produceType[0];
    $scope.cycleType.selected = cycleType[0];
    $scope.cycleValue.selected = cycleValue[0];


    $scope.$watch('produceType.selected', function(newVal, oldVal) {
      if (newVal !== oldVal) {
        if ($scope.produceType.indexOf(newVal) === -1) {
          $scope.produceType.unshift(newVal);
        }
      }
    });

    $scope.$watch('cycleType.selected', function(newVal, oldVal) {
      if (newVal !== oldVal) {
        if ($scope.cycleType.indexOf(newVal) === -1) {
          $scope.cycleType.unshift(newVal);
        }
      }
    });

    $scope.$watch('cycleValue.selected', function(newVal, oldVal) {
      if (newVal !== oldVal) {
        if ($scope.cycleValue.indexOf(newVal) === -1) {
          $scope.cycleValue.unshift(newVal);
        }
      }
    });



    $scope.getProduceType = function(search) {
      var newSupes = $scope.produceType.slice();
      if (search && newSupes.indexOf(search) === -1) {
        newSupes.unshift(search);
      }
      return newSupes;
    };

    $scope.getCycleType = function(search) {
      var newSupes = $scope.cycleType.slice();
      if (search && newSupes.indexOf(search) === -1) {
        newSupes.unshift(search);
      }
      return newSupes;
    };

    $scope.getCycleValue = function(search) {
      var newSupes = $scope.cycleValue.slice();
      if (search && newSupes.indexOf(search) === -1) {
        newSupes.unshift(search);
      }
      return newSupes;
    };


    vm.customSelect = function(){
      workMonth.innerHTML = $scope.cycleValue.selected;
      workType.innerHTML = $scope.produceType.selected;

      var _province = '';
      var _produceType;
      var _cycleType;

      if($scope.cycleType.selected == "按月"){
        _cycleType = 1;
      }else if($scope.cycleType.selected == "按季度"){
        _cycleType = 4;
      }

      _produceType = $scope.produceType.selected;

      var _cycleValue = $scope.cycleValue.selected.replace(/\D/g,"");  //  \D -> 非数字  g -> 匹配所有

      showChart(_produceType,"",_cycleType,_cycleValue,_province);
    }


  }

})();
