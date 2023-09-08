import axios from 'axios';
import appSettings from '../configs/AppConfig';
export default class Helper {

    /** Validate email address */
    static validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    /** Validate mobile */
    static validateMobile(number) {
        // var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        //return (number && number.length >= 10 && number.length <= 12);
        return (number && number.length >= 10 && number.length <= 12);
    }

    /** Validate password */
    static validatePassword = (password) => {
        return (password && password.length >= 6) ? true : false;
    }

    static isNumberKey(evt) {
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
        return (evt && evt.length >= 0) ? true : false;;
    }

    static generatePaypalAccessToken = async () => {
        const response = await axios.post(`${appSettings.paypalSandBoxUrl}/v1/oauth2/token`,
            ({
                grant_type: 'client_credentials',
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                auth: {
                    username: appSettings.paypalClientId,
                    password: appSettings.paypalSecret,
                },
            },
        );
        // make Paypal API calls with your access token here!!
        return response.data.access_token;
    }

    static setUrlQueryParam = (name,value) => {
        // Construct URLSearchParams object instance from current URL querystring.
        var queryParams = new URLSearchParams(window.location.search);

        // Set new or modify existing parameter value. 
        queryParams.set(name, value);

        // Replace current querystring with the new one.
        window.history.replaceState(null, null, "?" + queryParams.toString());
    }

}