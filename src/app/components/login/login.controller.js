/**
 * Created by shuangshan on 16/1/2.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('LoginController', LoginController);


  /** @ngInject */

  function LoginController($rootScope, $scope, $http, $cookies, $filter, $stateParams, commonFactory, $window, ORG_TREE_JSON_DATA_URL, SYS_CONFIG_URL, SYS_CONFIG_LIST_URL, PERMISSIONS_URL, GET_VERIFYCODE_URL, JUDGE_VERIFYCODE_URL, FLEET_TREE_URL, $confirm, Notification, serviceResource, permissions, Idle, Title, languages) {
    var vm = this;
    var userInfo;
    var rootParent = {id: 0}; //默认根节点为0
    vm.rememberMe = true;
    var count = 0;
    $scope.isShow = false;
    var verifyCodeInfo = {
      token: '',
      value: ''
    }

    /**
     * 通过后台返回的结构生成json tree
     * @param array
     * @param parent
     * @param tree
     * @returns {Array|*}
     */
    vm.unflatten = function (array, parent, tree) {
      tree = typeof tree !== 'undefined' ? tree : [];
      parent = typeof parent !== 'undefined' ? parent : {id: 0};

      var children = _.filter(array, function (child) {
        return child.parentId == parent.id;
      });

      if (!_.isEmpty(children)) {
        //判断是否是根节点
        if (parent.id == 0) {
          tree = children;

        } else {
          parent['children'] = children
        }
        _.each(children, function (child) {
          vm.unflatten(array, child, null)
        });
      }


      //alert("tree="+tree);
      return tree;
    };

    /**
     * 当页面加载完,根据token自动登录
     */
    $scope.$on('$viewContentLoaded', function () {
      if (null != $cookies.getObject("IOTUSER") && null == $cookies.getObject("IOTSTATUS")) {
        var userobj = {};
        userobj.username = $cookies.getObject("IOTUSER").username;
        userobj.authtoken = $cookies.getObject("IOTUSER").authtoken;
        vm.loginBytoken(userobj);
      } else {
        $rootScope.$state.go('login');
      }
    });

    /**
     * 当用户名改变的时候清空密码
     */
    vm.reset = function () {
      vm.credentials.password = null;
    }

    /**
     * 创建验证码
     */
    vm.createVerifyCode = function () {
      var rspdata = serviceResource.restCallService(GET_VERIFYCODE_URL, "GET");
      rspdata.then(function (data) {
        verifyCodeInfo = {
          token: data.token,
          value: data.verifyCode
        }
        vm.verifyCode = verifyCodeInfo.value;
      })
    }

    /**
     * 登录函数
     */
    vm.loginMe = function () {
      vm.createVerifyCode();
      var code = vm.code;
      if ($scope.isShow && null != code && "" != code) {
        var restCallURL = JUDGE_VERIFYCODE_URL;
        restCallURL += "?&token=" + verifyCodeInfo.token + '&code=' + code;
        var rspData = serviceResource.restCallService(restCallURL, "GET");
        rspData.then(function (data) {
          if (data.code == 0) {
            Notification.error("验证码输入错误！请重新输入！！");
          }
          if (data.code == 1) {
            vm.userverify();
          }
        })
      } else if (!$scope.isShow) {
        vm.userverify();
      } else {
        Notification.error("请输入验证码！！");
      }
    }

    /**
     * 按照token方式登录
     * @param userobj
     */
    vm.loginBytoken = function (userobj) {
      vm.createVerifyCode();
      var rspPromise = serviceResource.authenticateb(userobj);
      rspPromise.then(function (response) {
        //存用户信息
        var data = response.data;
        userInfo = {
          authtoken: data.token,
          userdto: data.userinfo,
          tenantType: data.userinfo.organizationDto.tenantType
        };
        var passwordPattenStatus = data.passwordPattenStatus;
        //获取token和用户信息,存放到缓存中去
        $http.defaults.headers.common['token'] = data.token;
        $rootScope.userInfo = userInfo;
        $window.sessionStorage["userInfo"] = JSON.stringify(userInfo);

        var roleInfoList = $filter("array2obj")(data.roleInfos, "name");
        $rootScope.roleInfoList = roleInfoList;
        $window.sessionStorage["roleInfoList"] = JSON.stringify(roleInfoList);

        if (userInfo.userdto.organizationDto.logo != null && userInfo.userdto.organizationDto.logo != "") {
          $rootScope.logo = "assets/images/" + $rootScope.userInfo.userdto.organizationDto.logo;

        } else {
          $rootScope.logo = "assets/images/logo2.png";
        }
        //Notification.success(languages.findKey('loginSuccess'));

        //监控用户登录超时
        Idle.watch();

        vm.getPermission();
      }, function (reason) {
        //Notification.error(languages.findKey('loginFailure'));
        count = count + 1;
        if (count == 2) {
          $scope.isShow = true;
        }
        vm.changeVerifyCode();
      });
    }

    /**
     * 用户验证
     */
    vm.userverify = function () {
      var rspPromise = serviceResource.authenticatea(vm.credentials);
      rspPromise.then(function (response) {
        //存用户信息
        var data = response.data;
        userInfo = {
          authtoken: data.token,
          userdto: data.userinfo,
          tenantType: data.userinfo.organizationDto.tenantType
        };
        //记住我
        if (vm.rememberMe) {
          //检测是否存在cookie  IOTUSER
          $cookies.remove("IOTUSER");
          var cookieDate = {};
          cookieDate.username = vm.credentials.username;
          cookieDate.authtoken = userInfo.authtoken;
          var expireDate = new Date();
          expireDate.setDate(expireDate.getDate() + 5);//设置cookie保存5天
          $cookies.putObject("IOTUSER", cookieDate, {'expires': expireDate});
        } else {
          $cookies.remove("IOTUSER");
        }
        var passwordPattenStatus = data.passwordPattenStatus;
        //获取token和用户信息,存放到缓存中去
        $http.defaults.headers.common['token'] = data.token;
        $rootScope.userInfo = userInfo;
        $window.sessionStorage["userInfo"] = JSON.stringify(userInfo);

        var roleInfoList = $filter("array2obj")(data.roleInfos, "name");
        $rootScope.roleInfoList = roleInfoList;
        $window.sessionStorage["roleInfoList"] = JSON.stringify(roleInfoList);

        if (userInfo.userdto.organizationDto.logo != null && userInfo.userdto.organizationDto.logo != "") {
          $rootScope.logo = "assets/images/" + $rootScope.userInfo.userdto.organizationDto.logo;

        } else {
          $rootScope.logo = "assets/images/logo2.png";
        }
        //Notification.success(languages.findKey('loginSuccess'));
        $cookies.remove("IOTSTATUS");

        Title.restore();

        //监控用户登录超时
        Idle.watch();

        vm.getPermission(passwordPattenStatus);


      }, function (reason) {
        Notification.error(languages.findKey('loginFailure'));
        count = count + 1;
        if (count == 2) {
          $scope.isShow = true;
        }
        vm.changeVerifyCode();
      });
    }

    /**
     * 获取权限列表
     * @param passwordPattenStatus
     */
    vm.getPermission = function (passwordPattenStatus) {
      var rspData = serviceResource.getPermission();
      rspData.then(function (data) {
        var permissionList = $filter("array2obj")(data.content, "permission");
        $rootScope.permissionList = permissionList;
        $window.sessionStorage["permissionList"] = JSON.stringify(permissionList);

        vm.getOrg();

        if (permissions.getPermissions("fleetMng")) {
          vm.getFleet();
        }
        // 报警信息权限暂未定义
       // if (permissions.getPermissions("user:notification")) {
          vm.getNotification();
       // }

        //读取小挖型号参数
        var smallExcavatorURL = SYS_CONFIG_URL + "?name=SMALL_EXCAVATOR_MODEL";
        var smallExcavatorPromis = serviceResource.restCallService(smallExcavatorURL, "GET");
        smallExcavatorPromis.then(function (data) {
            $window.sessionStorage["SMALL_EXCAVATOR_MODEL"] = data.value;
            $rootScope.SMALL_EXCAVATOR_MODEL = data.value;
          }, function (reason) {
            Notification.error(languages.findKey('failedToGetSmallExcavatorModel'));
          }
        );

        //读取所有系统参数，放到rootscope中供其它controller使用
        var sysconfigUrl = SYS_CONFIG_LIST_URL;
        var sysconfigPromis = serviceResource.restCallService(sysconfigUrl, "QUERY");
        sysconfigPromis.then(function (data) {
            $window.sessionStorage["SYSCONFIG"] = data;
            $rootScope.SYSCONFIG = data;
          }, function (reason) {
            Notification.error(languages.findKey('failedToGetSysconfig'));
          }
        );

        //加载故障代码描述对照表(小挖)
        $http.get('warningDtc.json').success(function (data) {
          $rootScope.warningDataDtc = data;
          $window.sessionStorage["warningDataDtc"] = JSON.stringify(data);

        });

        //加载sensor列表
        $http.get('sensor.json').success(function (data) {
          $rootScope.sensor = data;
          $window.sessionStorage["sensor"] = JSON.stringify(data);
        });

        //判断是否需要提示修改密码
        if (passwordPattenStatus == false) {
          Notification.error({message: languages.findKey('passwordIsTooSimplePleaseModify'), positionX: 'center'});

        }

        //验证用户类别
        if (userInfo.tenantType != null && userInfo.tenantType != '') {
          var userTypes = userInfo.tenantType.split(",");

          if (userTypes.length >= 2) {
            //如果多种类型的用户,给出选择框进入系统
            $rootScope.$state.go('selectApp');
            return;
          }
          //增加判断是不是租赁平台的用户,如果是直接转到租赁的页面.1:代表物联网用户,2代表租赁用户如果有拥有多种类型中间逗号隔开.例如1,2既是物联网用户又是租赁用户
          if (userInfo.tenantType == '2') {
            //直接转入到租赁页面
            $rootScope.$state.go('rental');
            return;
          }
        }

        $rootScope.$state.go('home');
      }, function (reason) {
      });
    }

    /**
     * 读取组织结构信息
     */
    vm.getOrg = function () {
      var rspData = serviceResource.restCallService(ORG_TREE_JSON_DATA_URL, "QUERY");
      rspData.then(function (data) {
        //判断树形菜单的根节点,默认为0,然后根据用户的组织来进行更新
        var orgParent = rootParent;
        if (null != userInfo.userdto.organizationDto) {
          orgParent.id = userInfo.userdto.organizationDto.id;
          rootParent.id = orgParent.id;
        }

        //TODO生成树的方法,要求根的父节点必须为0才可以,临时这么写,后续需要优化
        var list = data;
        for (var i = 0; i < list.length; i++) {
          if (list[i].id == rootParent.id) {
            //  alert("1=="+list[i].parentId);
            list[i].parentId = 0;
            // alert("2=="+list[i].parentId);
            break;
          }
        }

        $rootScope.orgChart = vm.unflatten(list);

        $window.sessionStorage["orgChart"] = JSON.stringify($rootScope.orgChart);
      }, function (reason) {
        Notification.error(languages.findKey('failedToGetOrganizationInformation'));
      });
    }

    /**
     * 获取车队组织结构
     */
    vm.getFleet = function () {
      var rspData = serviceResource.restCallService(FLEET_TREE_URL, "GET");
      rspData.then(function (data) {

        var fleetList = data.content;

        $rootScope.fleetChart = commonFactory.unflatten(fleetList);

        $window.sessionStorage["fleetChart"] = JSON.stringify($rootScope.fleetChart);
      }, function (reason) {
        Notification.error(languages.findKey('failedToGetOrganizationInformation'));
      });
    }

    /**
     * 获取消息列表
     */
    vm.getNotification = function () {
      //读取未处理的提醒消息
      var notificationPromis = serviceResource.queryNotification(0, null, null, "processStatus=0");
      notificationPromis.then(function (data) {
          $rootScope.notificationNumber = data.page.totalElements;
          $window.sessionStorage["notificationNumber"] = $rootScope.notificationNumber;
        }, function (reason) {
          Notification.error(languages.findKey('failedToGetRemindInformation'));
        }
      );

      //读取未处理的地理位置报警消息
      var locationNotificationPromis = serviceResource.queryNotification(0, null, null, "processStatus=0&type=03");
      locationNotificationPromis.then(function (data) {
          vm.locationNotificationNumber = data.page.totalElements;
          if (vm.locationNotificationNumber > 1) {
            Notification.error({message: languages.findKey('moreInvalidLocationRemindInformation'), delay: true});
          }
          if (vm.locationNotificationNumber == 1) {
            Notification.error({message: data.content[0].content, delay: true});
          }
          $window.sessionStorage["locationNotificationNumber"] = vm.locationNotificationNumber;
        }, function (reason) {
          Notification.error(languages.findKey('failedToGetRemindInformation'));
        }
      );


    }

    /**
     *改变验证码
     */
    vm.changeVerifyCode = function () {
      var yzmImg = document.getElementById("yzmImg");
      var rspdata = serviceResource.restCallService(GET_VERIFYCODE_URL, "GET");
      rspdata.then(function (data) {
        verifyCodeInfo = {
          token: data.token,
          value: data.verifyCode
        }
        vm.verifyCode = verifyCodeInfo.value;
      })

      document.getElementById("verifyCode").value = "";

    }

    /**
     * 校验验证码
     */
    vm.validate = function () {
      var code = vm.code;
      if (null != code && "" != code) {
        var restCallURL = JUDGE_VERIFYCODE_URL;
        restCallURL += "?&token=" + verifyCodeInfo.token + '&code=' + code;
        var rspData = serviceResource.restCallService(restCallURL, "GET");
        rspData.then(function (data) {
          if (data.code == 0) {
            Notification.error("验证码输入错误！请重新输入！!");
            $scope.disabled = true;
          }
          if (data.code == 1) {
            Notification.success("验证码输入正确!");

          }
        })
      }

    }

    /**
     * 防止验证码被复制
     * @type {NodeList}
     */
    var codebox = document.getElementsByClassName("login-box-body")
    if (typeof(codebox.onselectstart) != "undefined") {
      codebox.onselectstart = new Function("return false");
    } else {
      codebox.onmousedown = new Function("return false");
      codebox.onmouseup = new Function("return true");
    }

  }
})();
