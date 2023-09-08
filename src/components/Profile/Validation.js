import STRINGS from '../../common/strings/strings'
import Helper from '../../apis/Helper';

export function validateChangePasswordFormData(changePasswordDetail,fieldName) {
    const { old_password, new_password, new_password_confirmation } = changePasswordDetail;
    let errorMsg = ''; let errors = {}; let formVaildCheck = true;
    if ((fieldName == 'old_password' || fieldName == '') && (!Helper.validatePassword(old_password))) {
        errorMsg = old_password == '' ? STRINGS.passwordReq : STRINGS.invalidPassword;
        errors.old_password = errorMsg;
        formVaildCheck = false;
    }
    if ((fieldName == 'new_password' || fieldName == '') && (!Helper.validatePassword(new_password))) {
        errorMsg = new_password == '' ? STRINGS.passwordReq : STRINGS.invalidPassword;
        errors.new_password = errorMsg;
        formVaildCheck = false;
    }
    if ((fieldName == 'new_password_confirmation' || fieldName == '') && !Helper.validatePassword(new_password_confirmation)) {
        errorMsg = new_password_confirmation == '' ? STRINGS.confirmPasswordReq : STRINGS.invalidConfirmPassword;
        errors.new_password_confirmation = errorMsg;
        formVaildCheck = false;
    }
    if (new_password_confirmation !== '' && new_password !== '' && (fieldName == 'new_password_confirmation' || fieldName == '')) {
        if (new_password_confirmation !== new_password) {
            errors.new_password_confirmation = STRINGS.passwordMissMatch;
            formVaildCheck = false;
        }
    }
    return { formVaildCheck:formVaildCheck, errors:errors};
}


export function validateProfileBasicInfoFormData(userDetail,fieldName) {
    const { name, email, address, state_id, phone, account_number } = userDetail;
    let errorMsg = ''; let errors = {}; let formVaildCheck = true;
    if ((fieldName == 'name' || fieldName == '') && name == '') {
        errorMsg = name === '' ? STRINGS.nameReq : '';
        errors.name = errorMsg;
        formVaildCheck = false;
    }
    if ((fieldName == 'address' || fieldName == '') && address == null) {
        errorMsg = address == null ? STRINGS.addressReq : '';
        errors.address = errorMsg;
        formVaildCheck = false;
    }
    if ((fieldName == 'phone' || fieldName == '') && (!phone.match(/^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|\+)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$/))){
        errorMsg = STRINGS.phoneInvalid;
        errors.phone = errorMsg;
        formVaildCheck = false;
    }


    if ((fieldName == 'email' || fieldName == '') && (!Helper.validateEmail(email))) {
        errorMsg = email == '' ? STRINGS.emailReq : STRINGS.invalidEmail;
        formVaildCheck = false;
        errors.email = errorMsg;
    }

    if ((fieldName == 'paypal_email' || fieldName == '') && (!Helper.validateEmail(email))) {
        errorMsg = email == '' ? STRINGS.emailReq : STRINGS.invalidEmail;
        formVaildCheck = false;
        errors.paypal_email = errorMsg;
    }


    // if ( ( fieldName == 'account_number' || fieldName == '' ) && account_number == '' ) {
    //     errorMsg = account_number == '' ? 'Please enter acccount number' : '';
    //     formVaildCheck = false;
    //     errors.account_number = errorMsg;
    // }

    return { formVaildCheck:formVaildCheck, errors:errors};
}