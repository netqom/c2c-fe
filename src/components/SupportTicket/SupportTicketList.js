import React, {useEffect,useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendRequest } from '../../apis/APIs'
import AppConfig from '../../configs/AppConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import { faEye, faPlus, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { callCommonAction } from '../../redux/Common/CommonReducer';
import Pagination from '../Pagination/pagination';
import appRoutes from '../../configs/AppRoutes';
import { ContentLoading } from '../Common/ContentLoading';
import { CheckUnAuthorized } from '../Common/CheckUnAuthorized';
import { Helmet } from 'react-helmet';
import Alerts from '../../common/Alerts/Alerts';
import Helper from '../../apis/Helper';

const SupportTicketList = () => {
    const location = useLocation();
    const [ticketList, setTicketList] = useState([]);
    const [paginationData, setPaginationData] = useState({ perpage: AppConfig.recordsPerPageTable, page: 1, totalCount: 0 });
    
    const locSearch  = new URLSearchParams(location.search);
    const searchString =  locSearch.get('search_string');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { alert } = useSelector((state) => state.common);
    const [filter, setFilter] = useState({ search_string: searchString});

    useEffect(() => {
        getListOfTickets(searchString) 
    }, [paginationData.page]);

    const getListOfTickets = async (searchString) => {
        try {
            dispatch(callCommonAction({ loading: true }));
            let body = { pagination: paginationData };
            if (filter.search_string != '' || searchString) {
                if(searchString){
                    body.query = { search_string: searchString };
                }else{
                    body.query = { search_string: filter.search_string }; 
                }
            }
            const res = await sendRequest(`/list-of-tickets`, 'POST', body);        
            setTicketList(res.data.data);
            setPaginationData({ ...paginationData, totalCount: res.data.meta.total })
            dispatch(callCommonAction({ loading: false }));
        } catch (error) {
            CheckUnAuthorized({ error: error, dispatch: dispatch, navigate: navigate, callCommonAction: callCommonAction })
        }
    }

    const handleSearch = (e) => {
        setFilter({ ...filter, search_string: e.target.value});
        Helper.setUrlQueryParam('search_string',e.target.value)
    }

    const prepareHtmlTable = () => {
        return ticketList.map((item, index) => {
            return (
                <tr v-for="item in tableItems" key={index}>
                    <td>{item.unique_ticket}</td>
                    <td>{item.subject}</td>
                    <td><div className='text-truncate' style={{maxWidth: "600px"}}>{item.description}</div></td>
                    <td>{item.status}</td>
                    <td>
                        <ul className="list-unstyled d-flex action-icons m-0">
                            <li><button className="btn btn-sm p-1" type="button" onClick={() => navigate(appRoutes.authPrfixRoute + '/' + appRoutes.ticketDetailPageRoute + '/' + item.unique_ticket) } title="View Product"><FontAwesomeIcon icon={faEye} /></button></li>
                            <li><button className="btn btn-sm" type="button" onClick={() => confirmBeforeDelete(item.id)}><FontAwesomeIcon icon={faTrashCan} className='text-danger' /></button></li>
                        </ul>
                    </td>
                </tr>
            )
        })
    }

    const confirmBeforeDelete = (selected_id) => {
		//console.log('selected_id', selected_id);
		const custom = Alerts.confirmDelete(selected_id, deleteSelectedItem);
		dispatch(callCommonAction({ alert: custom }));
	}

    //after confirmation delete data
	const deleteSelectedItem = async (selected_id) => {
		dispatch(callCommonAction({ alert: null }));
		if (selected_id > 0) {
			dispatch(callCommonAction({ loading: true }));
			let body = { item_id: selected_id };
			await sendRequest(`/delete-ticket`, 'POST', body)
				.then((res) => {
					dispatch(callCommonAction({ loading: false }));
					getListOfTickets(searchString);
				}).catch((error) => {
					CheckUnAuthorized({ error: error, dispatch: dispatch, navigate: navigate, callCommonAction: callCommonAction })
				});
		}
	};

    return (
        <div className="content-wrapper">
            <Helmet>
                <title>Alium | Support Ticket List</title>
                <meta name="description" content="Support ticket list" />
                <meta name="keywords" content="Game, Entertainment, Movies" />
            </Helmet>

            <div className="container">
                <div className="d-flex justify-content-between align-items-center breadcrum-container mb-3">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <a href={undefined} onClick={() => navigate(appRoutes.authPrfixRoute + '/' + appRoutes.dashboardRoute)}>Dashboard</a>
                        </li>
                        <li className="breadcrumb-item active">My Ticket List</li>
                    </ol>
                    <div className="">
						<button type="button" className="btn btn-success btn-sm rounded-pill" onClick={() => navigate(appRoutes.authPrfixRoute + '/' + appRoutes.addEditSupportTicket)}><FontAwesomeIcon icon={faPlus} /> Add New</button>
					</div>
                </div>
                {alert}
                <div className="card card-custom shadow mb-3">
                    <div className="card-header">
                        <div className="card-title">
                            <i className="fa fa-table"></i> My Ticket List
                        </div>
                        <div className="card-toolbar">
                            <div className="d-flex align-items-center flex-wrap mb-0">
                                <div className="dash-search">
                                    <form className="form-inline my-2 my-lg-0 mr-lg-2">
                                        <div className="input-group">
                                            <input className="form-control border-end-0 border rounded-pill" onChange={(e) => handleSearch(e)} value={filter.search_string} type="text" placeholder="Search for..." />
                                            <span className="input-group-append">
                                                <button className="btn border-0 rounded-pill ms-n5" type="button" onClick={() => getListOfTickets(searchString)}><i className="fa fa-search"></i></button>
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
                                        <th>Ticket Number</th>
                                        <th>Subject</th>
                                        <th>Description</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ticketList.length > 0 ? <>{prepareHtmlTable()}</> : <><tr className="text-center"><td colSpan="5">No data available</td></tr></>}
                                </tbody>
                            </table>
                            <div className=''>
                                <Pagination className="pagination-bar" currentPage={paginationData.page} totalCount={paginationData.totalCount}
                                    pageSize={paginationData.perpage} onPageChange={page => setPaginationData({ ...paginationData, page: page })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    );
}

export default SupportTicketList;