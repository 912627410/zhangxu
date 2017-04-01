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
    var obj = {
      name:"",
      alis:"",
      type:"",
      length:"",
      register:"",
      converter:""

    }



    vm.show = false;

    vm.getlength = function () {

      if(vm.obj.type=="char"){
        vm.show = true;
      }else{
        vm.show = false;
      }
    }
    vm.ok = function (obj1) {
          vm.arr = [];
          obj.name = obj1.name;
          obj.alis = obj1.cname;
          obj.type = obj1.type;
          obj.converter = obj1.converter;
          if(obj1.type=="int"){
            obj.length = 4;
          }else if(obj1.type=="short"){
            obj.length = 2;
          }else{
            obj.length = parseInt(obj1.length);
          }
          if(jsonData.length ==0){
            obj.register = 1;
          }else{
            registerNum = jsonData[jsonData.length-1].register;

            registerNum +=  Math.ceil(obj.length/2);

            obj.register = registerNum;
          }
          var item = obj;
          vm.arr.push(item);

       $uibModalInstance.close(vm.arr);
    }

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    vm.converterData = [{
      name:"a",
      value:"org.gpscloud.converter.CHexConver"
    },{
      name:"b",
      value:"org.gpscloud.converter.CHexConver"
    },{
      name:"c",
      value:"org.gpscloud.converter.CHexConver"
    }]

  }
})();
