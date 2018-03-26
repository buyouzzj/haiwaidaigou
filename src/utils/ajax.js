/* eslint-disable */
import { message } from 'antd';
const ajaxLib = require('./lib/ajaxLib');

const _blank = () => {};

// 全局参数
let _domain = '';        // 请求的域名，若所有请求为统一接口服务器，末尾需带/
let _format = false;
let _onError = _blank;
let _onSuccess = _blank;

// let beforeRequest = '';
// let afterRequest = '';

// AJAX请求类
function AjaxClass(method, apiName, options) {
  const p = this;
  // 默认配置
  this.options = {
    type: 'GET',          // 请求类型
    apiName: '',          // 请求的接口地址
    params: '',           // 请求的URL参数
    data: '',             // 请求的payload
    dataType: 'JSON',     // 响应的格式
    timeout: 4000,        // 请求的超时时间
    crossDomain: true,    // 是否跨域
    format: 'inherit',    // 是否按照前端接口规范通讯
    useJSON: false,       // 是否将请求格式设为json
    useDomain: true,      // 设置全局domain的情况下，为false时可请求非该domain下的资源
    globalHook: true,     // 是否调用全局的onError与onSuccess（如果有）
    poll: false,          // 是否开启轮询模式
    pollTime: 0,          // 最大轮询次数，设0为不限制
    pollTimeout: 1000,    // 发起下一次轮询的时间间隔
  };
  this._request = null;
  this._aborted = false;
  this._succeed = false;
  this._failed = false;
  this._finished = false;
  this._succeedCb = _blank;
  this._failedCb = _blank;
  // 读取配置
  if (options) {
    Object.keys(options).forEach((key) => {
      p.options[key] = options[key];
    });
  }
  // 检测type与apiName
  this.options.type = method || this.options.type;
  this.options.apiName = apiName || this.options.apiName;
  // 整理URL参数
  if (this.options.params) {
    let urlParams = '';
    let isFirst = true;
    Object.keys(this.options.params).forEach((key) => {
      if (isFirst) {
        urlParams += '?';
        isFirst = false;
      } else {
        urlParams += '&';
      }
      urlParams = urlParams + key + '=' + p.options.params[key];
    });
    this.options.params = urlParams;
  }
  // 初始化XHR实例
  this.init();
}

