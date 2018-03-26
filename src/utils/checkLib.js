/* eslint-disable */
'use strict';

// exports.url = function (value) {
//   var pattern = /^(?:(?:https?|ftp):\/\/)?(?:(?(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i;
//   return pattern.test(value);
// };

//是否为邮件地址
exports.email = function (value) {
    var pattern = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
    return pattern.test(value);
};

//检查是否为信用卡号
exports.creditCard = function (value) {
    var pattern = /^(?:(4[0-9]{12}(?:[0-9]{3})?)|(5[1-5][0-9]{14})|(6(?:011|5[0-9]{2})[0-9]{12})|(3[47][0-9]{13})|(3(?:0[0-5]|[68][0-9])[0-9]{11})|((?:2131|1800|35[0-9]{3})[0-9]{11}))$/;
    return pattern.test(value);
};

//是否为基本的字符
exports.alphaNumeric = function (value) {
    var pattern = /^[A-Za-z0-9]+$/;
    return pattern.test(value);
};

//是否为基本的字符+中文
exports.alphaNumericChinese = function (value) {
    var pattern = /^[A-Za-z0-9\u4e00-\u9fa5]+$/;
    return pattern.test(value);
};

//是否为基本的字符+空格+中文
exports.alphaNumericSpaceChinese = function (value) {
    var pattern = /^[A-Za-z0-9\u4e00-\u9fa5\s]+$/;
    return pattern.test(value);
};

//检查数字与字母组合
exports.alphaAndNumeric = function(value, option) {
  option = option || {};
  var max = option.max || 16;
  var min = option.min || 8;
  var pattern = '^(?!\\d+$)(?![a-zA-Z]+$)\\w{' + min + ',' + max + '}$';
  return new RegExp(pattern).test(value);
}

//检查英文人名
exports.EnglishName = function(value, option) {
  option = option || {};
  var max = option.max || 12;
  var min = option.min || 1;
  var pattern = '^[A-Za-z\\s]{' + min + ',' + max + '}$';
  return new RegExp(pattern).test(value);
}

//检查中文人名
exports.ChineseName = function(value, option) {
  option = option || {};
  var max = option.max || 6;
  var min = option.min || 1;
  var pattern = '^[\\u4e00-\\u9fa5]{' + min + ',' + max + '}$';
  return new RegExp(pattern).test(value);
}

//检查是否为中国的手机号码
exports.phone = function (value) {
    //var pattern = /(^(13\d|15[^4,\D]|17[1356789]|18\d|14\d)\d{8}|170[^346,\D]\d{7})$/;
    var pattern = /^1[3|4|5|8|9|7][0-9]\d{4,8}$/;
    return pattern.test(value);
};

//检查是否为中国的电话号码
exports.tel = function (value) {
    var pattern = /^[0-9]{3,4}-[0-9]{7,8}$/;
    return pattern.test(value);
};

//是否为整型, 不检查是否超出整型的范围
exports.integer = function (value) {
    var pattern = /^[1-9]\d+$/;
    return pattern.test(value);
};

//检查是否为合法的小数
exports.decimal = function (value) {
    var pattern = /^[-+]?[0-9]\d*(\.\d+)?$/;
    return pattern(value);
};

//是否为不存在
exports.existy = function (value) {
    return value !== null && value !== undefined;
};

//检查是否为函数
exports.func = function (value) {
    return Object.prototype.toString.call(value) === '[object Function]';
};

//检查是否为邮编
exports.postcode = function (value) {
    var pattern = /[1-9]\d{5}(?!\d)/;
    return pattern.test(value);
};

//检查身份证号
exports.idcard = function (value) {
    var pattern = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
    return pattern.test(value.toUpperCase());
};
