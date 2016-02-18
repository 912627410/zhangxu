///**
// * Created by shuangshan on 16/1/2.
// */
//(function () {
//  'use strict';
//
//  angular
//    .module('GPSCloud')
//    .directive('uiSelect', uiSelect)
//
//  /** @ngInject */
//  function uiSelect() {
//    //return {
//    //  require: 'ngModel',
//    //  link: function( scope, element, attrs, ngModelController ) {
//    //    var idName = attrs.name;
//    //    ngModelController.$validators[idName] = function( modelValue, viewValue ) {
//    //
//    //      alert("modelValue==="+modelValue);
//    //      return modelValue !== undefined && modelValue !== null && modelValue && modelValue.length > 0;
//    //    };
//    //  }
//
//    return {
//      restrict: 'EA',
//      require: '?ngModel',
//      link: function (scope, element, attrs, ctrl) {
//        //alert(element.label);
//        if (ctrl) {
//          ctrl.$isEmpty = function(value) {
//            alert(value);
//            return !value || value.length === 0;
//          };
//        }
//      }
//    };
//  }
//
//})();
