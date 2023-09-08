import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { sendRequest } from '../../../apis/APIs';
import AppConfig from '../../../configs/AppConfig';
import { useNavigate, } from 'react-router-dom';
import { faEye, faFileInvoice } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { callCommonAction } from '../../../redux/Common/CommonReducer';
import Pagination from '../../Pagination/pagination';
import appRoutes from '../../../configs/AppRoutes';
import { ContentLoading } from '../../Common/ContentLoading';
import { CheckUnAuthorized } from '../../Common/CheckUnAuthorized';
import { Helmet } from 'react-helmet';
import Alerts from '../../../common/Alerts/Alerts';
import { toast } from 'react-toastify';
import Select from 'react-select';

export default function SoldProductList() {
    const [soldProductArray, setSoldProductArray] = useState([]);
    const [paginationData, setPaginationData] = useState({ perpage: AppConfig.recordsPerPageTable, page: 1, totalCount: 0 });
    const [filter, setFilter] = useState({ search_string: '' })
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, alert } = useSelector((state) => state.common)
    const [unclaimedAmount, setUnclaimedAmount] = useState(0);
    const [isPaypalEmailVerified, setIsPaypalEmailVerified] = useState(0);
    const [selectedStatusOption, setSelectedStatusOption] = useState({value: '', label: 'All Status'});
    const [statusOption,setStatusOption] = useState([
        {value: '', label: 'All Status' },
        {value: 'COMPLETED', label: 'Completed' },
        {value: 'REFUNDED', label: 'Refunded' },
    ])

    useEffect(() => { callSoldProductApi() }, [paginationData.page, selectedStatusOption]);

    const callSoldProductApi = async () => {
        try {
            dispatch(callCommonAction({ loading: true }));
            let body = { pagination: paginationData };
            // if (filter.search_string != '') 
            body.query = { search_string: filter.search_string, status:selectedStatusOption.value};
            const res = await sendRequest(`/sold-product-list`, 'POST', body);
            setSoldProductArray(res.data.data);
            setPaginationData({ ...paginationData, totalCount: res.data.meta.total })
            dispatch(callCommonAction({ loading: false }));
        } catch (error) {
            CheckUnAuthorized({ error: error, dispatch: dispatch, navigate: navigate, callCommonAction: callCommonAction })
        }

    }

    const prepareHtmlTable = () => {
        console.log('soldProductArray',soldProductArray)
        return soldProductArray.map((item) => {
            return (
                <tr v-for="item in tableItems" key={item.id}>
                    <td>{item.uuid}</td>
                    <td className='image-fill'><img src={item.product.display_thumb_path} width="25px" height="25px" /></td>
                    <td><a href={undefined} onClick={() => navigate(appRoutes.sellerProfileRoute+'/'+item.created_by)}>{item.user_name}</a></td>
                    <td><div className='text-truncate' style={{maxWidth: "500px"}}>{item.product.title}</div></td>
                    <td><strong>£</strong>{parseFloat(item.amount).toFixed(2)}</td>
                    <td>{item.payment_status_name}</td>
                    <td>{item.order_payouts.id != undefined ? item.order_payouts.transaction_status : 'None'}</td>
                    <td>
                        <ul className="list-unstyled d-flex action-icons m-0">
                            <li><button className="btn btn-sm p-1" type="button" onClick={() => navigate('/' + appRoutes.productDetailRoute + '/' + item.product.slug)}><FontAwesomeIcon icon={faEye} /></button></li>
                            <li><button className="btn btn-sm p-1" type="button" onClick={() => navigate(appRoutes.authPrfixRoute + '/' + appRoutes.soldProductInvoiceRoute + '/' + item.uuid)}><FontAwesomeIcon icon={faFileInvoice} title="Review Invoice" /></button></li>
                        </ul>
                    </td>
                </tr>
            )
        })
    }

    /** This will active while you are need a paypal gateway */
    // useEffect(() => { getUnclaimedAmountTotal()  }, []);

    const getUnclaimedAmountTotal = async () => {
        let unclaimedAmountRes = await sendRequest(`/get-unclaimed-amount`, 'POST');
        setUnclaimedAmount(unclaimedAmountRes.data.amount);
        setIsPaypalEmailVerified(unclaimedAmountRes.data.isPaypalEmailVerified);
    }
    const confirmBefore = () => {
        getUnclaimedAmountTotal();
        if (isPaypalEmailVerified === 0) {
            const custom = Alerts.verifyPaypalEmail(erase);
            dispatch(callCommonAction({ alert: custom }));
        } else {
            claimAmount();
        }
    }
    const claimAmount = async () => {
        dispatch(callCommonAction({ loading: true }));
        let unclaimedAmountRes = await sendRequest(`/claim-amount`, 'POST');
        if (unclaimedAmountRes.data.status === true) {
            setUnclaimedAmount(unclaimedAmountRes.data.amount);
            setIsPaypalEmailVerified(unclaimedAmountRes.data.isPaypalEmailVerified);
            dispatch(callCommonAction({ loading: false }));
            toast.success('Success')
            callSoldProductApi();
        } else {
            toast.error('Entered email is incorrect. Please enter the correct email and request for the payment.')
        }
    }

    const erase = async () => {
        dispatch(callCommonAction({ alert: null }));
    }
    return (
        <div className="content-wrapper sold-product">
            <Helmet>
                <title>Alium | Sold Product List Page</title>
                <meta name="description" content="Sold Product List Page Description Goes Here" />
                <meta name="keywords" content="Game, Entertainment, Movies" />
            </Helmet>
            <div className="container">
                <div className="d-flex justify-content-between align-items-center breadcrum-container mb-3">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <a href={undefined} onClick={() => navigate(appRoutes.authPrfixRoute + '/' + appRoutes.dashboardRoute)}>Dashboard</a>
                        </li>
                        <li className="breadcrumb-item active"> Sold Product List </li>
                    </ol>
                </div>
                {alert}
                <div className="card card-custom shadow mb-3">
                    <div className="card-header">
                        <div className="card-title">
                            <i className="fa fa-table"></i> Sold Product List
                        </div>
                        <div className="card-toolbar">
                            <div className="d-flex align-items-center flex-wrap mb-0">
                                {/** This will active while you are need a paypal gateway */}
                                {/* {
                                    unclaimedAmount > 0
                                        ?
                                        <a href="javascript:;" role="button" class="gold-btn nav-link" tabindex="0" onClick={() => confirmBefore()} >
                                            <img src="/assets/images/lock.png" alt="Get Your Unclaimed Payouts" title="Get Your Unclaimed Payouts" /> Get Your Unclaimed Payouts
                                        </a>
                                        : ''
                                } */}
                                <div className="dash-search">
                                    <form className="form-inline my-2 my-lg-0 mr-lg-2 d-flex">
                                        {/* Search based on status by selecting from dropdown */}
                                        <div className="input-group me-2">
                                            <Select className="" name="status" value={selectedStatusOption} onChange={setSelectedStatusOption} options={statusOption} />
                                        </div>
                                        <div className="input-group">
                                            <input className="form-control border-end-0 border rounded-pill" onChange={(e) => setFilter({ ...filter, search_string: e.target.value })} value={filter.search_string} type="text" placeholder="Search for..." />
                                            <span className="input-group-append">
                                                <button className="btn border-0 rounded-pill ms-n5" type="button" onClick={() => callSoldProductApi()}><i className="fa fa-search"></i></button>
                                            </span>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card-body spinner-relative">
                        <ContentLoading />
                        <div className="table-responsive">
                            <table className="table table-bordered" width="100%" cellSpacing="0">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Image</th>
                                        <th>Buyer</th>
                                        <th>Title</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Payout Received</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {soldProductArray.length > 0 ? <>{prepareHtmlTable()}</> : <><tr className="text-center"><td colSpan="8">No data available</td></tr></>}
                                </tbody>
                            </table>
                            <div className='gurjet'>
                                <Pagination className="pagination-bar" currentPage={paginationData.page} totalCount={paginationData.totalCount}
                                    pageSize={paginationData.perpage} onPageChange={page => setPaginationData({ ...paginationData, page: page })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
