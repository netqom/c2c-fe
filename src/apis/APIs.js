import { AppSettings } from '../configs'
import Utils from '../common/util/Utils';
import axios from 'axios';
import { store } from '../app/store';

const RESOURCE_URL = AppSettings.base_url;

export const sendRequest = async (endpoint, method, body) => {
    const usertoken = store.getState().common.token;
    const authHeader = { 'Authorization': 'Bearer ' + usertoken, 'Accept': 'application/json' };
    const REQUEST_URL = RESOURCE_URL + endpoint;
    //console.log('sendRequest usertoken', usertoken, 'body', body, 'REQUEST_URL', REQUEST_URL)
    const requestOptions = method === 'POST' ? { method: 'POST', url: REQUEST_URL, data: body, headers: authHeader } : { method: 'GET', url: REQUEST_URL, params: body, headers: authHeader };
    return await axios(requestOptions).then(Utils.verifyResponse);
}


