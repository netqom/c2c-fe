import STRINGS from '../../common/strings/strings';
import Helper from '../../apis/Helper';

export function validateResetPasswordFormData(userDetail, fieldName) {
    const { password, password_confirmation } = userDetail;
    let errorMsg = ''; let errors = {}; let formVaildCheck = true;
    
    if ((fieldName == 'password' || fieldName == '') && (!Helper.validatePassword(password))) {
        errorMsg = password == '' ? STRINGS.passwordReq : STRINGS.invalidPassword;
        errors.password = errorMsg;
        formVaildCheck = false;
    }
    if (!Helper.validatePassword(password_confirmation)) {
        errorMsg = password_confirmation == '' ? STRINGS.confirmPasswordReq : STRINGS.invalidConfirmPassword;
        errors.password_confirmation = errorMsg;
        formVaildCheck = false;
    }
    if ((fieldName == 'password_confirmation' || fieldName == '') && !Helper.validatePassword(password_confirmation)) {
        if (password_confirmation !== password) {
            errors.password_confirmation = STRINGS.passwordMissMatch;
            formVaildCheck = false;
        }
    }
    if (password_confirmation !== '' && password !== '' && (fieldName == 'password_confirmation' || fieldName == '')) {
        if (password_confirmation !== password) {
            errors.password_confirmation = STRINGS.passwordMissMatch;
            formVaildCheck = false;
        }
    }
    return { formVaildCheck:formVaildCheck, errors:errors};
}