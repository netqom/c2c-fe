import STRINGS from '../../common/strings/strings';
import Helper from '../../apis/Helper';

export function validateRegisterFormData(userDetail,fieldName) {
    const { terms, privacy, name, email, phone, state_id, password, password_confirmation,address } = userDetail;
    let errorMsg = ''; let errors = {}; let formVaildCheck = true;
    if (name === '' && (fieldName == 'name' || fieldName == '')) {
        errorMsg = name === '' ? STRINGS.nameReq : '';
        errors.name = errorMsg;
        formVaildCheck = false;
    }
    if (address == '' && (fieldName == 'address' || fieldName == '')) {
        errorMsg = address == '' ? STRINGS.addressReq : '';
        errors.address = errorMsg;
        formVaildCheck = false;
    }
    if ((fieldName == 'email' || fieldName == '') && (!Helper.validateEmail(email))) {
        errorMsg = email == '' ? STRINGS.emailReq : STRINGS.invalidEmail;
        formVaildCheck = false;
        errors.email = errorMsg;
    }
    if ((fieldName == 'phone' || fieldName == '') && (!phone.match(/^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|\+)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$/))) {
        errorMsg = phone == '' ? STRINGS.phoneReq : STRINGS.phoneInvalid;
        errors.phone = errorMsg;
        formVaildCheck = false;
    }
    if ((fieldName == 'terms' || fieldName == '') && (!terms)) {
        errors.terms = STRINGS.termsReq;
        formVaildCheck = false;
    }
    if ((fieldName == 'privacy' || fieldName == '') && (!privacy)) {
        errors.privacy = STRINGS.privacyReq;
        formVaildCheck = false;
    }
    // if ((fieldName == 'state_id' || fieldName == '') && state_id == '') {
    //     errorMsg = state_id == '' ? STRINGS.stateReq : STRINGS.invalidState;
    //     errors.state_id = errorMsg;
    //     formVaildCheck = false;
    // }
    if ((fieldName == 'password' || fieldName == '') && (!Helper.validatePassword(password))) {
        errorMsg = password == '' ? STRINGS.passwordReq : STRINGS.invalidPassword;
        errors.password = errorMsg;
        formVaildCheck = false;
    }
    if ((fieldName == 'password_confirmation' || fieldName == '') && !Helper.validatePassword(password_confirmation)) {
        errorMsg = password_confirmation == '' ? STRINGS.confirmPasswordReq : STRINGS.invalidConfirmPassword;
        errors.password_confirmation = errorMsg;
        formVaildCheck = false;
    }
    if (password_confirmation !== '' && password !== '' && (fieldName == 'password_confirmation' || fieldName == '')) {
        if (password_confirmation !== password) {
            errors.password_confirmation = STRINGS.passwordMissMatch;
            formVaildCheck = false;
        }
    }
    return { formVaildCheck:formVaildCheck, errors:errors};
}