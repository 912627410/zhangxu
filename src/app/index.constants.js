/* global malarkey:false, moment:false */
(function() {
  'use strict';
   var SERVER_BASE_URL = 'http://localhost:8080/rest/';
   var WEBSOCKET_DOMAIN_NAME = 'localhost';
  //生产环境的https协议地址
  //var SERVER_BASE_URL = 'https://iotserver2.nvr-china.com/rest/';
  angular
    .module('GPSCloud')
    .constant('malarkey', malarkey)
    .constant('SYSTEM_VERSION', '1.16')    //系统版本号
    .constant('DEFAULT_SIZE_PER_PAGE', 40)    //默认每页显示纪录数
    .constant('DEFAULT_MINSIZE_PER_PAGE', 10)    //默认每页显示纪录数
    .constant('AMAP_QUERY_TIMEOUT_MS', 3000)  //高德地图api调用延时毫秒数
    .constant('DEFAULT_DEVICE_SORT_BY', 'lastDataUploadTime,desc')    //读取设备时的默认排序规则
    .constant('DEFAULT_USER_SORT_BY', 'ssn,desc')    //读取用户信息时的默认排序规则
    .constant('DEFAULT_DEVICE_DATA_SORT_BY', 'recordTime,desc')    //读取设备数据时的默认排序规则
    .constant('DEFAULT_DEVICE_WARNING_DATA_SORT_BY', 'warningTime,desc')    //读取设备报警数据时的默认排序规则
    .constant('DEFAULT_DEVICE_LOCK_DATA_SORT_BY','sendTime,desc')     //读取锁车短信的默认排序规则
    .constant('DEFAULT_NOTIFICATION_SORT_BY', 'recordTime,desc')    //读取提醒数据时的默认排序规则
    .constant('UPDATE_FILE_DATA_BY', 'createTime,desc')   //读取升级文件时的默认排序规则
    .constant('UPDATE_RECORD_SORT_BY', 'recordTime,desc') //读取设备升级记录时的默认排序规则
    .constant('WEBSOCKET_URL', 'ws://'+ WEBSOCKET_DOMAIN_NAME +':8085/')  //WebSocket 请求地址

    .constant('AMAP_URL', 'https://webapi.amap.com/maps?v=1.3&key=d73f64a6c9a3286448bf45a2fe6863c2&callback=init')   //高德地图URL
    .constant('AMAP_GEO_CODER_URL', 'https://webapi.amap.com/maps?v=1.3&key=d73f64a6c9a3286448bf45a2fe6863c2&plugin=AMap.Geocoder,AMap.MarkerClusterer')
    .constant('AMAP_PLACESEARCH_URL', 'https://webapi.amap.com/maps?v=1.3&key=d73f64a6c9a3286448bf45a2fe6863c2&plugin=AMap.Autocomplete,AMap.PlaceSearch')
    .constant('GOOLE_MAP_SDK_URL','https://maps.googleapis.com/maps/api/js?key=AIzaSyAuPqfrGN8p4Dax8QBo9KvC3YO-ksoI6LU&libraries=drawing,geometry,places,visualization')

    .constant('SERVER_BASE_URL', SERVER_BASE_URL)

    .constant('USER_LOGIN_URL', SERVER_BASE_URL + 'user/gettoken')
    .constant('USER_REGISTER_URL', SERVER_BASE_URL + 'user/register')
    .constant('HOME_GPSDATA_URL', SERVER_BASE_URL + 'deviceMonitor/deviceinfopage?search_INSTRING_locateStatus=A,1,01&page=0&size=100&sort=lastDataUploadTime,desc')       //主页中地图数据,默认前100条
    .constant('HOME_STATISTICS_DATA_URL', SERVER_BASE_URL + 'device/homedata')  //主页的统计数据URL
    .constant('HOME_GOOGLEMAPGPSDATA_URL', SERVER_BASE_URL + 'device/homegooglemapgpsdata')       //主页中google地图数据
    .constant('DEVCE_PAGED_QUERY', SERVER_BASE_URL + 'device/deviceinfopage')   //分页查询设备信息URL
    .constant('DEVCE_MONITOR_PAGED_QUERY', SERVER_BASE_URL + 'deviceMonitor/deviceinfopage')   //分页查询设备监控信息URL
    .constant('DEVCE_MONITOR_SINGL_QUERY', SERVER_BASE_URL + 'deviceMonitor/deviceinfo')   //分页查询设备监控信息URL
    .constant('DEVCEINFO_PARAMETER_URL', SERVER_BASE_URL + 'deviceMonitor/deviceParameter')   //设备参数
    .constant('DEVCEINFO_URL', SERVER_BASE_URL + 'device/deviceinfo')   //设备crud
    .constant('DEVCE_DATA_PAGED_QUERY', SERVER_BASE_URL + 'device/devicedata')   //分页查询设备数据URL
    .constant('BATTERY_CHART_DATA', SERVER_BASE_URL + 'deviceCharger/historyData')   //充电设备电压数据URL
    .constant('BATTERY_FORM_DATA', SERVER_BASE_URL + 'deviceCharger/currentData')   //充电设备电液数据URL
    .constant('DEVCE_SIMPLE_DATA_PAGED_QUERY', SERVER_BASE_URL + 'device/devicesimpledata')   //分页查询设备简化数据URL
    .constant('DEVCE_SIMPLE_GPS_DATA_PAGED_QUERY', SERVER_BASE_URL + 'device/devicesimplegpsdata')   //分页查询设备简化数据URL
    .constant('DEVCEMONITOR_SIMPLE_DATA_PAGED_QUERY', SERVER_BASE_URL + 'deviceMonitor/devicesimpledata')   //分页查询设备简化数据URL
    .constant('DEVCEMONITOR_EXCELEXPORT', SERVER_BASE_URL + 'deviceMonitor/excelExport')   //数据导出简化URL
    .constant('DEVCEDATA_EXCELEXPORT', SERVER_BASE_URL + 'device/excelExport')   //devicedata导出
    .constant('DEVCE_NOUPLOAD_DATA_EXCELEXPORT', SERVER_BASE_URL + 'device/noUploadExcelExport')  //长时间未连接数据导出
    .constant('DEVCE_ECU_NOTACTIVE_QUERY', SERVER_BASE_URL + 'device/ecuNotActivePage')   //分页查询ecu未激活数据URL
    .constant('DEVCE_ECU_NOTACTIVE_EXCELEXPORT', SERVER_BASE_URL + 'device/ecuNotActiveExport')   //ecu未激活数据导出
    .constant('DEVCE_NORMAL_UNBOUND_QUERY', SERVER_BASE_URL + 'device/normalUnboundPage')   //分页查询正常解绑的车辆数据URL
    .constant('DEVCE_NORMAL_UNBOUND_EXPORT', SERVER_BASE_URL + 'device/normalUnboundExport')   //正常解绑的车辆导出
    .constant('DEVCEDINFO_EXCELEXPORT', SERVER_BASE_URL + 'device/deviceinfoexport')   //deviceInfoMng导出

    .constant('DEVCE_MF', SERVER_BASE_URL + 'config/mf')
    .constant('DEVCE_POWERTYPE', SERVER_BASE_URL + 'config/devicepowertype')
    .constant('DEVCE_HIGHTTYPE', SERVER_BASE_URL + 'config/deviceheighttype')
    .constant('DEVCE_DEVICETYPE', SERVER_BASE_URL + 'config/devicetype')

    .constant('DEVICEREPORT_ATTENDANCE_URL', SERVER_BASE_URL + 'deviceReport/getMachineAttendance')   //车辆出勤率
    .constant('DEVICEREPORT_EXPORT_URL', SERVER_BASE_URL + 'deviceReport/excelExport')   //deviceReport导出

    .constant('DEVCE_WARNING_DATA_PAGED_QUERY', SERVER_BASE_URL + 'device/warningdata')   //分页查询设备报警数据URL
    .constant('DEVCEMONITOR_WARNING_DATA_PAGED_QUERY', SERVER_BASE_URL + 'deviceMonitor/warningdata')   //分页查询设备报警数据URL
    .constant('DEVCE_LOCK_DATA_PAGED_QUERY',SERVER_BASE_URL+'device/locksms')//分页查询设备锁车数据url
    .constant('RESET_PASSWORD_URL', SERVER_BASE_URL + 'user/password')   //修改用户密码
    .constant('SUPER_RESET_PASSWORD_URL', SERVER_BASE_URL + 'user/superpassword')   //管理员修改用户密码
    .constant('USERINFO_URL', SERVER_BASE_URL + 'user/userinfo')   //用户基本信息
    .constant('USER_GROUPBY_ROLE_URL', SERVER_BASE_URL + 'user/userinfobyrole')   //按照role分组得到用户信息
    .constant('USER_PAGED_URL', SERVER_BASE_URL + 'user/userinfopage')   //用户信息分页
    .constant('NOTIFICATION_PAGED_URL', SERVER_BASE_URL + 'user/notification')   //用户提醒信息分页
    .constant('NOTIFICATION_STATISTICS_URL', SERVER_BASE_URL + 'user/notificationStatistics')   //用户提醒数量统计数据
    .constant('ORG_TREE_JSON_DATA_URL', SERVER_BASE_URL + 'config/organazition')   //组织机构信息,返回树状json代码
    .constant('QUERY_PARENTORG_URL', SERVER_BASE_URL + 'config/queryParentOrg')


    .constant('GET_VERIFYCODE_URL', SERVER_BASE_URL + 'user/getverifyCode')   //获取验证码
    .constant('JUDGE_VERIFYCODE_URL', SERVER_BASE_URL + 'user/judgeverifyCode')   //验证码判断
    .constant('USER_LOGINBYTOKEN_URL', SERVER_BASE_URL + 'user/loginBytoken')




    //车辆管理相关
    .constant('MACHINE_PAGE_URL',SERVER_BASE_URL + 'machine/machinepage') //车辆信息分页
    .constant('MACHINE_LOANPAGE_URL',SERVER_BASE_URL + 'machine/loanMachinePage') //车辆信息分页
    .constant('MACHINE_URL', SERVER_BASE_URL + 'machine/machine')   //车辆基本信息
    .constant('MACHINE_MOVE_ORG_URL', SERVER_BASE_URL + 'machine/moveOrg')   //车辆调拨
    .constant('MACHINE_MOVE_FLEET_URL', SERVER_BASE_URL + 'machine/moveFleet')   //车辆借调
    .constant('MACHINE_UNBIND_DEVICE_URL', SERVER_BASE_URL + 'machine/unbindDevice')   //设备解绑
    .constant('MACHINE_SALARY_TYPE_URL', SERVER_BASE_URL + 'machine/salaryType')   //人工成本类型
    .constant('MACHINE_UPKEETP_PRICE_TYPE_URL', SERVER_BASE_URL + 'machine/upkeepPriceType')   //保养成本类型
    .constant('MACHINE_UPLOADTEMPLATE_DOWNLOAD_URL', SERVER_BASE_URL + 'machine/uploadTemplateDownload')   //车辆导入模板下载
    .constant('MACHINE_UPLOAD_URL', SERVER_BASE_URL + 'machine/upload')   //车辆批量导入
    .constant('MACHINE_FENCE',SERVER_BASE_URL+'machine/setfence')  //车辆电子围栏
    .constant('MACHINE_FENCE_CACHE',SERVER_BASE_URL+'machine/cachefence')  //取消电子围栏
    .constant('MACHINE_EXCELEXPORT', SERVER_BASE_URL + 'machine/machineinfoexport')   //machineInfoMng导出
    .constant('MACHINE_TRANSPORTINFO_URL', SERVER_BASE_URL + 'machine/getMachineTransportInfos')   //查询车辆运行状态信息


    //系统参数相关
    .constant('SYS_CONFIG_URL', SERVER_BASE_URL + 'config/sysconfig')
    .constant('SYS_CONFIG_LIST_URL', SERVER_BASE_URL + 'config/sysconfigList')//系统参数List
    .constant('SYS_CONFIG_PAGE_URL',SERVER_BASE_URL + 'config/sysconfigpage')//系统参数信息分

    //sim卡管理相关
    .constant('SIM_PAGE_URL',SERVER_BASE_URL + 'sim/simpage') //sim卡信息分页
    .constant('SIM_URL', SERVER_BASE_URL + 'sim/sim')   //sim基本信息
    .constant('SIM_UPLOAD_URL', SERVER_BASE_URL + 'sim/upload')   //sim批量导入
    .constant('SIM_STATUS_URL', SERVER_BASE_URL + 'sim/simStatus')   //sim基本信息
    .constant('SIM_UNUSED_URL', SERVER_BASE_URL + 'sim/unused')   //批量返回未使用
    .constant('SIM_FETCH_UNUSED_URL', SERVER_BASE_URL + 'sim/fetchUnused')   //动态查询未使用的
    .constant('SIM_LOCATION_URL', SERVER_BASE_URL + 'sim/simLocation')   //查询sim卡定位信息
    //.constant('SIM_STATUS_URL', SERVER_BASE_URL + 'sim/simStatus')   //查询sim卡状态
    .constant('SIM_GRPS_URL', SERVER_BASE_URL + 'sim/simGprs')   //查询GPRS使用信息
    .constant('SIM_PROVIDER_URL', SERVER_BASE_URL + 'sim/simProvider')   //查询sim卡供应商使用信息
    .constant('SIM_UPLOADTEMPLATE_DOWNLOAD_URL', SERVER_BASE_URL + 'sim/uploadTemplateDownload')   //SIM导入模板下载

    .constant('ENGINE_TYPE_LIST_URL', SERVER_BASE_URL + 'config/enginetype')   //发动机类型集合
    .constant('MACHINE_STATE_LIST_URL', SERVER_BASE_URL + 'config/machineState')   //车辆状态集合

    .constant('DEIVCIE_TYPE_LIST_URL', SERVER_BASE_URL + 'config/devicetype')   //设备类型集合
    .constant('DEIVCIE_PROTOCAL_TYPE_LIST_URL', SERVER_BASE_URL + 'device/protocalTypeList')   //设备协议类型集合
    .constant('DEIVCIE_NOT_REGISTER_LIST_URL', SERVER_BASE_URL + 'device/notRegisterList')   //设备协议类型集合
    .constant('DEIVCIE_MOVE_ORG_URL', SERVER_BASE_URL + 'device/moveOrg')   //设备调拨
    .constant('DEIVCIE_FETCH_UNUSED_URL', SERVER_BASE_URL + 'device/fetchUnused')   //动态查询未使用的

    .constant('DEIVCIE_UNLOCK_FACTOR_URL', SERVER_BASE_URL + 'device/deviceunlock')   //查询解锁url

    //短信相关URL
    .constant('GET_ACTIVE_SMS_URL', SERVER_BASE_URL + 'sms/getActiveSms')   //得到短消息内容
    .constant('SEND_ACTIVE_SMS_URL', SERVER_BASE_URL + 'sms/sendActiveSms')   //发送短消息
    .constant('GET_UN_ACTIVE_LOCK_SMS_URL', SERVER_BASE_URL + 'sms/getUnActiveLockSMS')   //得到短消息内容
    .constant('SEND_UN_ACTIVE_LOCK_SMS_URL', SERVER_BASE_URL + 'sms/sendUnActiveLockSMS')   //发送短消息
    .constant('GET_LOCK_SMS_URL', SERVER_BASE_URL + 'sms/getLockSMS')   //得到短消息内容
    .constant('SEND_LOCK_SMS_URL', SERVER_BASE_URL + 'sms/sendLockSMS')   //发送短消息
    .constant('GET_UN_LOCK_SMS_URL', SERVER_BASE_URL + 'sms/getUnLockSMS')   //得到短消息内容
    .constant('SEND_UN_LOCK_SMS_URL', SERVER_BASE_URL + 'sms/sendUnLockSMS')   //发送短消息
    .constant('GET_SET_IP_SMS_URL', SERVER_BASE_URL + 'sms/getSetIpSMS')   //得到短消息内容
    .constant('SEND_SET_IP_SMS_URL', SERVER_BASE_URL + 'sms/sendSetIpSMS')   //发送短消息
    .constant('GET_SET_START_TIMES_SMS_URL', SERVER_BASE_URL + 'sms/getSetStartTimesSMS')   //得到短消息内容
    .constant('SEND_SET_START_TIMES_SMS_URL', SERVER_BASE_URL + 'sms/sendSetStartTimesSMS')   //发送短消息
    .constant('GET_SET_WORK_HOURS_SMS_URL', SERVER_BASE_URL + 'sms/getSetWorkHoursSMS')   //得到短消息内容
    .constant('SEND_SET_WORK_HOURS_SMS_URL', SERVER_BASE_URL + 'sms/sendSetWorkHoursSMS')   //发送短消息
    .constant('GET_SET_INTER_SMS_URL', SERVER_BASE_URL + 'sms/getSetInterSMS')   //得到短消息内容
    .constant('SEND_SET_INTER_SMS_URL', SERVER_BASE_URL + 'sms/sendSetInterSMS')   //发送短消息
    .constant('SMS_SEND_REPORT_URL', SERVER_BASE_URL + 'sms/smsSendReport')   //短信发送报表
    .constant('SET_FLEET_RETURN_TIME_URL', SERVER_BASE_URL + 'sms/setFleetReturnTime')   // 设置车队回传时间
    .constant('SET_FLEET_DEFAULT_RETURN_TIME_URL', SERVER_BASE_URL + 'sms/setFleetDefaultReturnTime')   // 设置车队默认的回传时间间隔

    //键盘数据相关
    .constant('VIEW_BIND_INPUT_MSG_URL', SERVER_BASE_URL + 'deviceKeyboard/getBindInputMsg')
    .constant('VIEW_UN_BIND_INPUT_MSG_URL', SERVER_BASE_URL + 'deviceKeyboard/getUnBindInputMsg')
    .constant('VIEW_LOCK_INPUT_MSG_URL', SERVER_BASE_URL + 'deviceKeyboard/getLockInputMsg')
    .constant('VIEW_UN_LOCK_INPUT_MSG_URL', SERVER_BASE_URL + 'deviceKeyboard/getUnLockInputMsg')
    .constant('VIEW_CANCEL_LOCK_INPUT_MSG_URL', SERVER_BASE_URL + 'deviceKeyboard/getCancelLockInputMsg')
    .constant('VIEW_SMS_URL', SERVER_BASE_URL + 'sms/getsms')   //得到短消息内容
    .constant('SEND_SMS_URL', SERVER_BASE_URL + 'sms/sendsms')   //发送短消息


    .constant('VIEW_KEYBOARD_MSG_URL', SERVER_BASE_URL + 'device/keyboard')   //得到键盘输入数据

    .constant('DEVCE_CHARGER_DATA', SERVER_BASE_URL + 'deviceCharger/deviceChargerData')  //市电电压

    //菜单相关
    .constant('MENU_URL', SERVER_BASE_URL + 'menu/menu')                     //菜单基本CRUD信息
    .constant('ROLE_MENU_LIST_URL', SERVER_BASE_URL + 'menu/roleMenuList')   //查询角色下的菜单权限项


    //权限相关
    .constant('PRIVILEGE_URL', SERVER_BASE_URL + 'privilege/privilege')               //权限基本CRUD信息
    .constant('PRIVILEGE_ROLE_URL', SERVER_BASE_URL + 'role/privilegeRole')           //权限隶属角色UR
    .constant('PERMISSIONS_URL', SERVER_BASE_URL + 'user/permissions')                //登陆用户的权限信息
    .constant('USER_PRIV_EXPORT_URL', SERVER_BASE_URL + 'privilege/userPrivExport')   //用户权限导出

    //角色相关
    .constant('ROLE_URL', SERVER_BASE_URL + 'role/role')                      //角色的基本CRUD
    .constant('ROLE_TYPE_URL', SERVER_BASE_URL + 'role/roleType')             //角色类型查询
    .constant('ROLE_USER_URL', SERVER_BASE_URL + 'role/roleUser')             //角色用户UR
    .constant('ROLE_PRIVILEGE_URL', SERVER_BASE_URL + 'role/rolePrivilege')   //角色权限UR

    //用户相关
    .constant('USER_PAGE_URL', SERVER_BASE_URL + 'user/userinfoPage')               //用户信息分页
    .constant('USER_ROLE_URL', SERVER_BASE_URL + 'role/userRole')                   //用户角色UR
    .constant('USER_STATUS_URL', SERVER_BASE_URL + 'user/statusList')               //用户状态信息
    .constant('USER_STATUS_DISABLE_URL', SERVER_BASE_URL + 'user/statusDisable')    //用户禁止
    .constant('USER_STATUS_ENABLE_URL', SERVER_BASE_URL + 'user/statusEnable')      //用户启用

     //车辆类型管理相关
    .constant('MACHINE_TYPE_URL', SERVER_BASE_URL + 'machineType/machineType')   //车辆管理分页信息  新增车辆类型 修改车辆类型
    .constant('MACHINE_TYPE_ORG_URL', SERVER_BASE_URL + 'machineType/machineTypeOrg')   //查询车辆类型与组织关系list,更新车辆类型与组织映射关系
    .constant('ORG_MACHINE_TYPE_URL', SERVER_BASE_URL + 'machineType/orgManchineTypeInfo')   //查询组织车辆类型信息,更新组织与车辆类型映射关系
    .constant('USER_MACHINE_TYPE_URL',SERVER_BASE_URL + 'machineType/machineTypeList') //通过用户所属组织id查询拥有的车辆类型信息


    // 燃油配置相关
    .constant('FUEL_CONFIG_PAGE_URL', SERVER_BASE_URL + 'fuelConfig/fuelConfigpage')   //燃油配置查询
    .constant('FUEL_CONFIG_OPER_URL', SERVER_BASE_URL + 'fuelConfig/fuelConfig')   //燃油配置CRUD



    .constant('ORG_TYPE_URL', SERVER_BASE_URL + 'config/orgTypeList')   //组织类型查询
    .constant('ORG_UPDATE_URL', SERVER_BASE_URL + 'org/updateOrg')   //修改组织
    .constant('ORG_ADD_URL', SERVER_BASE_URL + 'org/newOrg')   //新增组织
    .constant('NOTICE_PAGE_URL', SERVER_BASE_URL + 'notice/noticePage')   //保养提醒消息page


    //车队管理  CURD LIST PAGE
    .constant('FLEET_URL', SERVER_BASE_URL + 'fleet/fleetOper') //CRUD
    .constant('FLEET_PAGE_URL', SERVER_BASE_URL + 'fleet/fleetPage') // PAGE
    .constant('FLEET_LIST_URL', SERVER_BASE_URL + 'fleet/fleetList') // LIST
    .constant('FLEET_TREE_URL', SERVER_BASE_URL + 'fleet/fleetTree') // TREE

    //车队监控  作业点 作业路线 地图监控 图形监控 趟数统计
    .constant('WORK_LINE_URL', SERVER_BASE_URL + 'fleetMonitor/workLine') //作业路线
    .constant('WORK_POINT_URL', SERVER_BASE_URL + 'fleetMonitor/workPoint') //作业点
    .constant('WORK_RECORD_URL', SERVER_BASE_URL + 'fleetRecord/workRecord') //工作纪录
    .constant('WORK_POINT_RECORD_URL', SERVER_BASE_URL + 'fleetRecord/workPointRecord') //工作纪录
    .constant('WORK_INITIAL_MONITOR', SERVER_BASE_URL + 'fleetMonitor/workInitialMonitor') // 图形监控初始数据

    //车队收支  油耗 收入 成本核算
    .constant('DRIVER_RECORD_URL', SERVER_BASE_URL + 'fleetRecord/driverRecord') //行驶轨迹

    .constant('FUEL_CONSUMPTION_QUERY', SERVER_BASE_URL + 'fleetRecord/fuelConsumptionQuery')  //油耗分页查询
    .constant('FUEL_CONSUMPTION_STATISTICS', SERVER_BASE_URL + 'fleetRecord/fuelConsumptionStatistics')  //统计历史油耗

    .constant('PROFIT_STATISTICS_URL', SERVER_BASE_URL + 'fleetRecord/profitStatistics')  //利润统计


    .constant('FUEL_TYPE_URL', SERVER_BASE_URL + 'fuelConfig/fuelType')   //燃油类型
    .constant('FUEL_CONFIGT_LIST_URL', SERVER_BASE_URL + 'fuelConfig/fuelConfigList')   //燃油类型

    //称重数据
    .constant('WEIGHTDATA_PAGE_URL', SERVER_BASE_URL + 'weightData/weightDataPage')   //称重数据page
    .constant('ANALYSIS_INFLUX', SERVER_BASE_URL + 'analysis/getWorkAnalysisData')
    .constant('ANALYSIS_POSTGRES', SERVER_BASE_URL + 'analysis/getanalysisdata')


    .constant('LOAD_RECENT_UPLOAD_PAGE_URL', SERVER_BASE_URL + 'deviceMonitor/deviceDataWeekly')   //最近一周上传数据
    .constant('LOAD_TODAY_UPLOAD_PAGE_URL', SERVER_BASE_URL + 'deviceMonitor/deviceDataToday')   //当天数据上传

    //用户画像部分
    .constant('PORTRAIT_ENGINEPERFORMS_URL', SERVER_BASE_URL + 'portrait/getEnginePerforms')   //获取发动机评分
    .constant('PORTRAIT_RECENTLYSPEED_URL', SERVER_BASE_URL + 'portrait/getRecentlySpeed')   //获取最近的速度
    .constant('PORTRAIT_RECENTLYOIL_URL', SERVER_BASE_URL + 'portrait/getRecentlyOil')   //获取最近的oil
    .constant('PORTRAIT_WORKTIMELABEL_URL', SERVER_BASE_URL + 'portrait/getWorktimeAndStartTimes')   //获取最近的速度
    .constant('PORTRAIT_MACHINEEVENT_URL', SERVER_BASE_URL + 'portrait/getMachineEvent')   //获取事件List
    .constant('PORTRAIT_CUSTOMERINFO_URL', SERVER_BASE_URL + 'portrait/getCustomerInfo')   //获取客户信息


    .constant('MACHINE_ALLOCATION', SERVER_BASE_URL + 'audit/queryallocationlog')   //查询车辆调拨日志
    .constant('DEVCE_ALLOCATION', SERVER_BASE_URL + 'audit/queryallocationlog')   //查询设备调拨日志

    .constant('OPERATION_LOG_QUERY', SERVER_BASE_URL + 'audit/operationLogQuery')   //系统日志查询


    //org相关
    .constant('ORG_TREE_JSON_DATA_URL', SERVER_BASE_URL + 'config/organazition')   //组织机构信息,返回树状json代码
    .constant('ORG_URL', SERVER_BASE_URL + 'config/organization')   //组织基本信息
    .constant('ORG_ID_URL', SERVER_BASE_URL + 'config/getOrgById')   //根据ID查询组织信息
    .constant('ORG_PARENTID_URL', SERVER_BASE_URL + 'config/getOrgByParentId')   //根据parentId查询组织信息



    //高空车短信 by mariqian 20170306
    .constant('VIEW_SMS_EMCLOUD_URL', SERVER_BASE_URL + 'sms_emcloud/getsms')   //得到短消息内容
    .constant('SEND_SMS_EMCLOUD_URL', SERVER_BASE_URL + 'sms_emcloud/sendsms')   //发送短消息

    //模版url
    .constant('TEMPLATE_URL', SERVER_BASE_URL + 'template/getAll')   //得到短消息内容
    .constant('TEMPLATE_CREATE_URL', SERVER_BASE_URL + 'template/create')  //添加模版

    //租赁车辆管理
    .constant('RENTAL_HOME_MAP_GPSDATA_URL',SERVER_BASE_URL + 'rental/homeMapData')//租赁平台首页地图数据
    .constant('RENTAL_ALARM_MSG_URL',SERVER_BASE_URL + 'rental/alarmCount')//租赁平台首页报警消息
    .constant('RENTAL_MACHINE_COUNT_URL',SERVER_BASE_URL + 'rental/getMachineCount')//租赁平台首页车辆数量
    .constant('RENTAL_MACHINE_DATA_URL',SERVER_BASE_URL + 'rental/machines')//租赁平台车辆数据
    .constant('RENTAL_ALARM_MSG_DATA_URL',SERVER_BASE_URL + 'rental/getRentalNotifications')//租赁平台报警数据
    .constant('RENTAL_MACHINE_MONITOR_URL',SERVER_BASE_URL + 'rental/getRentalMachineCurrentStatus')//租赁平台车辆当前位置
    .constant('RENTAL_MACHINE_URL',SERVER_BASE_URL + 'rental/machine')//租赁平台管理车辆
    .constant('RENTAL_NOTIFICATION_URL',SERVER_BASE_URL + 'rental/processRentalNotificationDeal')//租赁平台标记消息为已处理
    .constant('RENTAL_MACHINE_RATE_URL',SERVER_BASE_URL + 'rental/rentalRate')//租赁平台出租率

    //租赁客户信息
    .constant('RENTAL_CUSTOMER_PAGE_URL',SERVER_BASE_URL + 'rental/customer/customerpage')//租赁平台客户信息
    .constant('RENTAL_CUSTOMER_URL',SERVER_BASE_URL + 'rental/customer/customer')//租赁平台维护客户信息

    //维修信息
    .constant('RENTAL_MAINTENANCE_PAGE_URL',SERVER_BASE_URL + 'rental/maintenance/maintenancepage')//
    .constant('RENTAL_MAINTENANCE_URL',SERVER_BASE_URL + 'rental/maintenance/maintenance')//

    //租赁订单
    .constant('RENTAL_ORDER_PAGE_URL',SERVER_BASE_URL + 'rental/order/orderpage')//租赁订单信息
    .constant('RENTAL_ORDER_URL',SERVER_BASE_URL + 'rental/order/order')//租赁平台维护订单信息
    .constant('RENTAL_ORDER_STATUS',SERVER_BASE_URL + 'rental/order/statusList')//租赁平台维护订单信息

    //租赁车辆信息
    .constant('RENTAL_ORDER_MACHINE_PAGE_URL',SERVER_BASE_URL + 'rental/orderMachine/page')//租赁订单信息
    .constant('RENTANL_ORDER_MACHINE_BATCH_OPER_URL',SERVER_BASE_URL + 'rental/orderMachine/batchOper')//租赁车辆批量管理信息
    .constant('RENTANL_UNUSED_MACHINE_PAGE_URL',SERVER_BASE_URL + 'rental/unUsedMachines')//未出租车辆查询信息


    //远程升级
    .constant('UPDATE_DEVICE_INFO_QUERY', SERVER_BASE_URL + 'update/updateDeviceInfoPage') //升级的设备信息
    .constant('UPDATE_FILE_UPLOAD_URL', SERVER_BASE_URL + 'update/upload') //升级文件上传
    .constant('UPDATE_FILE_UPLOAD_QUERY', SERVER_BASE_URL + 'update/updateFilePage') //分页查询升级文件URL
    .constant('UPDATE_URL', SERVER_BASE_URL + 'update/update') //升级
    .constant('CANCEL_UPDATE_URL', SERVER_BASE_URL + 'update/cancelUpdate') // 取消升级
    .constant('UPDATE_RECORD_URL', SERVER_BASE_URL + 'update/updateRecordPage') //分页查询升级记录
    .constant('MODIFY_FILE_URL', SERVER_BASE_URL + 'update/modifyFile') //修改升级文件


     //租赁
    .constant('MACHINE_MF', SERVER_BASE_URL + 'config/machinemf')
    .constant('RENTAL_INCOME_URL', SERVER_BASE_URL + 'rental/asset/getIncomeStatistics')
    .constant('RENTAL_ASSET_STATISTICS_DATA_URL', SERVER_BASE_URL + 'rental/asset/assetTopData')
    .constant('ALERT_TREND_URL', SERVER_BASE_URL + 'rental/alarmCountByDate');  //报警七天趋势



})();
