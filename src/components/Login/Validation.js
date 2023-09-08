import STRINGS from '../../common/strings/strings';
import Helper from '../../apis/Helper';

export function validateLoginFormData(userDetail,fieldName) {
    const { email, password } = userDetail;
    let errorMsg = ''; let errors = {}; let formVaildCheck = true;
    if ((fieldName == 'email' || fieldName == '') && (!Helper.validateEmail(email))) {
      errorMsg = email == '' ? STRINGS.emailReq : STRINGS.invalidEmail;
      formVaildCheck = false;
      errors.email = errorMsg;
    }
    if ((fieldName == 'password' || fieldName == '') && (!Helper.validatePassword(password))) {
      errorMsg = password == '' ? STRINGS.passwordReq : STRINGS.invalidPassword;
      errors.password = errorMsg;
      formVaildCheck = false;
    }
    return { formVaildCheck:formVaildCheck, errors:errors};
}