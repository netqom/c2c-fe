import React, { useRef, useEffect } from "react";
// import "./styles.css";
const AutoComplete = ({ handleAutocomplete, errorsInfo, page, address }) => {
    const autoCompleteRef = useRef();
    const inputRef = useRef();
    const options = {
        componentRestrictions: { country: "uk" },
        fields: ["address_components", "geometry", "icon", "name"],
        // types: ["establishment"]
        types: []
    };
    useEffect(() => {
        autoCompleteRef.current = new window.google.maps.places.Autocomplete(
            inputRef.current,
            options
        );
        autoCompleteRef.current.addListener("place_changed", async function () {
            const place = await autoCompleteRef.current.getPlace();
            handleAutocomplete(place);
        });
    }, []);
    const layoutClassName = page == 'register' ? 'form-group' : 'col-md-6';
    return (
        <div className={layoutClassName}>
            <label>Address</label>
            <input className="form-control" type="text" id="address" name="address" defaultValue={address} placeholder="Enter address" onKeyPress={(e) => { e.key === 'Enter' && e.preventDefault(); }} ref={inputRef} />
            <span className='invalid-field'>{typeof errorsInfo != 'undefined' && errorsInfo.hasOwnProperty('address') ? errorsInfo.address : '' }</span>
        </div>
    );
};
export default AutoComplete;