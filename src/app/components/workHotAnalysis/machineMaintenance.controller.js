/**
 * Created by zhenyu on 17-7-4.
 */

(function(){
  'use strict';

  angular.module('GPSCloud')
    .controller('machineMaintenanceController',machineMaintenanceController);

  function machineMaintenanceController(){
    var vm = this;

    vm.click = function(){
      console.log('do something...');
    };

    vm.events = [{
      time: "2017-01-03",
      badgeClass: 'info',
      badgeIconClass: 'glyphicon-check',
      title: '车辆保养记录',
      content: '经销商: 贵州临沃工程机械有限公司'
    }, {
      time: "2017-01-03",
      badgeClass: 'warning',
      badgeIconClass: 'glyphicon-credit-card',
      title: '车辆保养记录',
      content: '经销商: 贵州临沃工程机械有限公司'
    },{
      time: "2017-01-03",
      badgeClass: 'info',
      badgeIconClass: 'glyphicon-check',
      title: '车辆保养记录',
      content: '经销商: 贵州临沃工程机械有限公司'
    }, {
      time: "2017-01-03",
      badgeClass: 'warning',
      badgeIconClass: 'glyphicon-credit-card',
      title: '车辆保养记录',
      content: '经销商: 贵州临沃工程机械有限公司'
    },{
      time: "2017-01-03",
      badgeClass: 'info',
      badgeIconClass: 'glyphicon-check',
      title: '车辆保养记录',
      content: '经销商: 贵州临沃工程机械有限公司'
    }, {
      time: "2017-01-03",
      badgeClass: 'warning',
      badgeIconClass: 'glyphicon-credit-card',
      title: '车辆保养记录',
      content: '经销商: 贵州临沃工程机械有限公司'
    },{
      time: "2017-01-03",
      badgeClass: 'info',
      badgeIconClass: 'glyphicon-check',
      title: '车辆保养记录',
      content: '经销商: 贵州临沃工程机械有限公司'
    }, {
      time: "2017-01-03",
      badgeClass: 'warning',
      badgeIconClass: 'glyphicon-credit-card',
      title: '车辆保养记录',
      content: '经销商: 贵州临沃工程机械有限公司'
    }];


    vm.items = [
      {title: '第一次维修保养', time: '20171221', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎轮'},
      {title: '第一次维修保养', time: '10170921', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎'},
      {title: '第一次维修保养', time: '20170221', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎轮胎轮胎轮'},
      {title: '第一次维修保养', time: '20171121', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎'},
      {title: '第一次维修保养', time: '20171121', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎'},
      {title: '第一次维修保养', time: '20170921', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎轮'},
      {title: '第一次维修保养', time: '20170821', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎'},
      {title: '第一次维修保养', time: '20170721', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎'},
      {title: '第一次维修保养', time: '20170621', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎'},
      {title: '第一次维修保养', time: '20170521', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎'},
      {title: '第一次维修保养', time: '20160121', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎轮胎轮胎'},
      {title: '第一次维修保养', time: '20160121', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎'},
      {title: '第一次维修保养', time: '20160121', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎'},
      {title: '第一次维修保养', time: '20160121', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎'},
      {title: '第一次维修保养', time: '20160121', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎'}];


    var length = function(){
      var _length = 0;
      var itemLength = [];

      for(var i=0;i<vm.items.length;i++){
        _length += parseInt(vm.items[i].time,10);
      }

      for(var j=0;j<vm.items.length;j++){
        itemLength[j] = parseInt(vm.items[j].time,10) / _length * 1000;
      }

      console.log(itemLength);

      return itemLength;
    };


    vm.changeLength = {}



  }

})();
