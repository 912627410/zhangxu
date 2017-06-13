/**
 * Created by zhenyu on 17-5-23.
 */

(function(){
  'use strict';

  angular
    .module('GPSCloud')
    .controller('activeRateController',activeRateController);

  function activeRateController($scope,$http,GET_ACTIVERATE_URL,GET_MACHINETYPE_URL) {

    var vm = this;
    var back = document.getElementById('backProvince');
    var time,cycle;

    var produceType = [];
    var machineType = [];
    var cycleType = ["按月","按季度"];
    var cycleValue1 = ["2017年05月","2017年04月","2017年03月","2017年02月","2017年01月","2016年12月","2016年11月","2016年10月","2016年09月","2016年08月","2016年07月","2016年06月","2016年05月","2016年04月"];
    var cycleValue2 = ["2017年01季度","2016年04季度","2016年03季度","2016年02季度","2016年01季度"];

    $scope.chartProduceType = produceType[0];
    $scope.chartMachineType = machineType[0];
    $scope.chartWorkMonth = cycleValue1[0];
    $scope.chartArea = "全国";

    //get produceType
    function getSelectProduceType() {
      $http({
        method: 'GET',
        url: GET_MACHINETYPE_URL
      }).then(function (rspJson) {
        rspJson = rspJson.data;
        for(var i=0;i<rspJson.length;i++){
          produceType[i] = rspJson[i].name;
        }
        $scope.produceType.selected = produceType[0];
      });
    }

    //get machineType
    function getSelectMachineType(_produceType){
      $http({
        method: 'GET',
        url: GET_MACHINETYPE_URL+'?type='+_produceType
      }).then(function (rspJson) {
        rspJson = rspJson.data;
        for(var i=0;i<rspJson.length;i++){
          machineType[i] = rspJson[i].name;
        }
        $scope.machineType.selected = machineType[0];
      })
    }


    //初始化图表
    var barChart = echarts.init(document.getElementById('barChartContainer'));

    //display chart
    function showChart(_produceType,_machineType,_cycleType,_cycleValue,_province) {
      $http({
        method: 'GET',
        url: GET_ACTIVERATE_URL+'produceType='+_produceType+'&machineType='+_machineType+'&cycleType='+_cycleType+'&cycleValue='+_cycleValue+'&province='+_province
      }).then(function (rspJson) {
        rspJson = rspJson.data;

        barChart.setOption(
          {
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
                var res = '地区：' + params[0].name;
                res += '<br/>' + '活跃度：' + rspJson.seriesList[thisArea] + ' %';
                return res;
              }
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '4%',
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
                interval: 0,
                formatter:function (value) {
                  var _value;
                  _value = value.replace(/省|回族自治区|壮族自治区|维吾尔自治区|自治区/,"");
                  return _value;
                }
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
              name: '活跃度',
              type: 'bar',
              stack: '活跃度',
              barWidth: '60%',
              data: rspJson.seriesList
            }]
          }
        );

      }, function(){
        console.log("无法获取数据");
      });
    }

    //_produceType,_machineType,_cycleType,_cycleValue,_province
    showChart("挖掘机",'E665F',1,cycleValue1[0].replace(/\D/g,""),"");
    getSelectProduceType();
    getSelectMachineType(2);


    //show drill chart
    barChart.on('click',function(params){
      //禁止点击省以下单位
      if(back.style.display != "inline-block"){
        $scope.chartArea = params.name;
        back.style.display = "inline-block";
        console.log(params);
        showChart(produceType.selected,params.data.name,cycle,time,params.name);
      }
    });


    //click back
    vm.backProvince = function(){
      back.style.display = "none";
      showChart("挖掘机",'E665F',1,cycleValue1[0].replace(/\D/g,""),"");

      $scope.chartWorkMonth = cycleValue1[0];
      $scope.chartArea = "全国";
      $scope.chartProduceType = produceType[0];
      $scope.chartMachineType = machineType[0];
      getSelectProduceType();
      getSelectMachineType(2);
      $scope.cycleType.selected = cycleType[0];
      $scope.cycleValue.selected = cycleValue1[0];
    };



    //ui-select
    $scope.produceType = produceType;
    $scope.machineType = machineType;
    $scope.cycleType = cycleType;
    $scope.cycleValue = cycleValue1;


    $scope.produceType.selected = produceType[0];
    $scope.machineType.selected = machineType[0];
    $scope.cycleType.selected = cycleType[0];
    $scope.cycleValue.selected = cycleValue1[0];


    $scope.$watch('produceType.selected', function(newVal, oldVal) {
      if (newVal !== oldVal) {
        if ($scope.produceType.indexOf(newVal) === -1) {
          $scope.produceType.unshift(newVal);
        }
      }
      if(produceType.selected == "挖掘机"){
        getSelectMachineType(2);
      }else if(produceType.selected == "重机"){
        getSelectMachineType(3);
      }else{
        getSelectMachineType(1);
      }
    });

    $scope.$watch('machineType.selected', function(newVal, oldVal) {
      if (newVal !== oldVal) {
        if ($scope.machineType.indexOf(newVal) === -1) {
          $scope.machineType.unshift(newVal);
        }
      }
    });

    $scope.$watch('cycleType.selected', function(newVal, oldVal) {
      if (newVal !== oldVal) {
        if ($scope.cycleType.indexOf(newVal) === -1) {
          $scope.cycleType.unshift(newVal);
        }
      }
      switch (cycleType.selected){
        case "按月":
          $scope.cycleValue = cycleValue1;
          $scope.cycleValue.selected = cycleValue1[0];
              break;
        case "按季度":
          $scope.cycleValue = cycleValue2;
          $scope.cycleValue.selected = cycleValue2[0];
          break;
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

    $scope.getMachineType = function(search) {
      var newSupes = $scope.machineType.slice();
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
      back.style.display = "none";

      $scope.chartWorkMonth = $scope.cycleValue.selected;
      $scope.chartProduceType = $scope.produceType.selected;
      $scope.chartMachineType = $scope.machineType.selected;

      var _province = '';
      var _produceType;
      var _machineType;
      var _cycleType;

      if($scope.cycleType.selected == "按月"){
        _cycleType = 1;
      }else if($scope.cycleType.selected == "按季度"){
        _cycleType = 2;
      }

      _produceType = $scope.produceType.selected;
      _machineType = $scope.machineType.selected;

      var _cycleValue = $scope.cycleValue.selected.replace(/\D/g,"");  //  \D -> 非数字  g -> 匹配所有
      time = _cycleValue;
      cycle = _cycleType;

      showChart(_produceType,_machineType,_cycleType,_cycleValue,_province);
    };

    //DEFAULT SELECT VALUE
    time = $scope.cycleValue.selected.replace(/\D/g,"");
    cycle = 1;
  }

})();