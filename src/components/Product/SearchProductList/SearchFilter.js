
import React, { useState, useEffect } from 'react'
import { faCheck, faClose, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Accordion from 'react-bootstrap/Accordion';
import { useSelector } from 'react-redux';
import Select from 'react-select'
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import appRoutes from '../../../configs/AppRoutes';
import Helper from '../../../apis/Helper';

export default function SearchFilter(props) {
    const { categories } = useSelector((state) => state.common)
    const [selectedCategoryOption, setSelectedCategoryOption] = useState();
    const [selectedSortedOption, setSelectedSortedOption] = useState({ value: '1', label: 'Newest' });
    const [sortedArray, setSortedArray] = useState([
        { value: '1', label: 'Newest' },
        { value: '2', label: 'Price High to Low' },
        { value: '3', label: 'Price Low to High' },
        { value: '4', label: 'Most viewed' },
    ]);
    const [filerParams, setFilerParams] = useState({ min_price: 0, max_price: 0, name: '', distance_in_miles: 0 });
    const { state } = useLocation();
    const navigate = useNavigate();
    const urlQueryParams = new URLSearchParams(window.location.search);
    let category = urlQueryParams.get('category') != '' ? urlQueryParams.get('category') : 0;
    let name = urlQueryParams.get('name') != '' ? urlQueryParams.get('name') : '';


    useEffect(() => {
        if (category) {
            const filterCat = categories.filter((item) => item.value == category);
            setSelectedCategoryOption(filterCat[0])
        }
        if (state != null) {
            toast.error(state.message)
        }
        setFilerParams({ ...filerParams, name: name })
        appliedFilter();


    }, [props.pageNumberClick]);

    //** autoPopulateCat funtion  */
    const autoPopulateCat = (selCatOp, catLi) => {
        if (selCatOp != undefined && catLi.length) {
            const filterCat = catLi.filter((item) => item.value == selCatOp.value);
            category = filterCat[0].value; //update category
            return filterCat[0]
        }
    }

    /** Filter Applied Here */
    const appliedFilter = (e) => {
       
        const data = { ...filerParams };
        if (data.name == '') {
            data.name = name;
        }
        props.handleSearchFilter(category, data, selectedSortedOption);
    }

    /** Filter Applied Here */
    const clearFilter = async () => {
        navigate('/' + appRoutes.productSearchListRoute)
        window.location.reload(true);
    }

    const changPriceRange = (fieldName, value) => {
        let { min_price, max_price } = filerParams;
        if (fieldName == 'min_price') {
            if (parseFloat(max_price) < parseFloat(value)) {
                max_price = (parseFloat(value) + 1);
            }
            setFilerParams({ ...filerParams, min_price: value, max_price: max_price })
        } else {
            if (parseFloat(min_price) > parseFloat(value)) {
                min_price = (parseFloat(value) - 1);
            }
            setFilerParams({ ...filerParams, max_price: value, min_price: min_price })
        }
    }

    const changeDistance = (distance_in_miles) => {
        setFilerParams({ ...filerParams, distance_in_miles: distance_in_miles })
    }

    // const setUrlQueryParam = (name,value) => {
    //     // Construct URLSearchParams object instance from current URL querystring.
    //     var queryParams = new URLSearchParams(window.location.search);

    //     // Set new or modify existing parameter value. 
    //     queryParams.set(name, value);

    //     // Replace current querystring with the new one.
    //     window.history.replaceState(null, null, "?" + queryParams.toString());
    // }

    const onChangeName = (e) => {
        if (e.key === "Enter"){
            appliedFilter();
        }
        const { name, value } = e.target;
        Helper.setUrlQueryParam(name,value);
        setFilerParams({ ...filerParams, name: e.target.value })
    }

    const onChangeCat = (e) => {
        Helper.setUrlQueryParam('category',e.value);
        setSelectedCategoryOption(e)
    }

    return (
        <div>
            <div className='sidebar-filters'>
                <form>
                    <div className='sidebar-search'>
                        <FontAwesomeIcon icon={faSearch}></FontAwesomeIcon>
                        <input className='form-control' type="text" name="name" onKeyUp={onChangeName} value={filerParams.name} onChange={onChangeName} placeholder='Search here...' />
                    </div>

                    <Accordion defaultActiveKey={['1']} alwaysOpen>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Categories</Accordion.Header>
                            <Accordion.Body>
                                <Select className="" name="category_id" value={autoPopulateCat(selectedCategoryOption, categories)} isSearchable onChange={onChangeCat} options={categories} />
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Sort By</Accordion.Header>
                            <Accordion.Body>
                                <Select className="" value={selectedSortedOption} isSearchable onChange={setSelectedSortedOption} options={sortedArray} />
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="2">
                            <Accordion.Header>Price</Accordion.Header>
                            <Accordion.Body>
                                <div className="price-sec form-group mb-3">
                                    <label>$ Minimum price</label>
                                    <input placeholder='0' type="number" value={filerParams.min_price} onChange={(e) => changPriceRange('min_price', e.target.value)} className='form-control' />
                                </div>
                                <div className="price-sec form-group mb-3">
                                    <label>$ Maximum price</label>
                                    <input placeholder='0' type="number" value={filerParams.max_price} onChange={(e) => changPriceRange('max_price', e.target.value)} className='form-control' />
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="3">
                            <Accordion.Header>Distance</Accordion.Header>
                            <Accordion.Body>
                                <div className="distance-sec form-group mb-3">
                                    <label>In Miles</label>
                                    <input placeholder='0' type="number" min="0" value={filerParams.distance_in_miles} onChange={(e) => changeDistance(e.target.value)} className='form-control' />
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                    <div className='filter-action-bar d-flex justify-content-between align-items-center mt-3'>
                        <span className="search-filters_clear" onClick={clearFilter}><FontAwesomeIcon icon={faClose}></FontAwesomeIcon> Clear all</span>
                        <button className='btn btn-primary btn-sm' onClick={appliedFilter}  type='button'><FontAwesomeIcon icon={faCheck}></FontAwesomeIcon> Apply Filters</button>
                    </div>
                </form>
            </div>
        </div>
    )
}