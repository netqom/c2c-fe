import React, { useState, useEffect } from 'react';
//import shortid from "https://cdn.skypack.dev/shortid@2.2.16";
import './SupportTicket.css'
import { Helmet } from 'react-helmet';
import { sendRequest } from '../../apis/APIs';
import { useDispatch } from 'react-redux'
import { callCommonAction } from '../../redux/Common/CommonReducer'
import { useNavigate } from 'react-router-dom';
import appRoutes from '../../configs/AppRoutes';
import { toast } from 'react-toastify';
import Select from 'react-select';

const AddEditSupportTicket = () => {
    const dispatch = useDispatch();
    const [selectedfile, SetSelectedFile] = useState([]);
    const [Files, SetFiles] = useState([]);
    const [ticketForm, setTicketForm] = useState({ subject: '', description: '' });
    const [errorsInfo, setErrorsInfo] = useState({});
    const navigate = useNavigate();
    const [orderList, setOrderList] = useState([]);
    const [checkUserHasOrder, setCheckUserHasOrder] = useState(false);
    const [selectedOrderOption, setSelectedOrderOption] = useState([]);

    useEffect(() => {
        getOrderList();
    }, []);
    /** OnChange Update Input Values */
    const handleChange = (e) => {
        ticketForm[e.target.name] = e.target.value
        checkFormIsValid(e.target.name, ticketForm, checkUserHasOrder)
        setTicketForm(ticketForm);
    }

    const checkFormIsValid = (name = null, ticketForm, checkUserHasOrder) => {
        let error = {}, isValid = true;
        if ((name == '' && ticketForm.subject == '') || (name == 'subject' && ticketForm.subject == '')) {
            error.subject = 'Please enter subject';
            isValid = false;
        }
        if ((name == '' && ticketForm.description == '') || (name == 'description' && ticketForm.description == '')) {
            error.description = 'Please enter description';
            isValid = false;
        }

        // if(checkUserHasOrder){
        //     error.product_id = 'Please select product from list';
        //     isValid = false;
        // }
        setErrorsInfo(error)
        return isValid;
    }


    /* File Size Acmulated from this method */
    const filesizes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    /** On change files are set in selected file array */
    const InputChange = (e) => {
        // --For Multiple File Input
        // let images = [];
        // for (let i = 0; i < e.target.files.length; i++) {
            // images.push((e.target.files[i]));
            let reader = new FileReader();
            let file = e.target.files[0];
            reader.onloadend = () => {
                // SetSelectedFile((preValue) => {
                //     return [
                //         ...preValue,
                //         {
                //             // id: shortid.generate(),
                //             id: (Math.random() + 1).toString(36).substring(7),
                //             filename: e.target.files[i].name,
                //             filetype: e.target.files[i].type,
                //             fileimage: reader.result,
                //             datetime: e.target.files[i].lastModifiedDate.toLocaleString('en-IN'),
                //             filesize: filesizes(e.target.files[i].size)
                //         }
                //     ]
                // });
                SetSelectedFile([
                        {
                            id: (Math.random() + 1).toString(36).substring(7),
                            filename: e.target.files[0].name,
                            filetype: e.target.files[0].type,
                            fileimage: reader.result,
                            datetime: e.target.files[0].lastModifiedDate.toLocaleString('en-IN'),
                            filesize: filesizes(e.target.files[0].size)
                        }
                    ]);
            }
            if (e.target.files[0]) {
                reader.readAsDataURL(file);
            }
        // }
    }

    /** Delete File From Selected File Array */
    const DeleteSelectFile = (id) => {
        if (window.confirm("Are you sure you want to delete this Image?")) {
            const result = selectedfile.filter((data) => data.id !== id);
            SetSelectedFile(result);
        }

    }

    /** Submit Form For Ticket **/
    const TicketSubmit = async (e) => {
        e.preventDefault();
        if (selectedfile.length > 0) {
            for (let index = 0; index < selectedfile.length; index++) {
                SetFiles((preValue) => {
                    return [
                        ...preValue,
                        selectedfile[index]
                    ]
                })
            }
            SetSelectedFile([]);
        }
        if (checkFormIsValid('', ticketForm)) {
            try {
                dispatch(callCommonAction({ loading: true }));
                const formData = new FormData();
                formData.append(`subject`, ticketForm.subject)
                formData.append(`description`, ticketForm.description)
                formData.append(`product_id`, selectedOrderOption.value)

                const fileInput = document.getElementById('fileupload');
                console.log('fileInput', fileInput.files)
                // for (let i = 0; i < fileInput.files.length; i++) {
                    formData.append(`file[${0}]`, fileInput.files[0]);
                // }
                const res = await sendRequest(`/save-ticket-form-data`, 'POST', formData);
                // form reset on submit 
                if (res.status) {
                    setTicketForm({ subject: '', description: '', product_id:'' });
                    navigate(appRoutes.authPrfixRoute + '/' + appRoutes.helpCenterRoute)
                }
                dispatch(callCommonAction({ loading: false }));
            } catch (error) {
                dispatch(callCommonAction({ loading: false }));
                toast.error("Something went wrong,please try again.");
                if (error.response.data.message === 'Unauthenticated.') {
                    dispatch(callCommonAction({ isLoggedIn: false, user: {}, token: null }));
                    localStorage.clear();
                    navigate(appRoutes.loginRoute);
                }
            }
        }
    }

    /** Delete Set Files */
    const DeleteFile = async (id) => {
        if (window.confirm("Are you sure you want to delete this Image?")) {
            const result = Files.filter((data) => data.id !== id);
            SetFiles(result);
        } else {
            // alert('No');
        }
    }

    /** Get Order List */

    const getOrderList = async () => {
        const res = await sendRequest(`/get-order-list`, 'GET');
        // console.log(res.data.orders);
        const productData =  res.data.orders;
        if(productData.length){
            setCheckUserHasOrder(true);
        }
        const productOptions = productData.map((item,index)=>{
            return {value : item.product.id , label : item.product.title}
        })  
        setOrderList(productOptions);
    }

    //** autoPopulateCat funtion  */
	const autoPopulateCat = (selectedOrderOption, orderList) => {
		// if (selectedOrderOption.length && catLi.length)
		// 	return selectedOrderOption.map((item) => (catLi.findIndex(i => i.value === item.value) != '-1') ? item : null);
		// return null
	}

    return (
        <div className="content-wrapper support-ticket">
            {console.log(selectedOrderOption)}
            <Helmet>
                <title>Alium | Support Ticket Page</title>
                <meta name="description" content="Support ticket page description goes here" />
                <meta name="keywords" content="Game, Entertainment, Movies" />
            </Helmet>
            <div className="container">
                <div className="row">
                    <div className="col-xl-8 mx-auto">
                        <h2 className="text-center mt-4">Help Desk Ticket System</h2>
                        <div id="ticketBox">
                            <div id="ticketBoxCenter">
                                <div className="fileupload-view">
                                    <div className="row justify-content-center m-0">
                                        <div className="col-lg-10 offset-lg-1 col-md-12 col-sm-12 ">
                                            <div className="card mt-5">
                                                <div className="card-body">
                                                    <div className="kb-data-box form">
                                                        <form onSubmit={TicketSubmit} encType="multipart/form-data">
                                                            <div className='form-box row mb-3'>
                                                                <div className='col'>
                                                                    <label className="mt-3">Subject</label>
                                                                    <input id="mainIssue" name="subject" onChange={(e) => handleChange(e)} value={ticketForm.subject} className="form-control" />
                                                                    <span className='invalid-field'>{errorsInfo.subject}</span>
                                                                </div>
                                                            </div>
                                                            {
                                                                checkUserHasOrder ? 
                                                                <div className='form-box row mb-3'>
                                                                    <div className='col'>
                                                                        <label className="mt-3">Select Product</label>
                                                                        <Select name="product_id" value={autoPopulateCat(setSelectedOrderOption, orderList)} isSearchable onChange={setSelectedOrderOption} options={orderList}/>
                                                                        <span className='invalid-field'>{errorsInfo.product_id}</span>
                                                                    </div>
                                                                </div>
                                                                : ''
                                                            }
                                                            <div className='form-box row mb-3'>
                                                                <div className='col'>
                                                                    <label className="mt-3">Description</label>
                                                                    <textarea id="details" name="description" onChange={(e) => handleChange(e)} className="form-control" rows="2" value={ticketForm.description}></textarea>
                                                                    <span className='invalid-field'>{errorsInfo.description}</span>
                                                                </div>
                                                            </div>
                                                            <div className='row'>
                                                                <div className='col'>
                                                                    <label className="mt-3">File Upload With Preview</label>
                                                                    <div className="kb-file-upload">
                                                                        <div className="file-upload-box">
                                                                            <input type="file" id="fileupload" accept="image/*" className="file-upload-input" onChange={InputChange}  />
                                                                            <div className='text-center'>
                                                                            <span className='text-white'>Drag and drop or <span className='text-decoration-underline'>Choose your files</span></span>
                                                                            <div className="text-danger">(Only *.jpeg and *.png images will be accepted)</div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="kb-attach-box mb-3">
                                                                        {
                                                                            selectedfile.map((data, index) => {
                                                                                const { id, filename, filetype, fileimage, datetime, filesize } = data;
                                                                                return (
                                                                                    <div className="file-atc-box" key={id}>
                                                                                        {
                                                                                            filename.match(/.(jpg|jpeg|png|gif|svg)$/i) ?
                                                                                                <div className="file-image"> <img src={fileimage} alt="" /></div> :
                                                                                                <div className="file-image"><i className="far fa-file-alt"></i></div>
                                                                                        }
                                                                                        <div className="file-detail">
                                                                                            <h6>{filename}</h6>
                                                                                            <p className='small'><span><strong>Size</strong> : {filesize}</span><br />
                                                                                            <span className="ml-2"><strong>Modified Time</strong> : {datetime}</span></p>
                                                                                            <div className="file-actions">
                                                                                                <button type="button" className="file-action-btn" onClick={() => DeleteSelectFile(id)}>Delete</button>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                )
                                                                            })
                                                                        }
                                                                    </div>
                                                                    <div className="kb-buttons-box">
                                                                        <button type="submit" className="btn btn-sm btn-primary me-3 mt-2 ">Submit</button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </form>
                                                        {/* {
                                                            Files.length > 0
                                                                ?
                                                                <div className="kb-attach-box">
                                                                    <hr />
                                                                    {
                                                                        Files.map((data, index) => {
                                                                            const { id, filename, filetype, fileimage, datetime, filesize } = data;
                                                                            return (
                                                                                <div className="file-atc-box" key={index}>
                                                                                    {
                                                                                        filename.match(/.(jpg|jpeg|png|gif|svg)$/i) ?
                                                                                            <div className="file-image"> <img src={fileimage} alt="" /></div> :
                                                                                            <div className="file-image"><i className="far fa-file-alt"></i></div>
                                                                                    }
                                                                                    <div className="file-detail">
                                                                                        <h6>{filename}</h6>
                                                                                        <p><span>Size : {filesize}</span><span className="ml-3">Modified Time : {datetime}</span></p>
                                                                                        <div className="file-actions">
                                                                                            <button className="file-action-btn" onClick={() => DeleteFile(id)}>Delete</button>
                                                                                            <a href={fileimage} className="file-action-btn" download={filename}>Download</a>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        })
                                                                    }
                                                                </div>
                                                                :
                                                                ''
                                                        } */}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default AddEditSupportTicket;
