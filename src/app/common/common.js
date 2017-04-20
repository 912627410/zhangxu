//打开一个模式窗口
function openWindow(url) {
	if (window.showModalDialog){
		window.showModalDialog(url,'','unadorned:yes;dialogWidth:755px;dialogHeight:550px');
	}else{
		window.open(url,'','width=755,height=550,toolbar=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes ,modal=yes');
	}
}



//判断是否为null
function isNull(str){
	if(null==str||str.length==0){
		return true;
	}else{
		return false;
	}
}

//去除字符串左边的空格
function lTrim(str)
{
    var whitespace = new String(" \t\n\r");
    var s = new String(str);
    if (whitespace.indexOf(s.charAt(0)) != -1)
    {
        var j=0, i = s.length;
        while (j < i && whitespace.indexOf(s.charAt(j)) != -1)
        {
            j++;
        }
        s = s.substring(j, i);
    }
    return s;
}
//去除字符串右边的空格
function rTrim(str)
{
    var whitespace = new String(" \t\n\r");
    var s = new String(str);
    if (whitespace.indexOf(s.charAt(s.length-1)) != -1)
    {
        var i = s.length - 1;
        while (i >= 0 && whitespace.indexOf(s.charAt(i)) != -1)
        {
            i--;
        }
        s = s.substring(0, i+1);
    }
    return s;
}
//去除字符串前后空格
function trim(str)
{
    return rTrim(lTrim(str));
	//return str.replace(/^\s*|\s*$/g,"");
}

/**
 * 给String类型的对象增加一个去除前空格的属性
 */
String.prototype.LTrim = function(){
	return this.replace(/(^\s*)/g, "");
}

/**
 * 给String类型的对象增加一个去除前后空格的属性
 */
String.prototype.Trim = function(){
	return this.replace(/^\s*|\s*$/g,"");
}

//检查字符串实际长度，分半角全角
function checkLength(str,minLength,maxLength)
{
	len = 0;
	for (i = 0; i < str.length; i++){
		if (((str.charCodeAt(i) >= 0x3400) && (str.charCodeAt(i) < 0x9FFF)) || (str.charCodeAt(i) >= 0xF900))
    	{
      		len = len + 2;
    	}
		else
		{
			len++;
		}
	}
	if(len > maxLength || len < minLength){
		return false
	}
	else{
		return true;
	}
}

//
function getLength(str,maxLength)
{
	len = 0;
	for (i = 0; i < str.length; i++){
		if (((str.charCodeAt(i) >= 0x3400) && (str.charCodeAt(i) < 0x9FFF)) || (str.charCodeAt(i) >= 0xF900))
    	{
      		len = len + 2;
    	}
		else
		{
			len++;
		}
	}
	return maxLength-len;
}

function getString(str,maxLength)
{
	var string="";
	len = 0;
	for (i = 0; i < str.length; i++){
		if (((str.charCodeAt(i) >= 0x3400) && (str.charCodeAt(i) < 0x9FFF)) || (str.charCodeAt(i) >= 0xF900))
    	{
    	len = len + 2;

    	}
		else
		{
		len++;

		}
		if(len>maxLength){
			len=i;
			break;
		}
	}
	string=str.substring(0,len);
	return string;
}

//检查字符串是否全部是数字
function onlyNumber(str)
{
	var reg = /^\d+$/;
	if (!reg.test(str)) {
	    return false;
	}else{
		return true;
	}
}
//检查字符串是否全部是数字和英文
function onlyNumberAndChar(str)
{
	var reg = /^[a-zA-Z0-9]+$/;
	if (!reg.test(str)) {
	    return false;
	}else{
		return true;
	}
}
//检查字符串是否全部是英文
function onlyChar(str)
{
	var reg = /^[a-zA-Z]+$/;
	if (!reg.test(str)) {
	    return false;
	}else{
		return true;
	}
}

//检查字符串是否是ip地址格式
function onlyIPAddress(str)
{
	var reg = /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/;
	if (!reg.test(str)) {
	    return false;
	}else{
		return true;
	}
}

/*检测URL*/
function checkURL(str)
{
    //var reg = /^(http:\/\/)[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+(\/.*)*$/;
	//var reg = /^[h|H][t|T]{2}[p|P]:\/\/.+$/;

	var reg =/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
	reg.IgnoreCase = false;
	if (!reg.test(str)) {
	    return false;
	}else{
		return true;
	}
}


function checkURLContent(str)
{
	//var reg = /^[h|H][t|T]{2}[p|P]:\/\/.+$/;

	var reg=/^(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;

	reg.IgnoreCase = false;
	if (!reg.test(str)) {
	    return false;
	}else{
		return true;
	}
}

//检查字符串是否符合日期格式yyyy-MM-dd
function onlyDate(str)
{
	var reg = /^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}$/;
	if (!reg.test(str)) {
	    return false;
	}else{
		return true;
	}
}
//检查字符串是否符合日期格式yyyy-MM-dd hh:mm
function onlyFullDate(str)
{
	var reg = /^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}(\s[0-9]{1,2}:[0-9]{1,2}){0,1}$/;
	if (!reg.test(str)) {
	    return false;
	}else{
		return true;
	}
}

