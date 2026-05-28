const encodeUriComponent = require('encodeUriComponent');
const getType = require('getType');
const JSON = require('JSON');
const makeString = require('makeString');
const sendHttpRequest = require('sendHttpRequest');

/*==============================================================================
==============================================================================*/

const postUrl = data.url + '/rest/v1/' + enc(data.tableName);

let postBody = {};

if (data.dataList) {
  data.dataList.forEach((d) => {
    postBody[d.name] = d.value;
  });
}

sendHttpRequest(
  postUrl,
  (statusCode, headers, body) => {
    if (statusCode >= 200 && statusCode < 400) {
      data.gtmOnSuccess();
    } else {
      data.gtmOnFailure();
    }
  },
  { headers: generateHeaders(), method: 'POST' },
  JSON.stringify(postBody)
);

/*==============================================================================
  Vendor related functions
==============================================================================*/

function generateHeaders() {
  const headers = {
    'Content-Type': 'application/json',
    apikey: data.apiKey,
    Authorization: 'Bearer ' + data.apiKey
  };

  if (data.mode === 'upsert') {
    headers['Prefer'] = 'resolution=merge-duplicates';
  }

  return headers;
}

/*==============================================================================
  Helpers
==============================================================================*/

function enc(data) {
  if (['null', 'undefined'].indexOf(getType(data)) !== -1) data = '';
  return encodeUriComponent(makeString(data));
}
