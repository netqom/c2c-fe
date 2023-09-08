import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { callCommonAction } from '../../redux/Common/CommonReducer';
import { sendRequest } from '../../apis/APIs';
import Alerts from '../../common/Alerts/Alerts';
import Pagination from '../Pagination/pagination';
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Moment from 'moment'
import AppConfig from '../../configs/AppConfig';
import appRoutes from '../../configs/AppRoutes';
import { ContentLoading } from '../Common/ContentLoading';
import { CheckUnAuthorized } from '../Common/CheckUnAuthorized';
import { Helmet } from 'react-helmet';
import SearialNumber from '../Common/SearialNumber';


export default function NotificationList() {
	const [notificationList, setNotificationList] = useState([]);
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [paginationData, setPaginationData] = useState({ perpage: AppConfig.recordsPerPageTable, page: 1, totalCount: 0 });
	const [filter, setFilter] = useState({ search_string: '' })
	const { loading, alert } = useSelector((state) => state.common)

	useEffect(() => {
		//console.log('comming to product list');
		callNotificationListApi()
	}, [paginationData.page]);

	const callNotificationListApi = async () => {
		try {
			dispatch(callCommonAction({ loading: true }));
			let body = { pagination: paginationData };
			// Set search filter and passs as query 
			if (filter.search_string != '') {
				body.query = { search_string: filter.search_string };
			}
			const res = await sendRequest(`/get-notification-list`, 'POST', body);
			setNotificationList(res.data.data);
			setPaginationData({ ...paginationData, totalCount: res.data.meta.total })
			localStorage.setItem('raiseNotificationBell', false)
			dispatch(callCommonAction({ loading: false, raiseNotificationBell: false }));
		} catch (error) {
			CheckUnAuthorized({ error: error, dispatch: dispatch, navigate: navigate, callCommonAction: callCommonAction })
		}
	}

	const confirmBeforeDelete = (selected_id) => {
		//console.log('selected_id', selected_id);
		const custom = Alerts.confirmDelete(selected_id, deleteSelectedNotification);
		dispatch(callCommonAction({ alert: custom }));
	}

	//after confirmation delete data
	const deleteSelectedNotification = async (selected_id) => {
		dispatch(callCommonAction({ alert: null }));
		if (selected_id > 0) {
			dispatch(callCommonAction({ loading: true }));
			let body = { item_id: selected_id };
			await sendRequest(`/delete-notification`, 'POST', body)
				.then((res) => {
					dispatch(callCommonAction({ loading: false }));
					if (res.data.status) {
						callNotificationListApi();
					}
				}).catch((error) => {
					dispatch(callCommonAction({ loading: false }));
					if (error.response.data.message === 'Unauthenticated.') {
						dispatch(callCommonAction({ isLoggedIn: false, user: {}, token: null }));
						localStorage.clear();
						navigate(appRoutes.loginRoute);
					}
				});
		}
	};

	const prepareHtmlTable = () => {
		return notificationList.map((item, index) => {
			return (
				<tr v-for="item in tableItems" key={item.id}>
					<td>{(paginationData.page == 1 ? (index+1) : ( ( (paginationData.page) - 1) * (paginationData.perpage)) + (index+1) )}</td>
					<td>{item.from.name}</td>
					<td>
						<div dangerouslySetInnerHTML={{ __html: item.description }} />
					</td>
					<td>{Moment(item.created_at).format('MMM DD, yyyy')}</td>
					<td>
						<ul className="list-unstyled d-flex action-icons m-0">
							<li><button className="btn btn-sm" type="button" onClick={() => confirmBeforeDelete(item.id)}><FontAwesomeIcon icon={faTrashCan} className='text-danger' /></button></li>
						</ul>
					</td>
				</tr>
			)
		})
	}

	return (
		<div className="content-wrapper">
			<Helmet>
				<title>Alium | Notification Page</title>
				<meta name="description" content="Notification Page Description Goes Here" />
				<meta name="keywords" content="Game, Entertainment, Movies" />
			</Helmet>
			<div className="container">
				<div className="d-flex justify-content-between align-items-center breadcrum-container mb-3">
					<ol className="breadcrumb">
						<li className="breadcrumb-item">
							<a href={undefined} onClick={() => navigate(appRoutes.authPrfixRoute + '/' + appRoutes.dashboardRoute)}>Dashboard</a>
						</li>
						<li className="breadcrumb-item active">Notification List</li>
					</ol>
				</div>
				{alert}
				<div className="card card-custom shadow mb-3">
					<div className="card-header">
						<div className="card-title">
							<i className="fa fa-table"></i> Notification List
						</div>
						<div className="card-toolbar">
							<div className="d-flex align-items-center flex-wrap mb-0">
								<div className="dash-search">
									<form className="form-inline my-2 my-lg-0 mr-lg-2">
										<div className="input-group">
											<input className="form-control border-end-0 border rounded-pill" onChange={(e) => setFilter({ ...filter, search_string: e.target.value })} value={filter.search_string} type="text" placeholder="Search for..." />
											<span className="input-group-append">
												<button className="btn border-0 rounded-pill ms-n5" type="button" onClick={() => callNotificationListApi()}><i className="fa fa-search text-black"></i></button>
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
										<th>Id</th>
										<th>From</th>
										<th>Description</th>
										<th>Date</th>
										<th>Action</th>
									</tr>
								</thead>
								<tbody>
									{notificationList.length > 0 ? <>{prepareHtmlTable()}</> : <><tr className="text-center"><td colSpan="6">No data available</td></tr></>}
								</tbody>
							</table>
							<div className='pag'>
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