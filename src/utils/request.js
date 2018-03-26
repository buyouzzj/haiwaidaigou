import ajax from './ajax';

function wrapper(method, url, options, getInst) {
  if (options) options.timeout = 20000;
  else options = { timeout: 20000 };

  // 重置超时时间
  localStorage.setItem('HAIERP_LAST_LOGIN', new Date().getTime());

  return new Promise((resolve, reject) => {
    const request = ajax[method.toLowerCase()](url, options).then((res, pointer) => {
      const loc = request._request.getResponseHeader('Location');
      if (loc) {
        location.href = '#/login';
        return;
      }
      if (request._request.status.toString() === '302' || request._request.responseText.match('<!')) {
        location.href = '#/login';
        return;
      }
      resolve(res, pointer);
    }, (err, pointer) => {
      reject(err, pointer);
    });
    if (typeof getInst === 'function') {
      getInst(request);
    }
  });
}

export default {
  get: wrapper.bind(null, 'GET'),
  post: wrapper.bind(null, 'POST'),
  delete: wrapper.bind(null, 'DELETE'),
  put: wrapper.bind(null, 'PUT'),
  setDomain: ajax.setDomain,
  onError: ajax.onError,
  onSuccess: ajax.onSuccess,
  enableFormat: ajax.enableFormat,
};
