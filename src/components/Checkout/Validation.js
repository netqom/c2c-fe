import STRINGS from '../../common/strings/strings';
import Helper from '../../apis/Helper';

export function validateCheckoutFormData(billingDetail,fieldName) {
    
    const { name, email, address, phone } = billingDetail
    
    let errorMsg = ''; let errors = {}; let formVaildCheck = true;
    
    if (name === '' && (fieldName == 'name' || fieldName == '')) {
        errorMsg = name === '' ? STRINGS.nameReq : '';
        errors.name = errorMsg;
        formVaildCheck = false;
    }

    if (!Helper.validateEmail(email)) {
      errorMsg = email == '' ? STRINGS.emailReq : STRINGS.invalidEmail;
      formVaildCheck = false;
      errors.email = errorMsg;
    }

    if ((fieldName == 'phone' || fieldName == '') && (!phone.match(/^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|\+)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$/))) {
        errorMsg = phone == '' ? STRINGS.phoneReq : STRINGS.phoneInvalid;
        errors.phone = errorMsg;
        formVaildCheck = false;
    }

    if ((fieldName == 'address' || fieldName == '') && address == '') {
        errorMsg = address == '' ? STRINGS.addressReq : '';
        errors.address = errorMsg;
        formVaildCheck = false;
    }

    return { formVaildCheck:formVaildCheck, errors:errors};
}