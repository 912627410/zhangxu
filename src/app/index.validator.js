(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .config(validatorConfig);

  /** @ngInject */
  function validatorConfig(w5cValidatorProvider) {
    // 全局配置
    w5cValidatorProvider.config({
      blurTrig: false,
      showError: true,
      removeError: true
    });

    w5cValidatorProvider.setRules({
      required: "该选项11不能为空",
      email: {
        required: "输入的邮箱地址不能为空",
        email: "输入邮箱地址格式不正确"
      },
      phoneNumber: {
        required: "输入的Sim卡不能为空",
        email: "输入的Sim卡不能为空"
      },
      username: {
        required: "输入的用户名不能为空",
        pattern: "用户名必须输入字母、数字、下划线,以字母开头",
        w5cuniquecheck: "输入用户名已经存在，请重新输入"
      },
      password: {
        required: "密码不能为空",
        minlength: "密码长度不能小于{minlength}",
        maxlength: "密码长度不能大于{maxlength}"
      },
      repeatPassword: {
        required: "重复密码不能为空",
        repeat: "两次密码输入不一致"
      },
      number: {
        required: "数字不能为空"
      },
      customizer: {
        customizer: "自定义验证数字必须大于上面的数字"
      }
    });
  }

})();
