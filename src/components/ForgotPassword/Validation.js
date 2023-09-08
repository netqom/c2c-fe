import STRINGS from '../../common/strings/strings';
import Helper from '../../apis/Helper';

export function validateForgotPasswordFormData(userDetail) {
    const { email } = userDetail;
    let errorMsg = ''; let errors = {}; let formVaildCheck = true;
    if (!Helper.validateEmail(email)) {
      errorMsg = email == '' ? STRINGS.emailReq : STRINGS.invalidEmail;
      formVaildCheck = false;
      errors.email = errorMsg;
    }
    return { formVaildCheck:formVaildCheck, errors:errors};
}