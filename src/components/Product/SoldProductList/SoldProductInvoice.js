import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { callCommonAction } from '../../../redux/Common/CommonReducer';
import { useState } from 'react';
import { CheckUnAuthorized } from '../../Common/CheckUnAuthorized';
import { sendRequest } from '../../../apis/APIs';
import moment from 'moment';
import { PDFDownloadLink, Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import batman from '../../../assets/images/cat-man.png';

// Create styles
const styles = StyleSheet.create({
    page: {
        padding: '20px',
        backgroundColor: '#061c6c',
        border: '1px solid #1d4d9d',
        borderRadius: '8px',
        color: '#d2dff4',
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1
    },
    row: {
        display: 'flex',
        flexDirection: "row",
        width: '100%',
    },
    col6: {
        paddingHorizontal: '10px',
        flex: 1,
    },
    strong: {
        fontSize: '12px',
        fontWeight: 'bold'
    },
    twenty: {
        fontSize: '16px',
        marginBottom: '8px'
    },
    minText: {
        fontSize: '12px',
        marginBottom: '5px',
        fontWeight: 'normal'
    },
    rightText: {
        textAlign: 'right'
    },
    table: {
        display: "table",
        width: "auto",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: '#1d4d9d',
        borderRightWidth: 0,
        borderBottomWidth: 0
    },
    tableRow: {
        margin: "auto",
        flexDirection: "row"
    },
    tableCol: {
        width: "16.666%",
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderColor: '#1d4d9d',
        padding: '5px'
    },
    tableProduct: {
        width: '50%'
    },
    tableCell: {
        margin: "auto",
        marginTop: 5,
        fontSize: 10
    },
    th: {
        color: '#fff',
        fontSize: '13px',
    },
    footer: {
        marginTop: '20px'
    },
    footerText: {
        backgroundColor: '#0d6efd',
        textAlign: 'right',
        padding: '10px'
    },
    downloadBtn: {
        position: 'absolute',
        margin: '8px auto 0px',
        right: '0',
        left: '0',
        display: 'inline-block',
        textAlign: 'center',
    }

    
});
const DownloadSoldProductInvoice = ({ soldProductDetail, imageUrl }) => {
    const checkLength = () => soldProductDetail.hasOwnProperty('id') ? true : false;
    return (
        // Create Document Component
        <Document>
            <Page size="A4" style={styles.page}>
                <View>
                    <View className='invoice-wrap'>
                        <View className='invoice-body px-md-4'>
                            <View style={styles.row}>
                                <View style={styles.col6}>
                                    <Text style={styles.twenty}>Bill TO:</Text>
                                    <Text style={styles.minText}>{checkLength() ? soldProductDetail.user.name : ''}</Text>
                                    <Text style={styles.minText}>{checkLength() ? soldProductDetail.user.address : ''}</Text>
                                    <Text style={styles.minText}>{checkLength() ? soldProductDetail.user.phone : '(000) (000) (0000)'}</Text>
                                    <Text style={styles.minText}>{checkLength() ? soldProductDetail.user.zipcode : 'Not given'}</Text>
                                </View>
                                <View style={[styles.rightText, styles.col6]}>
                                    <Text style={[styles.twenty, styles.rightText]}>INVOICE #</Text>
                                    <Text style={styles.minText}>{checkLength() ? soldProductDetail.uuid : '##########'}</Text>
                                    <Text style={[styles.minText, styles.strong]}>DATE</Text>
                                    <Text style={styles.minText}>{checkLength() ? moment(soldProductDetail.created_at).format('MMMM Do YYYY, h:mm:ss a') : '##########'}</Text>
                                </View>
                            </View>
                            <View style={{ height: '0.5px', backgroundColor: '#1d4d9d', marginTop: '10px', marginBottom: '20px' }}></View>

                            <View className='row mt-4'>
                                <View style={styles.table}>
                                    <View style={styles.tableRow}>
                                        <View style={[styles.tableCol, styles.tableProduct]}>
                                            <Text style={[styles.tableCell, styles.th]}>PRODUCT</Text>
                                        </View>
                                        <View style={styles.tableCol}>
                                            <Text style={[styles.tableCell, styles.th]}>PRICE</Text>
                                        </View>
                                        <View style={styles.tableCol}>
                                            <Text style={[styles.tableCell, styles.th]}>Shipping</Text>
                                        </View>
                                        <View style={styles.tableCol}>
                                            <Text style={[styles.tableCell, styles.th]}>AMOUNT</Text>
                                        </View>

                                    </View>
                                    <View style={styles.tableRow}>
                                        <View style={[styles.tableCol, styles.tableProduct]}>
                                            <View>
                                                <Image style={{width: '80px', height: '80px',objectFit: 'cover', margin: 'auto'}} src={{ uri: imageUrl ? imageUrl : batman, method: "GET", headers: { "Cache-Control": "no-cache" }, body: "" }} width="100" height="100" />
                                            </View>
                                            <View style={[styles.tableCell, styles.minText]}>
                                                <Text>{checkLength() ? soldProductDetail.product.title : ''}</Text>
                                                {checkLength() ? <View className="desc-content" dangerouslySetInnerHTML={{ __html: soldProductDetail.product.description }} /> : ''}
                                            </View>
                                        </View>
                                        <View style={styles.tableCol}>
                                            <Text style={[styles.tableCell, styles.minText]}><Text>£</Text>{soldProductDetail.price}</Text>
                                        </View>
                                        <View style={styles.tableCol}>
                                            <Text style={[styles.tableCell, styles.minText]}>{soldProductDetail.delivery_price.toFixed(2)}</Text>
                                        </View>
                                        <View style={styles.tableCol}>
                                            <Text style={[styles.tableCell, styles.minText]}><Text>£</Text>{soldProductDetail.amount}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={[styles.row, styles.footer]}>
                            <View style={styles.col6}></View>
                            <View style={styles.col6}></View>
                            <View style={[styles.col6, styles.footerText]}>
                                <Text style={styles.minText}>TOTAL</Text>
                                <Text style={styles.twenty}><Text>£</Text>{soldProductDetail.amount}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    )
}


const SoldProductInvoice = () => {

    const [soldProductDetail, setSoldProductDetail] = useState({});
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading } = useSelector((state) => state.common)
    const { uuid } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    useEffect(() => { callSoldProductApi() }, []);

    /** Get Detaail Of Sold Product */
    const callSoldProductApi = async () => {
        try {
            dispatch(callCommonAction({ loading: true }));
            const res = await sendRequest(`/sold-product-detail`, 'POST', { uuid: uuid });
            console.log(`ddd`,res)
            setSoldProductDetail(res.data.data);
            setImageUrl(res.data.data.product.display_path_base64)
            dispatch(callCommonAction({ loading: false }));
        } catch (error) {
            console.log(`error`,error)
            CheckUnAuthorized({ error: error, dispatch: dispatch, navigate: navigate, callCommonAction: callCommonAction })
        }
    }

    const checkLength = () => soldProductDetail.hasOwnProperty('id') ? true : false;

    return (
        <div className="content-wrapper">
            {checkLength() ?
                <div className='position-relative' >
                    <PDFDownloadLink
                        document={
                            <DownloadSoldProductInvoice
                                soldProductDetail={soldProductDetail}
                                imageUrl={imageUrl}
                            />
                        }
                        fileName="invoice.pdf"
                        style={styles.downloadBtn}
                    >
                        {({ blob, url, loading, error }) =>
                            loading ? 'Loading document...' : <button className="btn-download btn btn-primary btn-sm"><i className="fa fa-download"></i> <span className="d-md-inline-block d-none">Download Pdf</span></button>
                        }

                    </PDFDownloadLink>
                </div>
                :
                null
            }
            <div className="container">
                <div className='invoice-wrap'>
                    <div className='invoice-body px-md-4'>
                        <div className='row'>
                            <div className='col-6 invoice-billto'>
                                <h5>Bill TO:</h5>
                                <p style={{ textTransform: 'capitalize' }}>{checkLength() ? soldProductDetail.user.name : ''}</p>
                                <p style={{ textTransform: 'capitalize' }}>{checkLength() ? soldProductDetail.user.address : ''}</p>
                                <p>{checkLength() ? soldProductDetail.user.phone : '(000) (000) (0000)'}</p>
                                <p>{checkLength() ? soldProductDetail.user.zipcode : 'Not given'}</p>
                            </div>
                            <div className='col-6 invoice-info text-end'>
                                <h5><strong>INVOICE #</strong></h5>
                                <p>{checkLength() ? soldProductDetail.uuid : '##########'}</p>
                                <div>
                                    <strong className='d-block'>DATE</strong>
                                    {checkLength() ? moment(soldProductDetail.created_at).format('MMMM Do YYYY, h:mm:ss a') : '##########'}
                                </div>
                            </div>
                        </div>
                        <hr />
                        <div className='row mt-4'>
                            <div className='table-responsive'>
                                <table className="table table-bordered" width="100%" cellpacing="0">
                                    <thead>
                                        <tr>
                                            <th>PRODUCT</th>
                                            <th className=' text-end'>QUANTITY</th>
                                            <th className=' text-end'>PRICE</th>
                                            <th className=' text-end'>Shipping</th>
                                            <th className=' text-end'>AMOUNT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className='py-3'>
                                                <div className='d-flex invoice-product-item'>
                                                    <div className='mb-3 me-3'>
                                                        <img src={checkLength() ? soldProductDetail.product.display_path : ''} alt='' title='' />
                                                    </div>
                                                    <div className=''>
                                                        <h5>{checkLength() ? soldProductDetail.product.title : ''}</h5>
                                                        <p>{checkLength() ? <div className="desc-content" dangerouslySetInnerHTML={{ __html: soldProductDetail.product.description }} /> : ''}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className=' text-end'>1</td>
                                            <td className=' text-end'><strong>£</strong>{checkLength() ? soldProductDetail.price : 0.00}</td>
                                            <td className=' text-end'><strong>£</strong>{checkLength() ? soldProductDetail.delivery_price.toFixed(2) 
                                            : 0.00}</td>
                                            <td className=' text-end'><strong>£</strong>{soldProductDetail.amount}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className='invoice-footer mt-3 mb-3 px-4'>
                        <div className='row'>
                            <div className='col-md-8 p-4 order-1 order-md-0'>
                            {/* <div className='bg-purple col-md-8 p-4 order-1 order-md-0'> */}
                                {/* <p className='mb-0'><strong>Note:</strong></p>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ut nisi tempus massa blandit luctus.</p> */}
                            </div>
                            <div className='bg-primary col-md-4 p-4 text-end order-0 order-md-1'>
                                <p className='fw-bold mb-0 small'>TOTAL</p>
                                <h2 className='display3'><strong>£</strong>{soldProductDetail.amount}</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SoldProductInvoice;
