import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { sendRequest } from '../../apis/APIs'
import AppConfig from '../../configs/AppConfig';
import { useNavigate } from 'react-router-dom';
import { faEye, faFileInvoice, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { callCommonAction } from '../../redux/Common/CommonReducer';
import ReviewRatingModal from './ReviewRatingModal';
import Pagination from '../Pagination/pagination';
import appRoutes from '../../configs/AppRoutes';
import { ContentLoading } from '../Common/ContentLoading';
import { CheckUnAuthorized } from '../Common/CheckUnAuthorized';
import './Order.css'
import { Helmet } from 'react-helmet';
import Select from 'react-select';
import { toast } from 'react-toastify';

export default function MyOrderList() {
    const [myOrderArray, setMyOrderArray] = useState([]);
    const [paginationData, setPaginationData] = useState({ perpage: AppConfig.recordsPerPageTable, page: 1, totalCount: 0 });
    const [filter, setFilter] = useState({ search_string: '', status:'' })
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const ReviewRatingModalRef = useRef();
    const [selectedStatusOption, setSelectedStatusOption] = useState({value: '', label: 'All Status'});
    const [statusOption,setStatusOption] = useState([
        {value: '', label: 'All Status' },
        {value: 'COMPLETED', label: 'Completed' },
        {value: 'REFUNDED', label: 'Refunded' },
    ])

    useEffect(() => { callMyOrderApi() }, [paginationData.page,selectedStatusOption]);

    const callMyOrderApi = async () => {
        try {
            dispatch(callCommonAction({ loading: true }));
            let body = { pagination: paginationData };
            body.query = { search_string: filter.search_string,status : selectedStatusOption.value };
            const res = await sendRequest(`/my-orders`, 'POST', body);        
            setMyOrderArray(res.data.data);
            setPaginationData({ ...paginationData, totalCount: res.data.meta.total })
            dispatch(callCommonAction({ loading: false }));
        } catch (error) {
            CheckUnAuthorized({ error: error, dispatch: dispatch, navigate: navigate, callCommonAction: callCommonAction })
        }
    }


    const prepareHtmlTable = () => {
        return myOrderArray.map((item, index) => {
            const ratingsPercentage = item.review_rating != null ? (((parseFloat(item.review_rating.rating)) / (5)) * (100)) : '0';
            const ratingsValue = item.review_rating != null ? parseFloat(item.review_rating.rating).toFixed(2) : '0.0';
            return (
                <tr v-for="item in tableItems" key={index}>
                    <td>{item.uuid}</td>
                    <td className='image-fill'><img src={item.product.display_thumb_path} width="25px" height="25px" /></td>
                    <td><a href={undefined} onClick={() => navigate(appRoutes.sellerProfileRoute+'/'+item.product.created_by)}>{item.user_name}</a></td>
                    <td><div className='text-truncate' style={{maxWidth: "500px"}}>{item.product.title}</div></td>
                    <td><strong>£</strong>{parseFloat(item.amount).toFixed(2)}</td>
                    {/* <td>
                        <div className="star-ratings" style={{ width: '84px' }}>
                            <div className="fill-ratings" title={parseFloat(ratingsValue) + '/5'} style={{ width: ratingsPercentage + '%' }}>
                                <span className='neon-clr' style={{ width: '84px' }}>★★★★★</span>
                            </div>
                            <div className="empty-ratings">
                                <span>★★★★★</span>
                            </div>
                        </div>
                    </td> */}
                    <td>{item.payment_status_name}</td>
                    <td>
                        <ul className="list-unstyled d-flex action-icons m-0">
                            {/* <li><button className="btn btn-sm p-1" type="button" onClick={() => navigate('/' + appRoutes.productDetailRoute + '/' + item.product.slug)} title="View Product"><FontAwesomeIcon icon={faEye} /></button></li> */}
                            <li><button className="btn btn-sm p-1" type="button" onClick={() => item.review_rating && item.product.deleted_at ? toast.error("This product does not exist anymore.")  : ReviewRatingModalRef.current.handleShow(item.id, item.product.id, item.product.created_by)}><FontAwesomeIcon icon={faStar} className='neon-clr' title="Add Review Rating" /></button></li>
                            <li><button className="btn btn-sm p-1" type="button" onClick={() => navigate(appRoutes.authPrfixRoute + '/' + appRoutes.soldProductInvoiceRoute + '/' + item.uuid)}><FontAwesomeIcon icon={faFileInvoice} title="Review Invoice" /></button></li>
                        </ul>
                    </td>
                </tr>
            )
        })
    }

    const reloadOrderList = () => callMyOrderApi();

    const searchHandler = async (e) => {
		e.preventDefault();
		setFilter({ ...filter, search_string: e.target.value })
		if (e.key === 'Enter') {
			await callMyOrderApi();
		}
	}

    return (
        <div className="content-wrapper">
            <Helmet>
                <title>Alium | My Orders Page</title>
                <meta name="description" content="My Orders Page Description Goes Here" />
                <meta name="keywords" content="Game, Entertainment, Movies" />
            </Helmet>
            <div className="container">
                <div className="d-flex justify-content-between align-items-center breadcrum-container mb-3">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <a href={undefined} onClick={() => navigate(appRoutes.authPrfixRoute + '/' + appRoutes.dashboardRoute)}>Dashboard</a>
                        </li>
                        <li className="breadcrumb-item active">My Orders List</li>
                    </ol>
                </div>
                <div className="card card-custom shadow mb-3">
                    <div className="card-header">
                        <div className="card-title">
                            <i className="fa fa-table"></i> My Order List
                        </div>
                        <div className="card-toolbar">
                            <div className="d-flex align-items-center flex-wrap mb-0">
                                <div className="dash-search">
                                    <div className="form-inline my-2 my-lg-0 mr-lg-2 d-flex">
                                        <div className="input-group me-2">
                                            <Select className="" name="status" value={selectedStatusOption} onChange={setSelectedStatusOption} options={statusOption} />
                                        </div>
                                        <div className="input-group">
                                            <input className="form-control border-end-0 border rounded-pill" onKeyUp={searchHandler}  onChange={(e) => searchHandler(e)} value={filter.search_string} type="text" placeholder="Search for ID &amount etc..." />
                                            <span className="input-group-append">
                                                <button className="btn border-0 rounded-pill ms-n5" type="button" onClick={() => callMyOrderApi()}><i className="fa fa-search"></i></button>
                                            </span>
                                        </div>
                                    </div>
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
                                        <th>Seller</th>
                                        <th>Title</th>
                                        <th>Amount</th>
                                        {/* <th>Rating</th> */}
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myOrderArray.length > 0 ? <>{prepareHtmlTable()}</> : <><tr className="text-center"><td colSpan="8">No data available</td></tr></>}
                                </tbody>
                            </table>
                            <div className=''>
                                <Pagination className="pagination-bar" currentPage={paginationData.page} totalCount={paginationData.totalCount}
                                    pageSize={paginationData.perpage} onPageChange={page => setPaginationData({ ...paginationData, page: page })}
                                />
                            </div>
                        </div>
                        {/* Pop up for Review and Rating of Order Product */}
                        <ReviewRatingModal ref={ReviewRatingModalRef} reloadOrderList={reloadOrderList} />
                    </div>
                </div>
            </div>
        </div>
    )
}
