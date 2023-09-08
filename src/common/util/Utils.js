import { toast } from 'react-toastify';
export default class Utils {
    static verifyResponse = response => {
        return new Promise((resolve, reject) => response && (response.statusText == "OK") ? resolve(this.resolveRes(response)) : reject(response))
    }

    static resolveRes = data => {
		if(data.data.message != '' ){
            data.data.status ? toast.success(data.data.message) :  toast.error(data.data.message)
        }
        return data
    }

    static log = (prefix, ...args) => {
        console.log(prefix, args);
    }
}