//检查字符串是否符合日期格式yyyy-MM-dd hh:mm:ss
function onlyDateYMS(str)
{
	var reg = /^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}(\s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}){0,1}$/;
	if (!reg.test(str)) {
	    return false;
	}else{
		return true;
	}
}
//比较字符串相等
function isSame(str1,str2){
    if(str1.length==str2.length && str1.search(str2)==0)
    	//相等
        return true;
    else
    	//不相等
        return false;
}
//输入框鼠标输入字数检查
function numerro(erroId,showId,erroNum){
	var num = document.getElementById(erroId).value.length;
	if (num > erroNum){
		document.getElementById(showId).innerHTML = "0";
		document.getElementById(showId).style.color = "#ff0000";
		var str = document.getElementById(erroId).value;
		document.getElementById(erroId).value = str.substring(0,erroNum);
	}else{
		document.getElementById(showId).innerHTML = erroNum-num;
		document.getElementById(showId).style.color = "#000000";
	}
}

/**
 * 两个数字相减，第二个减去第一个
 * @param firstNumber
 * @param secondNumber
 * @return 两个数字相减得到的值
 */
function subtractNumber(firstNumber,secondNumber)
{
	return secondNumber-firstNumber;
}


/**
 * 检查字符串的长度，其中一个汉字算两个字符
 * @param str 字符串
 * @return 字符串的长度
 */
function getStrLength(str){
	len = 0;
	for (i = 0; i < str.length; i++){
		if (((str.charCodeAt(i) >= 0x3400) && (str.charCodeAt(i) < 0x9FFF)) || (str.charCodeAt(i) >= 0xF900))
    	{
      		len = len + 2;
    	}
		else
		{
			len++;
		}
	}
	return len;
}


/**
 * 截取字符串中途指定长度的字符，其中一个汉字算两个字符
 * @param str 字符串
 * @param maxLength 传入的长度
 * @return 字符串的长度
 */
function getSubString(str,maxLength)
{

	var newString=str;

	//得到字符串的长度
	var stringLength=getStrLength(str);

	//如果小于0，表示超过指定长度，则截字符串
	if(subtractNumber(stringLength,maxLength)<0){
		len = 0;
		for (i = 0; i < str.length; i++){
			if (((str.charCodeAt(i) >= 0x3400) && (str.charCodeAt(i) < 0x9FFF)) || (str.charCodeAt(i) >= 0xF900)){
    			len = len + 2;
		    }
			else{
				len++;
			}

			//得到要截取字符的位置
			if(len>maxLength){
				len=i;
				break;
			}
		}
		newString=newString.substring(0,len);
		return newString;
	}else{
		return newString;
	}
}

/**
 * 检查字符串的长度是否超过指定长度，其中一个汉字算两个字符
 * @param str 字符串
 * @param maxLength 传入的长度
 * @return true 未超出 | false 超出
 */
function checkStringLength(str,maxLength){
	var newString=str;

	//得到字符串的长度
	var stringLength=getStrLength(str);

	//如果小于0，表示超过指定长度
	if(subtractNumber(stringLength,maxLength)<0){
		return false;
	}else{
		return true;
	}
}

function checkEmail(s) {

	if (s.length < 7 || s.length > 50) {
		return false;
	}
	var regu = "^(([0-9a-zA-Z]+)|([0-9a-zA-Z]+[_.0-9a-zA-Z-]*[0-9a-zA-Z]+))@([a-zA-Z0-9-]+[.])+([a-zA-Z]{2}|abc|net|NET|com|COM|gov|GOV|mil|MIL|org|ORG|edu|EDU|int|INT)$"
	var re = new RegExp(regu);
	if (s.search(re) != -1) {
		return true;
	} else {
		return false;
	}
}


//showHighLight,hideHighLight 组合实现闪动效果
function hideHighLight(id,times){
    var obj=$("#"+id);
    obj.css("background-color","#FFF");
    if(times<0){
        return;
    }
    times=times-1;
    setTimeout("showHighLight('"+id+"',"+times+")",600);
}

function showHighLight(id,times){
    var obj=$("#"+id);
    obj.css("background-color","#F6CECE");
    times=times-1;
    setTimeout("hideHighLight('"+id+"',"+times+")",600);
}

/**
 * 前补0操作
 * @param number String 待操作字符串
 * @param length int 目标长度
 */
function addZero(str,length){
  return new Array(length - str.toString().length + 1).join("0") + str;
}
