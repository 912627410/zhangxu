(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .config(validationuleConfig);

  /** @ngInject */
  function validationuleConfig($validationProvider,$injector) {

    //全局设置是否显示 success/error message
    $validationProvider.showSuccessMessage = false; // or true(default)
    $validationProvider.showErrorMessage = true; // or true(default)

    var expression = {
      required: function(value) {
        return !!value;
      },
      url: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/,
      email: /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/,
      number: /^\d+$/,
      numberAndChar: /^[a-zA-Z0-9]+$/,
      numberAndCharAndDot: /^[a-zA-Z0-9.-]+$/,
      numberAndDot: /^[0-9.]+$/,
      softVersionNum: /^\d{1,2}(\.\d{1,2})?$/,
      //numberAndCharForPass:/[a-zA-Z0-9_]{8,10}/,
      //numberAndCharForPass:/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,20}$/,
      numberAndCharForPass:/^(?![^A-Za-z]+$)(?![^0-9]+$)[\x21-x7e]{6,}$$/,
      numberForPass:/^\d{6}$/,
      numberForSsn:/^\d{7}$/,
     // numberAndChar: /^[c0|c1|c2]{1}[0-9]$/,
      telephoneNo:/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/,
      postcode:/^[1-9]\d{5}(?!\d)$/,
      port: /^[1-9]\d{3}$|^[1-5]\d{4}$|^6[0-4]\d{3}$|^65[0-4]\d{2}$|^655[0-2]\d$|^6553[0-5]$/, //1000~65535
      // port: /^[1][0-9][2-9][4-9]$|^[2-9]\d{3}$|^[1-5]\d{4}$|^6[0-4]\d{3}$|^65[0-4]\d{2}$|^655[0-2]\d$|^6553[0-5]$/, //1024~65535

      minlength: function(value, scope, element, attrs, param) {
        return value.length >= param;
      },
      maxlength: function(value, scope, element, attrs, param) {
        return value.length <= param;
      },
      nullOrNumber : function (value) {
        return value ==null || value =='' || /^\d+$/.test(value);
      },
      maxValue: function (value, scope, element, attrs, param) {
        return parseInt(value) <= parseInt(param);
      },
      minValue: function (value, scope, element, attrs, param) {
        return parseInt(value) >= parseInt(param);
      }
    };

    //var $http = $validationProvider.$http;

    //alert($validationProvider.$q);

    var defaultMsg = {
      required: {
        error: "{{'required' |translate}}",
        success: ''
      },

      url: {
        error: "{{'urlNotLegal' |translate}}",
        success: ''
      },
      email: {
        error: "{{'emailNotLegal' |translate}}",
        success: ''
      },
      number: {
        error: "{{'numberOnly' |translate}}",
        success: ''
      },
      numberAndChar: {
        error: "{{'numberAndChar' |translate}}",
        success: ''
      },
      numberAndCharAndDot: {
        error: "{{'numberAndCharAndDot' |translate}}",
        success: ''
      },
      numberAndDot: {
        error: "{{'numberAndDot' |translate}}",
        success: ''
      },
      softVersionNum: {
        error: "{{'softVersionNumError' |translate}}",
        success: ''
      },
      minlength: {
        error: "{{'minlength' |translate}}",
        success: ''
      },
      maxlength: {
        error: "{{'maxlength' |translate}}",
        success: ''
      },
      numberAndCharForPass: {
        error: "{{'numberAndCharForPass' |translate}}",
        success: ''
      },
      numberForPass: {
        error:"密码为6位数字",
        success:''
      },
      numberForSsn: {
        error:"系统用户名为7位数字",
        success:''
      },
      telephoneNo: {
        error: "{{'telephoneNo' |translate}}",
        success: ''
      },
      postcode: {
        error: "{{'postcodes' |translate}}",
        success: ''
      },
      port: {
        // error: 'portError',
        error: '端口号范围1000~65535',
        success: ''
      },
      nullOrNumber: {
        error: "{{'nullOrNumber' |translate}}",
        success: ''
      },
      minValue: {
        error: "{{'minValue' | translate}}",
        success: ''
      },
      maxValue: {
        error: "{{'maxValue' | translate}}",
        success: ''
      }
    };
    $validationProvider.setExpression(expression).setDefaultMsg(defaultMsg);

    //
    $validationProvider.setExpression({
      foo: function (value, scope, element, attrs) {
        $validationProvider.setDefaultMsg({
          foo: {
            error: 'Foo must equal ' + attrs.validfoo
          }
        });

        return value === attrs.validfoo;
      }
    });


    $validationProvider.setExpression({
        mock: function(value, scope, element, attrs) {
          //var $http = $injector.get('$http');
          $validationProvider.setDefaultMsg({
            mock: {
              error: 'Foo must equal ' + attrs.validfoo
            }
          });

          return value === attrs.validfoo;
        },
        url:"abc"
      }
    );

    //自定义最大值最小值消息
    $validationProvider.setExpression({
        maxValue: function (value, scope, element, attrs, param) {
          $validationProvider.setDefaultMsg({
            maxValue: {
              error: "{{'maxValue' | translate}}" + param
            }
          });
          return parseInt(value) <= parseInt(param);
        },
        minValue: function (value, scope, element, attrs, param) {
          $validationProvider.setDefaultMsg({
            minValue: {
              error: "{{'minValue' | translate}}" + param
            }
          });
          return parseInt(value) >= parseInt(param);
        }
      }
    );

    $validationProvider.setErrorHTML(function (msg) {
      return  "<label class=\"control-label has-error\" style='color: red;'>" + msg + "</label>";
      //return '<label class="control-label has-error\" style="color: red;">' + this.$injector.get('$translate').instant(msg) + '</label>';

    });



  }


})();
