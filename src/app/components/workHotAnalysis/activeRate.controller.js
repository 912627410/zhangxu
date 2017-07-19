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
    var startYear = 2016;

    var produceType = ['全部'];
    var machineType = ['全部'];
    var cycleType = ["按月","按季度"];
    var thresholdValue = getthreshold();
    var cycleValue1 = getCycleValue1();
    var cycleValue2 = getCycleValue2();
    $scope.cycleTypeHidden1 = true;//默认显示开工月份周期
    $scope.cycleTypeHidden2 = false;//默认隐藏开工季度周期

    $scope.chartArea = "全国";
    $scope.chartProduceType = '所有类型';
    $scope.chartWorkMonth = cycleValue1[0];
    $scope.chartThresholdValue = thresholdValue[1];

    //按月
    function getCycleValue1(){
      var currentDate = new Date();
      var length = (currentDate.getFullYear() - startYear) * 12 + currentDate.getMonth();
      var result = [];
      for(var i = 0; i < length; i++) {
        currentDate.setMonth(currentDate.getMonth() - 1);
        var m = currentDate.getMonth()+ 1 ;
        m = m < 10 ? "0" + m : m;
        result.push(currentDate.getFullYear() + '年' + m + '月');
      }
      return result;
    }

    //按季度
    function getCycleValue2(){
      var currentDate = new Date();
      var length = (currentDate.getFullYear() - startYear) * 12 + currentDate.getMonth();
      var result = [];
      for(var i=0;i<length;i+=3){
        currentDate.setMonth(currentDate.getMonth() - 3);
        var q = Math.ceil(currentDate.getMonth() / 3) + 1;
        result.push(currentDate.getFullYear() + '年0' + q + '季度');
      }
      return result;
    }

    //活跃阈值范围
    function getthreshold(){
      var threshold = [];
      for (var i = 0;i<23;i++){
        threshold.push(i+1 +'小时');
      }
      return threshold;
    }


    //get produceType
    function getSelectProduceType() {
      $http({
        method: 'GET',
        url: GET_MACHINETYPE_URL
      }).then(function (rspJson) {
        rspJson = rspJson.data;
        rspJson = _.sortBy(rspJson,'name');
        produceType = ['全部'];
        for(var i=0;i<rspJson.length;i++){
          // produceType[i+1] = rspJson[i].name;
          produceType.push(rspJson[i].name);
        }
        $scope.produceType = produceType;
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
        rspJson = _.sortBy(rspJson,'name');
        machineType = ['全部'];
        for(var i=0;i<rspJson.length;i++){
          // machineType[i+1] = rspJson[i].name;
          machineType.push(rspJson[i].name);
        }
        $scope.machineType = machineType;
        $scope.machineType.selected = machineType[0];
      })
    }
    getSelectProduceType();

    $scope.produceType = produceType;
    $scope.machineType = machineType;
    $scope.cycleType = cycleType;
    $scope.cycleValue = cycleValue1;
    $scope.thresholdValue = thresholdValue;

    $scope.produceType.selected = produceType[0];
    $scope.machineType.selected = machineType[0];
    $scope.cycleType.selected = cycleType[0];
    $scope.cycleValue.selected = cycleValue1[0];
    $scope.thresholdValue.selected = thresholdValue[1];

    //初始化图表
    var barChart = echarts.init(document.getElementById('barChartContainer'));
    //添加图形自适应功能
    window.onresize = function(){barChart.resize();}

    //display chart
    function showChart(_produceType,_machineType,_cycleType,_cycleValue,_hourScope,_province) {
      if(_produceType=="全部"){
        _produceType='';
      }
      if(_machineType == "全部"){
        _machineType = '';
      }
      $http({
        method: 'GET',
        url: GET_ACTIVERATE_URL+'produceType='+_produceType+'&machineType='+_machineType+'&cycleType='+_cycleType+'&cycleValue='+_cycleValue+'&hourScope='+_hourScope +'&province='+_province
      }).then(function (rspJson) {
        rspJson = rspJson.data;
        if(!rspJson.cityName.length>0){
          rspJson.cityName = ["山东省","云南省","河北省","山西省","河南省","江苏省","安徽省","贵州省","西藏自治区",
            "内蒙古自治区","广东省","江西省","湖北省","湖南省","辽宁省","甘肃省","四川省","陕西省",
            "广西壮族自治区","福建省","浙江省","吉林省","黑龙江省","海南省","北京市","新疆维吾尔自治区",
            "重庆市","青海省","宁夏回族自治区","天津市","上海市"];
        }
        barChart.setOption(
          {
            legend: {
              data:['车辆保有量','活跃度']
            },
            tooltip: {
              trigger: 'axis',
              snap: true,
              axisPointer: {
                type: 'cross'
              },
              backgroundColor: 'rgba(220, 220, 220, 0.6)',
              textStyle: {
                color: '#333'
              },
              formatter: function(params) {
                var res = '地区：' + params.name;
                res += '<br/>' + '车辆保有量：' + rspJson.ownerShipList[params.dataIndex] + ' 台' + '<br/>' + '活跃度：' + rspJson.activeRateList[params.dataIndex] + ' %';
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
              type: 'category',
              // axisTick: {
              //   show: false
              // },
              // axisLine: {
              //   show: true
              // },
              axisLabel: {
                rotate: 45,
                interval: 0,
                formatter: function(value) {
                  var _value;
                  _value = value.replace(/省|回族自治区|壮族自治区|维吾尔自治区|自治区|特別行政區|市/, "");
                  return _value;
                }
              },
              data: rspJson.cityName

            },
            yAxis: [{
              name: '车辆保有量（台）',
              type: 'value',
              splitLine: {
                show: false
              }
            },{
              name: '车型活跃度（%）',
              type: 'value',
              min: '0',
              max: '100',
              splitLine: {
                show: false
              }
            }],
            series: [{
              name: '车辆保有量',
              type: 'bar',
              barWidth: '60%',
              data: rspJson.ownerShipList
            },{
              name: '活跃度',
              type: 'line',
              smooth: 'ture',
              yAxisIndex: 1,
              data: rspJson.activeRateList
            }]

          }
        );

      }, function(){
        console.log("无法获取数据");
      });
    }

    //_produceType,_machineType,_cycleType,_cycleValue,_province
    //默认初始化查询数据状态
    showChart('全部','全部',1,cycleValue1[0].replace(/\D/g,""),thresholdValue[1].replace(/\D/g,""),"");


    //show drill chart
    barChart.on('click',function(params){
      //禁止点击省以下单位
      if(back.style.display != "inline-block"){
        $scope.chartArea = params.name;
        back.style.display = "inline-block";
        showChart(produceType.selected,machineType.selected,cycle,time,thresholdValue.selected.replace(/\D/g,""),params.name);
      }
    });


    //click back
    vm.backProvince = function(){
      back.style.display = "none";
      showChart('全部','全部',1,cycleValue1[0].replace(/\D/g,""),thresholdValue[1].replace(/\D/g,""),"");

      $scope.chartWorkMonth = cycleValue1[0];
      $scope.chartArea = "全国";
      $scope.chartProduceType = '所有类型';
      $scope.produceType.selected = produceType[0];
      $scope.machineType.selected = machineType[0];
      $scope.cycleType.selected = cycleType[0];
      $scope.cycleValue.selected = cycleValue1[0];
    };



    //ui-select


    $scope.$watch('produceType.selected', function(newVal, oldVal) {
      if (newVal !== oldVal) {
        if ($scope.produceType.indexOf(newVal) === -1) {
          $scope.produceType.unshift(newVal);
        }
        $scope.machineType = machineType;
        $scope.machineType.selected = '全部';
        switch (newVal){
          case "全部":
            machineType = ['全部'];
            $scope.machineType = machineType;
            $scope.machineType.selected = machineType[0];
            break;
          case "装载机":
            getSelectMachineType(1);
            break;
          case "挖掘机":
            getSelectMachineType(2);
            break;
          case "重机":
            getSelectMachineType(3);
            break;
        }
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
          $scope.cycleTypeHidden1 = true;//显示开工月份周期
          $scope.cycleTypeHidden2 = false;//隐藏开工季度周期
          break;
        case "按季度":
          $scope.cycleValue = cycleValue2;
          $scope.cycleValue.selected = cycleValue2[0];
          $scope.cycleTypeHidden1 = false;//隐藏开工月份周期
          $scope.cycleTypeHidden2 = true;//显示开工季度周期
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

    $scope.$watch('thresholdValue.selected', function(newVal, oldVal) {
      if (newVal !== oldVal) {
        if ($scope.thresholdValue.indexOf(newVal) === -1) {
          $scope.thresholdValue.unshift(newVal);
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

    $scope.getThresholdValue = function(search) {
      var newSupes = $scope.thresholdValue.slice();
      if (search && newSupes.indexOf(search) === -1) {
        newSupes.unshift(search);
      }
      return newSupes;
    };


    vm.customSelect = function(){
      back.style.display = "none";

      $scope.chartArea = '全国';
      $scope.chartWorkMonth = $scope.cycleValue.selected;
      $scope.chartProduceType = $scope.produceType.selected;
      $scope.chartMachineType = $scope.machineType.selected;
      $scope.chartThresholdValue = $scope.thresholdValue.selected;

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
      var _hourScope = $scope.thresholdValue.selected.replace(/\D/g,"");

      showChart(_produceType,_machineType,_cycleType,_cycleValue,_hourScope,_province);
    };

    //DEFAULT SELECT VALUE
    time = $scope.cycleValue.selected.replace(/\D/g,"");
    cycle = 1;
  }

})();
