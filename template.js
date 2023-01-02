const JSON = require('JSON');
const getRequestHeader = require('getRequestHeader');
const logToConsole = require('logToConsole');
const getContainerVersion = require('getContainerVersion');
const sendHttpRequest = require('sendHttpRequest');

const isLoggingEnabled = determinateIsLoggingEnabled();
const traceId = getRequestHeader('trace-id');

const postUrl = data.url + '/rest/v1/' + data.tableName;

let postBody = {};
data.dataList.forEach(d => {postBody[d.name] = d.value;});


if (isLoggingEnabled) {
    logToConsole(JSON.stringify({
        'Name': 'SupabaseWriter',
        'Type': 'Request',
        'TraceId': traceId,
        'EventName': data.mode,
        'RequestMethod': 'POST',
        'RequestUrl': postUrl,
        'RequestBody': postBody,
    }));
}

sendHttpRequest(postUrl, (statusCode, headers, body) => {
    if (isLoggingEnabled) {
        logToConsole(JSON.stringify({
            'Name': 'SupabaseWriter',
            'Type': 'Response',
            'TraceId': traceId,
            'EventName': data.mode,
            'ResponseStatusCode': statusCode,
            'ResponseHeaders': headers,
            'ResponseBody': body,
        }));
    }

    if (statusCode >= 200 && statusCode < 400) {
        data.gtmOnSuccess();
    } else {
        data.gtmOnFailure();
    }
}, {headers: generateHeaders(), method: 'POST'}, JSON.stringify(postBody));

function generateHeaders() {
    let headers = {
        'Content-Type': 'application/json',
        'apikey': data.apiKey,
        'Authorization': 'Bearer ' + data.apiKey,
    };

    if (data.mode === 'upsert') {
        headers['Prefer'] = 'resolution=merge-duplicates';
    }

    return headers;
}

function determinateIsLoggingEnabled() {
    const containerVersion = getContainerVersion();
    const isDebug = !!(
        containerVersion &&
        (containerVersion.debugMode || containerVersion.previewMode)
    );

    if (!data.logType) {
        return isDebug;
    }

    if (data.logType === 'no') {
        return false;
    }

    if (data.logType === 'debug') {
        return isDebug;
    }

    return data.logType === 'always';
}
