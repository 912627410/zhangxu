(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .config(validationuleConfig);

  /** @ngInject */
  function validationuleConfig($validationProvider,$injector) {
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
      //numberAndCharForPass:/[a-zA-Z0-9_]{8,10}/,
      //numberAndCharForPass:/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,20}$/,
      numberAndCharForPass:/^(?![^A-Za-z]+$)(?![^0-9]+$)[\x21-x7e]{6,}$$/,
     // numberAndChar: /^[c0|c1|c2]{1}[0-9]$/,
      telephoneNo:/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/,
      postcode:/^[1-9]\d{5}(?!\d)$/,

      minlength: function(value, scope, element, attrs, param) {
        return value.length >= param;
      },
      maxlength: function(value, scope, element, attrs, param) {
        return value.length <= param;
      }
    };

    //var $http = $validationProvider.$http;

    //alert($validationProvider.$q);

    var defaultMsg = {
      required: {
        error: 'required',
        success: ''
      },

      url: {
        error: 'urlNotLegal',
        success: ''
      },
      email: {
        error: 'emailNotLegal',
        success: ''
      },
      number: {
        error: 'numberOnly',
        success: ''
      },
      numberAndChar: {
        error: 'numberAndChar',
        success: ''
      },
      numberAndCharAndDot: {
        error: 'numberAndCharAndDot',
        success: ''
      },
      numberAndDot: {
        error: 'numberAndDot',
        success: ''
      },
      minlength: {
        error: 'minlength',
        success: ''
      },
      maxlength: {
        error: 'maxlength',
        success: ''
      },
      numberAndCharForPass: {
        error: 'numberAndCharForPass',
        success: ''
      },
      telephoneNo: {
        error: 'telephoneNo',
        success: ''
      },
      postcode: {
        error: 'postcodes',
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


    $validationProvider.setErrorHTML(function (msg) {
      //return  "<label class=\"control-label has-error\" style='color: red;'>" + msg + "</label>";
      return '<label class="control-label has-error\" style="color: red;">' + this.$injector.get('$translate').instant(msg) + '</label>';

    });



  }


})();
