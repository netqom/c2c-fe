import React, { useState } from 'react';
 
const SearialNumber = (page,recordPerPage,indexVal) => {
    console.log(typeof indexVal)
    let cara = 2;
    const returnVal = (page == 1 ? (cara) : ( ( page) * (recordPerPage)) + (cara) )
    console.log(page,recordPerPage,cara,returnVal);
    return returnVal;
}
export default SearialNumber;