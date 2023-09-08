import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { callCommonAction } from '../../../redux/Common/CommonReducer';
import { sendRequest } from '../../../apis/APIs';
import Alerts from '../../../common/Alerts/Alerts';
import Pagination from '../../Pagination/pagination';
import { faTrashCan, faEye, faEdit, faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AppConfig from '../../../configs/AppConfig';
import appRoutes from '../../../configs/AppRoutes';
import { ContentLoading } from '../../Common/ContentLoading';
import { CheckUnAuthorized } from '../../Common/CheckUnAuthorized';
import { Helmet } from 'react-helmet';

export default function ProductList() {
	const [productList, setProductList] = useState([]);
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [paginationData, setPaginationData] = useState({ perpage: AppConfig.recordsPerPageTable, page: 1, totalCount: 0 });
	const [filter, setFilter] = useState({ search_string: '' })
	const [draftProduct, setDraftProduct] = useState(null);
	const { alert } = useSelector((state) => state.common)

	useEffect(() => {
		//console.log('comming to product list');
		callProductListApi()
	}, [paginationData.page]);

	const callProductListApi = async () => {
		try {
			dispatch(callCommonAction({ loading: true }));
			let body = { pagination: paginationData };
			// Set search filter and passs as query 
			if (filter.search_string != '') {
				body.query = { search_string: filter.search_string };
			}
			const res = await sendRequest(`/get-product-list`, 'POST', body);
			setDraftProduct(res.data.draft_product);
			setProductList(res.data.data);
			setPaginationData({ ...paginationData, totalCount: res.data.meta.total })
			dispatch(callCommonAction({ loading: false, }));
		} catch (error) {
			CheckUnAuthorized({ error: error, dispatch: dispatch, navigate: navigate, callCommonAction: callCommonAction })
		}
	}

	const confirmBeforeDelete = (selected_id) => {
		//console.log('selected_id', selected_id);
		const custom = Alerts.confirmDelete(selected_id, deleteSelectedProduct);
		dispatch(callCommonAction({ alert: custom }));
	}

	//after confirmation delete data
	const deleteSelectedProduct = async (selected_id) => {
		dispatch(callCommonAction({ alert: null }));
		if (selected_id > 0) {
			dispatch(callCommonAction({ loading: true }));
			let body = { product_id: selected_id };
			await sendRequest(`/delete-product`, 'POST', body)
				.then((res) => {
					dispatch(callCommonAction({ loading: false }));
					callProductListApi();
				}).catch((error) => {
					CheckUnAuthorized({ error: error, dispatch: dispatch, navigate: navigate, callCommonAction: callCommonAction })
				});
		}
	};

	const prepareHtmlTable = () => {
		return productList.map((item) => {
			const categoriesName = item.product_categories.map((pCat) => pCat.category.name).join(', ');
			return (
				<tr v-for="item in tableItems" key={item.id}>
					<td className='image-fill'><img src={item.display_thumb_path} width="25px" height="25px" /></td>
					<td><div className='text-truncate' style={{maxWidth: "500px"}}>{item.title}</div></td>
					<td>{categoriesName}</td>
					<td><strong>£</strong>{item.price}</td>
					<td>{item.quantity == 0 ? <span className="btn btn-danger btn-sm px-1 py-0" >Yes</span> : <span className="btn btn-success btn-sm px-1 py-0" >No</span>}</td>
					<td>
						<ul className="list-unstyled d-flex action-icons m-0">
							<li><button className="btn btn-sm" type="button" onClick={() => navigate('/' + appRoutes.productDetailRoute + '/' + item.slug)} ><FontAwesomeIcon icon={faEye} /></button></li>
							{item.quantity != 0 ? <li><button className="btn btn-sm" type="button" onClick={() => navigate(appRoutes.authPrfixRoute + '/' + appRoutes.productFormRoute + '/' + item.id)}><FontAwesomeIcon icon={faEdit} className='text-success' /></button></li> : ''}
							<li><button className="btn btn-sm" type="button" onClick={() => confirmBeforeDelete(item.id)}><FontAwesomeIcon icon={faTrashCan} className='text-danger' /></button></li>
						</ul>
					</td>
				</tr>
			)
		})
	}

	const clearDraft = (selected_id) => {
		const custom = Alerts.confirmDelete(selected_id, deleteDraftProduct);
		dispatch(callCommonAction({ alert: custom }));
	}

	const deleteDraftProduct = async (selected_id) => {
		dispatch(callCommonAction({ alert: null }));
		if (selected_id > 0) {
			dispatch(callCommonAction({ loading: true }));
			let body = { product_id: selected_id };
			await sendRequest(`/clear-draft-product`, 'POST', body)
				.then((res) => {
					dispatch(callCommonAction({ loading: false }));
					callProductListApi();
				}).catch((error) => {
					CheckUnAuthorized({ error: error, dispatch: dispatch, navigate: navigate, callCommonAction: callCommonAction })
				});
		}
	}

	const searchHandler = async (e) => {
		e.preventDefault();
		setFilter({ ...filter, search_string: e.target.value });
		if (e.key === 'Enter') {
			await callProductListApi();
		}
	}


	return (
		<div className="content-wrapper">
			<Helmet>
				<title>Alium | My Product List Page</title>
				<meta name="description" content="Product List Page Description Goes Here" />
				<meta name="keywords" content="Game, Entertainment, Movies" />
			</Helmet>
			<div className="container">
				<div className="d-flex justify-content-between align-items-center breadcrum-container mb-3">
					<ol className="breadcrumb">
						<li className="breadcrumb-item">
							<a href={undefined} onClick={() => navigate(appRoutes.authPrfixRoute + '/' + appRoutes.dashboardRoute)}>Dashboard</a>
						</li>
						<li className="breadcrumb-item active">Product List</li>
					</ol>
					<div className="">
						{
							draftProduct && draftProduct.hasOwnProperty('id')
								?
								<>
									<button type="button" className="btn btn-danger  btn-sm rounded-pill" onClick={() => clearDraft(draftProduct.id)}><FontAwesomeIcon icon={faMinus} /> Clear Draft</button>
									<button type="button" className="btn btn-success ms-2 btn-sm rounded-pill" onClick={() => navigate(appRoutes.authPrfixRoute + '/' + appRoutes.productFormRoute + '/' + draftProduct.id)}><FontAwesomeIcon icon={faPlus} /> Complete Draft</button>
								</>
								:
								<button type="button" className="btn btn-success btn-sm rounded-pill" onClick={() => navigate(appRoutes.authPrfixRoute + '/' + appRoutes.productFormRoute)}><FontAwesomeIcon icon={faPlus} /> Add New</button>
						}

					</div>
				</div>
				{alert}
				<div className="card card-custom shadow mb-3">
					<div className="card-header">
						<div className="card-title">
							<i className="fa fa-table"></i> Product List
						</div>
						<div className="card-toolbar">
							<div className="d-flex align-items-center flex-wrap mb-0">
								<div className="dash-search">
									<div className="form-inline my-2 my-lg-0 mr-lg-2">
										<div className="input-group">
											<input className="form-control border-end-0 border rounded-pill" onKeyUp={searchHandler}  onChange={(e) => searchHandler(e)} value={filter.search_string} type="text" placeholder="Search for..." />
											<span className="input-group-append">
												<button className="btn border-0 rounded-pill ms-n5" type="button" onClick={() => callProductListApi()}><i className="fa fa-search text-black"></i></button>
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
										<th>Image</th>
										<th>Title</th>
										<th>Categories</th>
										<th>Price</th>
										<th>Sold Out</th>
										<th>Action</th>
									</tr>
								</thead>
								<tbody>
									{productList.length > 0 ? <>{prepareHtmlTable()}</> : <><tr className="text-center"><td colSpan="6">No data available</td></tr></>}
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