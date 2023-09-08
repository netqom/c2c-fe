import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate } from "react-router-dom";
import { callCommonAction } from '../../../redux/Common/CommonReducer';
import { faFile, faImage, faListCheck, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { sendRequest } from '../../../apis/APIs';
import { toast } from "react-toastify";
import { validateProductFormData, prepareProductSubmitData } from './Validation'
import Alerts from '../../../common/Alerts/Alerts';
import appRoutes from '../../../configs/AppRoutes';
import Tags from "@yaireo/tagify/dist/react.tagify" // React-wrapper file
import "@yaireo/tagify/dist/tagify.css" // Tagify CSS
import Select from 'react-select';
import { useDropzone } from 'react-dropzone'
import { ContentLoading } from '../../Common/ContentLoading';
import { EditorState, ContentState, convertFromHTML } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { convertToHTML } from 'draft-convert';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { Helmet } from 'react-helmet';
import AutoComplete from '../../AutoComplete';
import STRINGS from '../../../common/strings/strings';

export default function AddEditProduct() {
	const navigate = useNavigate();
	const [productDetail, setProductDetail] = useState({ video_path: '', title: '', quantity: 1, delivery_method: '', delivery_price: '', item_type: 1, price: '0', status: 1, delivery_time: '', delivery_method: '', address: 'wq', lat: '', lng: '' });
	const [errorsInfo, setErrorsInfo] = useState({});
	const [prodTags, setProdTags] = useState([]);
	const [deliveryMethods, setDeliveryMethod] = useState([]);
	const [categoryList, setCategoryList] = useState([]);
	const [selectedCategoryOption, setSelectedCategoryOption] = useState([]);
	const { loading, user, alert } = useSelector((state) => state.common)
	const dispatch = useDispatch();
	const { prod_id } = useParams();
	const [files, setFiles] = useState([]);
	const [shippingPriceFieldVisibility, setShippingPriceFieldVisibility] = useState('d-none');
	const tagifyRef = useRef()
	const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
	const [estimateDeliveryTime, setEstimateDeliveryTime] = useState([]);
	const [videoFiles, setVideoFiles] = useState([]);
	const [noVideoError, setNoVideoError] = useState(true);
	const [hasConnectAccount, setHasConnectAccount] = useState(true);
	const [deleteProdVideo, setDeleteProdVideo] = useState(0);

	useEffect(() => {
		getAddEditProduct();
	}, []);

	

	/** Validate Image Here */
	const validateSelectedImages = (file) => {
		const MIN_FILE_SIZE = 0.01 // 1MB
		const MAX_FILE_SIZE = 4 // 5MB
		const fileSizeKiloBytes = ((file.size) / 1024 / 1024)
		if (fileSizeKiloBytes > MAX_FILE_SIZE || fileSizeKiloBytes < MIN_FILE_SIZE) {
			let errorComing = "Each image size must be between of 10KB to 4MB";
			setErrorsInfo({ ...errorsInfo, product_images: errorComing })
		}
	}


	// Get Product Detail
	const getAddEditProduct = async () => {
		try {
			dispatch(callCommonAction({ loading: true }));
			let body = { id: prod_id };
			const res = await sendRequest(`/get-product-form-data`, 'POST', body);
			//Unauthenticated request
			if (res.data.status == false && res.data.message == "Unauthenticated") {
				navigate(appRoutes.authPrfixRoute + '/' + appRoutes.productListRoute)
			}

			setCategoryList(res.data.categories);
			setDeliveryMethod(res.data.delivery_methods);
			setEstimateDeliveryTime(res.data.estimate_delivery_time);
			setHasConnectAccount(res.data.hasConnectAccount);

			if (prod_id != undefined) {
				setProductDetail(res.data.data)
				res.data.data.delivery_method != '1' ? setShippingPriceFieldVisibility('d-none') : setShippingPriceFieldVisibility('d-block');
				const initaleditorState = EditorState.createWithContent(ContentState.createFromBlockArray(convertFromHTML(res.data.data.description)))
				setEditorState(initaleditorState);
				const seletedCat = await res.data.selectedCategories.map((item) => {
					return { value: item.category.id, label: item.category.name }
				})
				setSelectedCategoryOption(seletedCat);
				var tagsObject = JSON.parse(res.data.data.tags);
				setProdTags(tagsObject);
			}

			dispatch(callCommonAction({ loading: false }));

		} catch (error) {
			dispatch(callCommonAction({ loading: false }));
			if (error.response === undefined) { return }
			if (error.response.data.message === 'Unauthenticated.') {
				dispatch(callCommonAction({ isLoggedIn: false, user: {}, token: null }));
				localStorage.clear();
				navigate(appRoutes.loginRoute);
			}
		}
	}

	/** On change shipping  */
	const handleChangeShipping = async (e) => {
		const proData = {...productDetail};
		if (e.target.value != '1') {
			setShippingPriceFieldVisibility('d-none')
			proData[e.target.name] =  e.target.value, 
			proData['delivery_price'] =  '';
		
		} else {
			setShippingPriceFieldVisibility('d-block')
			proData[e.target.name] =  e.target.value, 
			proData['delivery_price'] =  '';
		}
		setProductDetail(proData);
		//await setProductDetail({ ...productDetail, [e.target.name]: e.target.value, delivery_price: '' });
		await checkFormIsValid(e.target.name,proData)
	}

	/** OnChange Update Input Values */
	const handleChange = (e) => {
		// This regular expression 
		if (/^[+]?\d*\.?\d{0,2}$/.test(e.target.value) && (e.target.name == 'price' || e.target.name == 'quantity' || e.target.name == 'delivery_price')) {
			setProductDetail({ ...productDetail, [e.target.name]: e.target.value });
		}
		else {
			if (e.target.name == 'price' || e.target.name == 'quantity' || e.target.name == 'delivery_price') {
				setProductDetail({ ...productDetail, [e.target.name]: e.target.value.replace(/[A-Za-z\+*\-={[}\]|\\:;.."'<,>?/]+/g, "") });
			} else {
				setProductDetail({ ...productDetail, [e.target.name]: e.target.value });
			}
		}

		productDetail[e.target.name] = e.target.value; //Pass immediately for validation
		checkFormIsValid(e.target.name, productDetail);

	}

	const handleAutocomplete = (place) => {
		let cntry = '';
		let stat = '';
		let postal_code = '';
		let postal_town = '';
		let fullAddress = '';

		for (const component of place.address_components) {
			const componentType = component.types[0];
			switch (componentType) {
				case "country":
					cntry = component.long_name;
					break;
				case "administrative_area_level_1":
					stat = component.long_name;
					break;
				case "postal_code":
					postal_code = component.long_name;
					break;
				case "postal_town":
					postal_town = component.long_name;
					break;
				default:
					fullAddress = place.name + ', ' + postal_town + ', ' + cntry;
					break;
			}
		}

		fullAddress = place.name + ', ' + postal_town + ', ' + cntry;

		setProductDetail(prevState => ({
			...prevState,
			address: fullAddress, lat: place.geometry.location.lat(), lng: place.geometry.location.lng()
		}));
	}

	/** Validation implemented here */
	const checkFormIsValid = (name, product) => {
		const hasText = editorState.getCurrentContent().hasText()
		let errors = validateProductFormData(name,prod_id, product, hasText, files, selectedCategoryOption, shippingPriceFieldVisibility, productDetail.address);
		setErrorsInfo(errors);
		if (Object.keys(errors).length > 0) {
			return false;
		} else {
			return true;
		}
	}


	/**  Product Save As Draft   **/
	const saveProductAsDraft = async (saveAsDraft) => {
		let content_html = convertToHTML(editorState.getCurrentContent());
		var formData = prepareProductSubmitData(prod_id, productDetail, files, selectedCategoryOption, content_html, prodTags, videoFiles);
		formData.append('delete_prod_video', deleteProdVideo)
		formData.append('save_as_draft', saveAsDraft)
		try {
			dispatch(callCommonAction({ loading: true }));
			const res = await sendRequest(`/save-product-as-draft`, 'POST', formData);
			if (res.data.status) {
				navigate(appRoutes.authPrfixRoute + '/' + appRoutes.productListRoute)
			}
			dispatch(callCommonAction({ loading: false }));
		} catch (error) {
			dispatch(callCommonAction({ loading: false }));
			if (error.response.data.message === 'Unauthenticated.') {
				dispatch(callCommonAction({ isLoggedIn: false, user: {}, token: null }));
				localStorage.clear();
				navigate(appRoutes.loginRoute);
			}
		}
	}

	/** Form Submit Functionality Here */
	const saveProductForm = async (e, saveAsDraft) => {
		e.preventDefault();
		if (saveAsDraft) {
			saveProductAsDraft(saveAsDraft);
		}else{
			if (checkFormIsValid('', productDetail) && noVideoError) {
				let content_html = convertToHTML(editorState.getCurrentContent());
				var formData = prepareProductSubmitData(prod_id, productDetail, files, selectedCategoryOption, content_html, prodTags, videoFiles);
				formData.append('delete_prod_video', deleteProdVideo)
				formData.append('save_as_draft', saveAsDraft)
				try {
					dispatch(callCommonAction({ loading: true }));
					const res = await sendRequest(`/save-product`, 'POST', formData);
					if (res.data.status) {
						navigate(appRoutes.authPrfixRoute + '/' + appRoutes.productListRoute)
					}
					dispatch(callCommonAction({ loading: false }));
				} catch (error) {
					dispatch(callCommonAction({ loading: false }));
					if (error.response.data.message === 'Unauthenticated.') {
						dispatch(callCommonAction({ isLoggedIn: false, user: {}, token: null }));
						localStorage.clear();
						navigate(appRoutes.loginRoute);
					}
				}
			}
		}
		
	}

	//** autoPopulateCat funtion  */
	const autoPopulateCat = (selCatOp, catLi) => {
		if (selCatOp.length && catLi.length)
			return selCatOp.map((item) => (catLi.findIndex(i => i.value === item.value) != '-1') ? item : null);
		return null
	}

	const tagsChange = (e) => setProdTags(e.detail.tagify.getCleanValue());

	//when image picked or droped on dropzone
	const onDrop = useCallback((acceptedFiles) => {

		if (acceptedFiles.length > 0 && acceptedFiles.length <= 6) {
			acceptedFiles.map((file) => {
				validateSelectedImages(file);
			})

			const hasText = editorState.getCurrentContent().hasText()
			let errors = validateProductFormData('product_image',prod_id, productDetail, hasText, acceptedFiles, selectedCategoryOption, shippingPriceFieldVisibility, productDetail.address);
			setErrorsInfo(errors);
		} else {
			setErrorsInfo({ ...errorsInfo, product_images: "Maximum 6 images can upload" })
		}
		setFiles([...files, ...acceptedFiles])
	}, [files]);

	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		accept: {
			'image/jpeg': ['.jpeg', '.png']
		},
		maxFiles: 6,

	});

	//when delete image button clicked
	const deleteImage = async (e) => {
		var remove_id = e.currentTarget.dataset.id;
		if (e.currentTarget.dataset.type === 'local') {
			const remainingItems = files.filter((item, index) => parseInt(index) !== parseInt(remove_id));
			setErrorsInfo({ ...errorsInfo, product_images: '' })
			if (remainingItems.length > 0) {
				remainingItems.map((file) => {
					validateSelectedImages(file)
				})
			}
			setFiles(remainingItems)
		} else {
			confirmBeforeDeleteImage(remove_id)
		}
	};


	//confirm before delete
	const confirmBeforeDeleteImage = (selected_id) => {
		const custom = Alerts.confirmDelete(selected_id, deleteSelectedImage);
		dispatch(callCommonAction({ alert: custom }));
	}

	//after confirmation delete data
	const deleteSelectedImage = async (selected_id) => {
		dispatch(callCommonAction({ alert: null }));
		if (selected_id > 0) {
			let body = { item_id: selected_id, product_id: prod_id };
			await sendRequest(`/delete-product-image`, 'POST', body)
				.then((res) => {
					if (res.data.status) {
						setProductDetail((prevState) => ({ ...prevState, product_images: res.data.product_image }))
					}
				}).catch((error) => {
					if (error.response.data.message === 'Unauthenticated.') {
						dispatch(callCommonAction({ isLoggedIn: false, user: {}, token: null }));
						localStorage.clear();
						navigate(appRoutes.loginRoute);
					}
				});
		}
	};

	/** Handled Video Upload */
	const handleFileChange = (e) => {
		const filesArray = Array.from(e.target.files);
		console.log('productDetail',productDetail)
		let uploadedFileCnt = productDetail.hasOwnProperty('product_videos') && productDetail.product_videos.length > 0 ? productDetail.product_videos.length : 0
		let total =  videoFiles.length + uploadedFileCnt + filesArray.length
		console.log(total)
		if (total > 3) {
			toast.error(`You can only select up to ${3} videos.`);
			return;
		}
		validateSelectedVideo(filesArray,false);
	};

	/** Validate Videos Here */
	const validateSelectedVideo = (selectedFiles,deleteAction) => {
		const allowedTypes = [ 'video/mp4','video/mov', 'video/avi'];
		const maxFileSize = 10485760; // 10MB in bytes
		let noError = true;
		let errorMessage = '';

		const newVideoFiles = selectedFiles.filter((file) => {
			file.error = '';
			file.id = (Math.random() + 1).toString(36).substring(7);
			if((allowedTypes.includes(file.type)) && (file.size <= maxFileSize)){
				return file
			}else{
				errorMessage = 'Your selected video file has missing type or size';
			}
		})
		if(errorMessage)
			toast.error(errorMessage);

		setNoVideoError(noError);
		if(deleteAction){
			setVideoFiles(newVideoFiles)
		}else{
			setVideoFiles([...newVideoFiles,...videoFiles]);
		}
	};

	/** Delete Video FRom Here */
	const deleteVideo = (e) => {
		console.log(e.currentTarget.dataset.id)
		var remove_id = e.currentTarget.dataset.id;
		if (e.currentTarget.dataset.type === 'local') {
			const remainingItems = videoFiles.filter((item) => item.id !== remove_id);
			setVideoFiles(remainingItems)
		} else {
			confirmBeforeDeleteVideo(remove_id)
		}
	}

	const confirmBeforeDeleteVideo = (selected_id) => {
		const custom = Alerts.confirmDelete(selected_id, deleteSelectedVideo);
		dispatch(callCommonAction({ alert: custom }));
	}

	//after confirmation delete data
	const deleteSelectedVideo = async (selected_id) => {
		dispatch(callCommonAction({ alert: null }));
		if (selected_id > 0) {
			let body = { item_id: selected_id, product_id: prod_id };
			await sendRequest(`/delete-product-video`, 'POST', body)
				.then((res) => {
					if (res.data.status) {
						setProductDetail((prevState) => ({ ...prevState, product_videos: res.data.product_videos }))
					}
				}).catch((error) => {
					if (error.response.data.message === 'Unauthenticated.') {
						dispatch(callCommonAction({ isLoggedIn: false, user: {}, token: null }));
						localStorage.clear();
						navigate(appRoutes.loginRoute);
					}
				});
		}
	};

	/** On change category function here */
	const onChangeCategory = (event) => {
		setSelectedCategoryOption(event);
		let erMsg = event.length === 0 ? STRINGS.product.categoryReq : ''
		setErrorsInfo({...errorsInfo, category_id : erMsg  })
	}

	const onEditorStateChange = (content) => {  setEditorState(content); checkFormIsValid('description',productDetail) }

	return (
		<div className="content-wrapper">
			<Helmet>
				<title>Alium | Add/Edit Product Page</title>
				<meta name="description" content="Add/Edit Product Page Description Goes Here" />
				<meta name="keywords" content="Game, Entertainment, Movies" />
			</Helmet>
			<div className="container">
				{/* <div className={`d-flex align-items-center alert-box-warning alert-box  mb-3 ${user.paypal_email == null || user.paypal_email == '' ? 'd-block' : 'd-none'}`} onClick={() => navigate(appRoutes.authPrfixRoute + '/' + appRoutes.profileRoute, { state: { tab: 'account_info' } })} >
					<span className="fa fa-exclamation-triangle fa-2x" aria-hidden="true"></span>
					<h6 className="ms-2">Note: This request is currently not supported for you because you don't set paypal account yet.To set paypal account just click on me.</h6>
				</div> */}

				<div className={`d-flex align-items-center alert-box-warning alert-box  mb-3 ${hasConnectAccount ? 'd-none' : 'd-block'}`} onClick={() => navigate(appRoutes.authPrfixRoute + '/' + appRoutes.profileRoute, { state: { tab: 'account_info' } })} >
					<span className="fa fa-exclamation-triangle fa-2x" aria-hidden="true"></span>
					<h6 className="ms-2">Note: This request is currently not supported because you have not yet setup your Stripe account. To connect accounts, click here.</h6>
				</div>
				<div className="d-flex justify-content-between align-items-center breadcrum-container mb-3">
					<ol className="breadcrumb">
						<li className="breadcrumb-item">
							<a href={undefined} onClick={() => navigate(appRoutes.authPrfixRoute + '/' + appRoutes.dashboardRoute)}>Dashboard</a>
						</li>
						<li className="breadcrumb-item"><a href={undefined} onClick={() => navigate(appRoutes.authPrfixRoute + '/' + appRoutes.productListRoute)}>Product List</a></li>
						<li className="breadcrumb-item active">{prod_id === undefined ? 'Add ' : 'Edit '}Product</li>
					</ol>
				</div>
				{alert}
				<div className="card card-custom mb-3">
					<div className="card-body">
						{loading ? <ContentLoading /> :
							<div className="form">
								<form id="login-form" noValidate onSubmit={(e) => saveProductForm(e, false)}>
									<div className="form-body">
										<div className="form-group">
											<label className="form-control-label" htmlFor="title">Title</label>
											<input className="form-control" type="text" onChange={handleChange} value={productDetail.title} name="title" placeholder="Enter product title" />
											<span className='invalid-field'>{errorsInfo.title}</span>
										</div>
										<div className="form-group">
											<label className="form-control-label" htmlFor="description">Description </label>
											<Editor className='text-body' editorState={editorState} wrapperClassName="wrapper-class" editorClassName="editor-class" toolbarClassName="toolbar-class" onEditorStateChange={onEditorStateChange} />
											<span className='invalid-field'>{errorsInfo.description}</span>
										</div>
										<div className="form-group">
											<label className="form-control-label" htmlFor="category_id">Category </label>
											<Select name="category_id" value={autoPopulateCat(selectedCategoryOption, categoryList)} isSearchable isMulti onChange={onChangeCategory} options={categoryList} />
											<span className='invalid-field'>{errorsInfo.category_id}</span>
										</div>

										<div className="row">
											<div className="form-group col-md-6">
												<label className="form-control-label">Price</label>
												<div className={`form-group input-icon ${errorsInfo.hasOwnProperty('price') ? 'input-icon-2' : ''}`}>
													<input type="text" id="money" name="price" className="form-control input-icon" onChange={handleChange} placeholder="Enter Price" value={productDetail.price} min="0" />
													<i>£</i>
													{errorsInfo.hasOwnProperty('price') ? <span className='invalid-field'>{errorsInfo.price}</span> : ''}
												</div>
											</div>
											{/* <div className="form-group col-md-6">
												<label className="form-control-label">Product Status</label>
												<select className="form-control col-md-12" name="status" onChange={handleChange} defaultValue={productDetail.status}>
													<option value="">Select Status</option>
													<option value="1" selected={productDetail.status == '1' ? 'selected' : ''}>Active</option>
													<option value="0" selected={productDetail.status == '0' ? 'selected' : ''}>In-Active</option>
												</select>
												<span className='invalid-field'>{errorsInfo.status}</span>
											</div> */}
											<AutoComplete handleAutocomplete={handleAutocomplete} page={'addeditproduct'} errorsInfo={errorsInfo} address={productDetail.address} />
										</div>
										<div className="row">
											<div className="form-group col-md-12">
												<label className="form-control-label">Tags</label>
												<Tags className="form-control col-md-12"
													tagifyRef={tagifyRef} // optional Ref object for the Tagify instance itself, to get access to  inner-methods
													settings={{ templates: {} }}
													value={prodTags}
													maxTags={10}
													onChange={(e) => { tagsChange(e); checkFormIsValid('tags',productDetail); }}
													placeholder="Enter Tags..."
												/>
												<div className="text-danger d-block">Note: Maximum 10 tags allow to be added</div>
											</div>
										</div>

										<div className="col-md-12 my-4 p-2 rounded-1 bg-purple-light"><h6 className="m-0 text-white">
											<FontAwesomeIcon icon={faListCheck} /> General Information</h6>
										</div>
										<div className="row">
											{/* <div className="form-group col-md-4">
												<label className="form-control-label">Item</label>
												<input type="text" name="game" className="form-control" onChange={handleChange} placeholder="Enter Item" value={productDetail.game} />
												<span className='invalid-field'>{errorsInfo.game}</span>
											</div> */}
											{/* <div className="form-group col-md-4">
												<label className="form-control-label">Available quantity</label>
												<input type="text" name="quantity" className="form-control" onChange={handleChange} placeholder="Enter Quantity" value={productDetail.quantity} min="1" />
												<span className='invalid-field'>{errorsInfo.quantity}</span>
											</div> */}
											<div className="form-group col-md-6">
												<label className="form-control-label">Estimated Delivery Days</label>
												<select className="form-control" name="delivery_time" onChange={handleChange} value={productDetail.delivery_time}>
													<option value="">Select Option</option>
													{
														estimateDeliveryTime && estimateDeliveryTime.map((item, index) => <option value={item.id} key={item.id}>{item.value}</option>)
													}
												</select>
												<span className='invalid-field'>{errorsInfo.delivery_time}</span>
											</div>
											<div className="form-group col-md-6">
												<label className={`form-control-label`} >Shipping Available</label>
												<select className="form-control" name="delivery_method" onChange={handleChangeShipping} value={productDetail.delivery_method}>
													<option value="">Select Option</option>
													{
														deliveryMethods &&
														Object.keys(deliveryMethods).map((key, index) => <option value={key} key={key}>{deliveryMethods[key]}</option>)
													}
												</select>
												<span className='invalid-field'>{errorsInfo.delivery_method}</span>
											</div>
										</div>

										<div className="row">
											<div className={`form-group col-md-4 ${shippingPriceFieldVisibility}`} >
												<label className="form-control-label">Shipping Price</label>
												<div className={`form-group input-icon ${errorsInfo.hasOwnProperty('delivery_price') ? 'input-icon-2' : ''}`} >
													<input type="text" name="delivery_price" className="form-control" onChange={handleChange} placeholder="Enter Shipping Price" value={productDetail.delivery_price} min="0" />
													<i>£</i>
													<span className='invalid-field'>{errorsInfo.delivery_price}</span>
												</div>
											</div>
										</div>
										<div className="col-md-12 my-4 p-2 rounded-1 bg-purple-light"><h6 className="m-0 text-white">
											<FontAwesomeIcon icon={faImage} /> Product Images</h6>
										</div>
									</div>
									<div>
										<div className="row">
											<div {...getRootProps()} className="col-md-12">
												<input {...getInputProps()} />
												<span className="browse-img-box"><FontAwesomeIcon icon={faFile} size="3x" /><div style={{ textAlign: 'center' }}><div>Click to select files</div><div className='text-danger'>(Only *.jpeg and *.png images will be accepted and upload maximum 6 files)</div></div></span>
											</div>
											{(productDetail.product_images || []).map((serverimage, index) => (
												<div className="col-md-2 mb-3" key={index}>
													<div className="image-area">
														<img src={serverimage.url} className="m-2" alt="" />
														<span data-id={serverimage.id} data-type="server" className="remove-image" onClick={(e) => deleteImage(e)} >
															<FontAwesomeIcon icon={faTrashCan} />
														</span>
													</div>
												</div>
											))}

											{(files || []).map((file, index) => (
												<div className="col-md-2 mb-3" key={index}>
													<div className="image-area">
														<img src={URL.createObjectURL(file)} className="m-2" alt="" />
														<span data-id={index} data-type="local" className="remove-image" onClick={(e) => deleteImage(e)} >
															<FontAwesomeIcon icon={faTrashCan} />
														</span>
													</div>
												</div>
											))}
										</div>
										<span className='invalid-field'>{errorsInfo.product_images}</span>
									</div>
									<div className="col-md-12 my-4 p-2 rounded-1 bg-purple-light"><h6 className="m-0 text-white">
										<FontAwesomeIcon icon={faImage} /> Product Videos</h6>
									</div>
									<div className="row">
										<div className="form-group col-md-12">
											<div className=" d-flex">
												<label htmlFor="product_video" className="align-items-center browse-img-box d-flex form-control-label justify-content-center">
													<FontAwesomeIcon icon={faFile} size="3x" />
													Click to select files
													<div className="text-danger d-block">(Only *.mp4, *.mov and *.avi videos will be accepted and upload maximum 3 files and each file size should be under 10MB)</div>
												</label>
												<input id="product_video" type="file" multiple accept="video/*" className='ml-2 d-none' name="video_file" onChange={handleFileChange} />
												{/* <span className='invalid-field'>{noVideoError}</span> */}
											</div>
										</div>
									</div>


									
									<div className='row d-flex'>
										{/* Saved Video Files Show Here */}
										
										{productDetail.hasOwnProperty('product_videos') && productDetail.product_videos
											?
											productDetail.product_videos.map((file, index) => (
												<div className="col-md-2 text-center" key={index}>
													<div className="image-area">
														<img src="/assets/images/print-164210362.webp" width="100px" height="100px" />
														<span className="remove-image" data-id={file.id} data-type="server" onClick={(e) => deleteVideo(e)}><FontAwesomeIcon icon={faTrashCan} /></span>
													</div>
													<span>{file.name.length < 15 ? file.name : file.name.substr(0, 8) + '...' + file.name.substr(-8)}</span>
												</div>
											))
											:
											null
										}

										{/* Selected VIdeo Files Show Here */}
										{
											videoFiles.map((file, index) => (
												<div className="col-md-2 text-center mb-3" key={index}>
													<div className="image-area">
														<img src="/assets/images/print-164210362.webp" width="100px" height="100px" />
														<span className="remove-image" data-id={file.id} data-type="local" onClick={(e) => deleteVideo(e)}><FontAwesomeIcon icon={faTrashCan} /></span>
													</div>
													<span>{file.name.length < 15 ? file.name : file.name.substr(0, 8) + '...' + file.name.substr(-8)}</span>
													<span className='d-block invalid-field'>{file.error}</span>
												</div>
											))
										}
									</div>
									
									<div className="border-top mb-5 mt-5 pt-3">
										<button type="submit" className={`btn btn-sm btn-primary me-3 mt-2 ${hasConnectAccount === false ? 'disabled' : ''}`}>Save</button>
										{/* <button type="submit" className={`btn btn-sm btn-primary me-3 mt-2`}>Save</button> */}
										<button className="btn btn-sm btn-secondary mt-2 mr-2" onClick={() => navigate(appRoutes.authPrfixRoute + '/' + appRoutes.productListRoute)}>Cancel</button>
										{productDetail.hasOwnProperty('id') && productDetail.status  ? null : <button type="submit" className={`btn btn-sm btn-primary ms-3 mt-2`} onClick={(e) => saveProductForm(e, true)}>Save as Draft</button>}
									</div>
								</form>
							</div>
						}
					</div>
				</div>
			</div>
		</div>
	)
}