const axios = require('axios');

class BambuLabAPI {
    static async login(username, password) {
        try {
            const response = await axios.post('https://bambulab.com/api/sign-in/form', {
                account: username, password: password, apiError: ''
            });

            const setCookie = response.headers['set-cookie'];
            if (setCookie) {
                const cookies = setCookie.map(cookie => cookie.split(';')[0]);
                const token = cookies.find(cookie => cookie.includes('token=')).replace('token=', '');
                return { success: true, message: 'Login successful!', data: token };
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                return { success: false, message: `Login failed. ${error.response.data.error}`, data: {} };
            }
            return { success: false, message: `Login failed. ${error.message}`, data: {} };
        }
    }

    static async getDeviceVersion(serial, token) {
        try {
            const response = await axios.get(`https://bambulab.com/api/v1/iot-service/api/user/device/version?dev_id=${serial}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return { success: true, message: '', data: response.data.devices[0] };
        } catch (error) {
            return { success: false, message: `${error.message}`, data: {} };
        }
    }
}

module.exports = BambuLabAPI;
