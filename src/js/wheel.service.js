import { HttpRequest } from './http-requester.js'

const API_ROOT_URL = 'http://localhost:3001';
const API_GET_WHEEL_DATA_URL = '/';
const API_GET_TARGET_SECTOR_DATA_URL = '/game';

const UNAUTHORIZED_GET_REQUESTS_OPTIONS = {
    headers: { 'Content-Type': 'application/json' },
    params: {},
    observe: 'body',
    reportProgress: false, 
    responseType: 'json',
    withCredentials: false
}

export function getUIRenderData() {
    const url = API_ROOT_URL + API_GET_WHEEL_DATA_URL;
    return HttpRequest.get(url, UNAUTHORIZED_GET_REQUESTS_OPTIONS);
}

export function getGameTargetSectorData() {
    const url = API_ROOT_URL + API_GET_TARGET_SECTOR_DATA_URL;
    return HttpRequest.get(url, UNAUTHORIZED_GET_REQUESTS_OPTIONS);
}