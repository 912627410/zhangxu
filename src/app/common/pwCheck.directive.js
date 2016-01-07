/**
 * Created by shuangshan on 16/1/2.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .directive('pwCheck', pwCheck);

  /** @ngInject */
  //校验两次密码是否输入一致
  function pwCheck() {
    return {
      require: 'ngModel',
      link: function (scope, elem, attrs, ctrl) {
        var firstPassword = '#' + attrs.pwCheck;
        $(elem).add(firstPassword).on('keyup', function () {
          scope.$apply(function () {
            var v1 = $(elem).val();
            var v2 = $(firstPassword).val()
            var v = v1 === v2;
            ctrl.$setValidity('pwmatch', v);
          });
        });
      }
    }
  }
})();