AjaxClass.prototype.init = function init() {
  const p = this;
  // 非空处理
  let d = {};
  if (typeof p.options.data === 'object') {
    Object.keys(p.options.data).forEach((key) => {
      if (typeof p.options.data[key] !== 'undefined' && p.options.data[key] !== null) {
        d[key] = p.options.data[key];
      }
    });
  } else d = p.options.data;
  // 异步请求主体
  this._request = ajaxLib({
    type: p.options.type,
    url: (_domain && p.options.useDomain !== false ? _domain : '') + p.options.apiName + p.options.params,
    dataType: p.options.dataType,
    data: d,
    timeout: p.options.timeout,
    crossDomain: p.options.crossDomain,
    contentType: p.options.useJSON ? 'application/json; charset=utf-8' : '',
    success: (response) => {
      if (!p._aborted) {
        if (response) {
          let result;
          // json解析失败，返回type错误
          try {
            if (p.options.dataType.toLowerCase().match('json') && typeof response === 'string') {
              result = JSON.parse(response);
            } else {
              result = response;
            }
          } catch (e) {
            p._succeed = false; // 防止成功后失败
            p._failed = true; // 失败标记
            if (p.options.globalHook) _onError('ERROR_PARSE');
            p.handler('ERROR_PARSE');
          } finally {
            // json解析无错误，进行响应
            if (result.msg) {
              message.error(result.msg);
            }
            if (!p._failed) {
              // 返回数据
              let shouldFormat = false; // 默认不按接口规范
              if (_format) { // 如果全局设了_format为true，则需要按接口规范
                shouldFormat = true;
              }
              if (p.options.format !== 'inherit') { // 单个请求可单独设置
                shouldFormat = !!p.options.format;
              }
              if (!shouldFormat) { // format为真时需要按接口规范
                p._succeed = true; // 成功标记
                if (p.options.globalHook) _onSuccess(result, p);
                p.handler(result);
              } else if (result.success === true || result.success === 'true') {
                p._succeed = true; // 成功标记
                if (p.options.globalHook) _onSuccess(result.data, p);
                p.handler(result.data || {}); // 避免空返回影响结果的判断
              } else {
                p._failed = true; // 失败标记
                if (p.options.globalHook) {
                  _onError({
                    errorType: result.errorType || 'ERROR_RESPONSE',
                    errorMsg: result.msg || result.message || result.errorMsg,
                    errorCode: result.errorCode, // errorCode 还有 SESSION_TIMEOUT
                  }, p);
                }
                p.handler(result.errorType || 'ERROR_RESPONSE', result.msg || result.message || result.errorMsg, result.errorCode);
              }
            }
          }
        }
      }
    },
    error: (state, type) => {
      if (!p._aborted) {
        p._failed = true; // 失败标记
        if (type === 'timeout') {
          if (p.options.globalHook) {
            _onError({ errorType: 'ERROR_TIMEOUT', errorMsg: '请求超时' }, p);
          }
          p.handler('ERROR_TIMEOUT');
        } else {
          if (p.options.globalHook) {
            _onError({ errorType: 'ERROR_FAILED', errorMsg: '请求失败' }, p);
          }
          p.handler('ERROR_FAILED');
        }
      }
    },
  });
  return this;
};

AjaxClass.prototype.handler = function handler(status, errorMsg, errorCode) {
  // 检查是否还需要进行轮询
  let pollFlag = false;
  if (this.options.poll) {
    if (this.options.pollTime === 0) { // 不限制轮询次数
      pollFlag = true;
    } else if (this.options.pollTime > 1) {
      // 减总轮询次数
      this.options.pollTime--;
      pollFlag = true;
    }
  }
  // 轮询结束或仅为单次请求，请求也结束
  if (!pollFlag) {
    this._finished = true;
  }
  // 成功或失败回调
  if (this._succeed) {
    this._succeedCb(status, this);
  } else if (this._failed) {
    const errorType = status;
    this._failedCb({ errorType, errorMsg, errorCode }, this);
  } else {
    throw new Error('ajax callback not ready.');
  }
  // flag为真时轮询一遍
  if (pollFlag) {
    // 新一次请求
    const p = this;
    setTimeout(() => {
      p.init();
    }, this.options.pollTimeout);
  }
};

AjaxClass.prototype.then = function then(succeedCb, failedCb) {
  if (typeof succeedCb === 'function') {
    this._succeedCb = succeedCb;
  }
  if (typeof failedCb === 'function') {
    this._failedCb = failedCb;
  }
  return this;
};

AjaxClass.prototype.abort = function abort() {
  this._aborted = true;
  this._finished = true; // 强制取消，请求结束
  if (this._request) {
    this._request.abort();
  }
};

// 初始化
function AjaxInit(method, apiName, options) {
  return new AjaxClass(method, apiName, options);
}

// 设置全局接口域名
const setDomain = (newDomain) => {
  _domain = newDomain;
};

const onError = (cb) => {
  if (typeof cb === 'function') _onError = cb;
};

const onSuccess = (cb) => {
  if (typeof cb === 'function') _onSuccess = cb;
};

const enableFormat = (flag) => {
  _format = !!flag;
};

export default {
  get: AjaxInit.bind(null, 'GET'),
  post: AjaxInit.bind(null, 'POST'),
  delete: AjaxInit.bind(null, 'DELETE'),
  put: AjaxInit.bind(null, 'PUT'),
  setDomain,
  onError,
  onSuccess,
  enableFormat,
};
