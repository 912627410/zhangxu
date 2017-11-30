(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .config(validationuleConfig);

  /** @ngInject */
  function validationuleConfig($validationProvider) {
    var expression = {
      required: function (value) {
        return !!value;
      },
      url: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/,
      email: /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/,
      number: /^\d+$/,
      numberAndChar: /^[a-zA-Z0-9]+$/,
      numberAndCharAndDot: /^[a-zA-Z0-9.-]+$/,
      numberAndDot: /^[0-9.]+$/,
      numberAndCharForPass: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,20}$/,
      minlength: function (value, scope, element, attrs, param) {
        return value.length >= param;
      },
      maxlength: function (value, scope, element, attrs, param) {
        return value.length <= param;
      },
      maxValue: function (value, scope, element, attrs, param) {
        return parseInt(value) <= parseInt(param);
      },
      minValue: function (value, scope, element, attrs, param) {
        return parseInt(value) >= parseInt(param);
      }
    };

    var defaultMsg = {
      required: {
        error: '该字段不能为空',
        success: ''
      },

      url: {
        error: '请输入合法的url',
        success: ''
      },
      email: {
        error: '请输入合法的邮件地址',
        success: ''
      },
      number: {
        error: '输入内容只能为数字',
        success: ''
      },
      numberAndChar: {
        error: '输入内容只能为数字和字母',
        success: ''
      },
      numberAndCharAndDot: {
        error: '输入内容只能为数字,字母和点',
        success: ''
      },
      numberAndDot: {
        error: '输入内容只能为数字和点',
        success: ''
      },
      minlength: {
        error: '位数不够',
        success: ''
      },
      maxlength: {
        error: '超出最大允许长度',
        success: ''
      },
      minValue: {
        error: '不能小于',
        success: ''
      },
      maxValue: {
        error: '不能大于',
        success: ''
      },
      numberAndCharForPass: {
        error: '密码必须包含大写字母、小写字母和数字，长度8-20',
        success: ''
      }
    }

    $validationProvider.setExpression(expression).setDefaultMsg(defaultMsg);

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
        abc: function (value, scope, element, attrs) {
          var params = {deviceNum: "c"};
          return $http.get(
            "rest/device/fetchUnused",
            {params: params}
          ).then(function (response) {
            alert(response.data);
          });
          return value === attrs.validfoo;
        }
      }
    );

    $validationProvider.setExpression({
        mock: function (value, scope, element, attrs) {
          $validationProvider.setDefaultMsg({
            mock: {
              error: 'Foo must equal ' + attrs.validfoo
            }
          });
          return value === attrs.validfoo;
        },
        url: "abc"
      }
    );

    //自定义最大值最小值消息
    $validationProvider.setExpression({
        maxValue: function (value, scope, element, attrs, param) {
          $validationProvider.setDefaultMsg({
            maxValue: {
              error: '不能大于 ' + param
            }
          });
          return parseInt(value) <= parseInt(param);
        },
        minValue: function (value, scope, element, attrs, param) {
          $validationProvider.setDefaultMsg({
            minValue: {
              error: '不能小于 ' + param
            }
          });
          return parseInt(value) >= parseInt(param);
        },
      }
    );

    $validationProvider.setErrorHTML(function (msg) {
      return "<label class=\"control-label has-error\" style='color: red;'>" + msg + "</label>";
    });

  }

})();
