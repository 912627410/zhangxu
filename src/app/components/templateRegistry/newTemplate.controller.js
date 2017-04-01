/**
 * Created by mengwei on 17-4-1.
 */
/**
 * Created by mengwei on 17-3-31.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newTemplateController', newTemplateController);

  /** @ngInject */
  function newTemplateController($rootScope,$scope,$uibModalInstance,jsonData) {
    var vm = this;
    var registerNum;
    var jsonData = jsonData;
    var templateItem = {
      name:"",
      alis:"",
      type:"",
      length:"",
      register:"",
      converter:""

    }



    vm.show = false;

    vm.showCharLengthInputBox = function () {

      if(vm.templateInfo.type=="char"){
        vm.show = true;
      }else{
        vm.show = false;
      }
    }
    vm.confirm = function (templateInfo) {
          vm.templateItemArr = [];
          templateItem.name = templateInfo.name;
          templateItem.alis = templateInfo.cname;
          templateItem.type = templateInfo.type;
          templateItem.converter = templateInfo.converter;
         //int类型长度为4, short类型长度为2, char类型长度自定义
          if(templateInfo.type=="int"){
            templateItem.length = 4;
          }else if(templateInfo.type=="short"){
            templateItem.length = 2;
          }else{
            templateItem.length = parseInt(templateInfo.length);
          }
          //register第一个为1，剩下以2为长度累加
          if(jsonData.length ==0){
            templateItem.register = 1;
          }else{
            registerNum = jsonData[jsonData.length-1].register;
            registerNum +=  Math.ceil(templateItem.length/2);
            templateItem.register = registerNum;
          }
          var item = templateItem;
          vm.templateItemArr.push(item);

       $uibModalInstance.close(vm.templateItemArr);
    }

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    vm.converterData = [{
      name:"转化器a",
      value:"org.gpscloud.converter.CHexConver1"
    },{
      name:"转化器b",
      value:"org.gpscloud.converter.CHexConver2"
    },{
      name:"转化器c",
      value:"org.gpscloud.converter.CHexConver3"
    }]

  }
})();
