import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'
import { callCommonAction } from '../../redux/Common/CommonReducer'
import { sendRequest } from '../../apis/APIs';
import { ContentLoading } from '../Common/ContentLoading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSuitcase, faList, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { CheckUnAuthorized } from '../Common/CheckUnAuthorized';
import Chart from "react-apexcharts";
import { Helmet } from 'react-helmet';

const Dashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const chartRef = useRef(null)
    const [chartOptions, setChartOptions] = useState({
        chart: {
            id: "basic-bar",
            height: '100%',
            width: '100%'
        },
        fill: {
            colors: ['#4e73df']
        },
        xaxis: {
            categories: []
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    position: 'top', // top, center, bottom
                },
            }
        },
        dataLabels: {
            enabled: true,
            formatter: function (val) {
                return val
            },
            offsetY: -20,
            style: {
                fontSize: '12px',
                colors: ["#304758"]
            }
        },
    });
    const [chartSeries, setChartSeries] = useState([{ name: 'product', data: [] }]);
    const [dashboardDetail, setDashboardDetail] = useState({ nbrOfProduct: 0, nbrOfOrder: 0, totalRevenue: 0, lastMonthRevenue: 0 });
    const loading = useSelector((state) => state.common.loading);

    useEffect(() => {
        callDashboardApi();
    }, []);


    // Getting the dashboard details
    const callDashboardApi = async () => {
        try {
            dispatch(callCommonAction({ loading: true }));
            const res = await sendRequest(`/dashboard`, 'POST', {});
            const unreadNotification = res.data.data.raiseNotificationBell === 0 ? false : true
            setDashboardDetail({ ...dashboardDetail, nbrOfOrder: res.data.data.numberOfOrder, nbrOfProduct: res.data.data.numberOfProduct, totalRevenue: res.data.data.totalRevenueGenerated, lastMonthRevenue: res.data.data.lastMonthRevenueGenerated })
            localStorage.setItem('categories', JSON.stringify(res.data.data.categories))
            localStorage.setItem('raiseNotificationBell', unreadNotification)
            dispatch(callCommonAction({ loading: false, categories: res.data.data.categories, raiseNotificationBell: unreadNotification }));
            dispatch(callCommonAction({ loading: false, categories: res.data.data.categories}));
            getChartData('product')
        } catch (error) {
            //console.log(error);
            CheckUnAuthorized({ error: error, dispatch: dispatch, navigate: navigate, callCommonAction: callCommonAction })
        }
    }
    // Getting the charts for all dashboard card
    const getChartData = async (chartFor, color) => {
        await sendRequest(`/get-chart-data`, 'POST', { chartFor: chartFor })
            .then((res) => {
                const response = res.data.data;
                setChartSeries([{ name: chartFor, data: response.chartData }])
                setChartOptions({ ...chartOptions, xaxis: { categories: response.chartLabel }, fill: { colors: color } })
            })
            .catch((err) => {
                console.log('err', err)
            })
    }

    return (
        <div className="content-wrapper">
            <Helmet>
                <title>Alium | Dashboard Page</title>
                <meta name="description" content="Profile Page Description Goes Here" />
                <meta name="keywords" content="Game, Entertainment, Movies" />
            </Helmet>
            <div className="container">
                {/* <div className="d-flex justify-content-between align-items-center breadcrum-container mb-3">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item active">Dashboard</li>
                    </ol>
                </div> */}
                <div className="row">
                    <div className="col-md-12 position-relative">

                        {loading ? <div className='' style={{ minHeight: '600px' }}><ContentLoading /></div> :
                            <div className="row ">
                                <div className="status-card col-xl-3 col-md-6 mb-4 pointer" onClick={() => getChartData('product', ['#4e73df'])}>
                                    <div className="card border-left-primary shadow h-100 py-2">
                                        <div className="card-body">
                                            <div className="row  align-items-center">
                                                <div className="col mr-2">
                                                    <div className="small fw-bold text-primary text-uppercase mb-1">
                                                        Products</div>
                                                    <div className="h5 mb-0 fw-bold text-opacity-25">{dashboardDetail.nbrOfProduct}</div>
                                                </div>
                                                <div className="col-auto">
                                                    <FontAwesomeIcon icon={faList} className='h3 text-primary ' />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="status-card col-xl-3 col-md-6 mb-4 pointer" onClick={() => getChartData('order_received', ['#1cc88a'])}>
                                    <div className="card border-left-success shadow h-100 py-2">
                                        <div className="card-body">
                                            <div className="row  align-items-center">
                                                <div className="col mr-2">
                                                    <div className="small fw-bold text-success text-uppercase mb-1">
                                                        Order Successfull</div>
                                                    <div className="h5 mb-0 fw-bold text-opacity-25">{dashboardDetail.nbrOfOrder}</div>
                                                </div>
                                                <div className="col-auto">
                                                    <FontAwesomeIcon icon={faSuitcase} className='h3 text-success ' />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="status-card col-xl-3 col-md-6 mb-4 pointer" onClick={() => getChartData('user_total_revenue', ['#36b9cc'])}>
                                    <div className="card border-left-info shadow h-100 py-2">
                                        <div className="card-body">
                                            <div className="row  align-items-center">
                                                <div className="col mr-2">
                                                    <div className="small fw-bold text-info text-uppercase mb-1">
                                                        Revenue</div>
                                                    <div className="h5 mb-0 fw-bold text-opacity-25">£{parseFloat(dashboardDetail.totalRevenue).toFixed(2)}</div>
                                                </div>
                                                <div className="col-auto">
                                                    <FontAwesomeIcon icon={faDollarSign} className='h3 text-info ' />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="status-card col-xl-3 col-md-6 mb-4 pointer" onClick={() => getChartData('user_last_month_revenue', ['#f6c23e'])} >
                                    <div className="card border-left-warning shadow h-100 py-2">
                                        <div className="card-body">
                                            <div className="row  align-items-center">
                                                <div className="col mr-2">
                                                    <div className="small fw-bold text-warning text-uppercase mb-1">
                                                        Last Month Revenue</div>
                                                    <div className="h5 mb-0 fw-bold text-opacity-25">£{parseFloat(dashboardDetail.lastMonthRevenue).toFixed(2)}</div>
                                                </div>
                                                <div className="col-auto">
                                                    <FontAwesomeIcon icon={faDollarSign} className='h3 text-warning ' />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                    <div className="mixed-chart ps-0">
                        <Chart
                            ref={chartRef}
                            options={chartOptions}
                            series={chartSeries}
                            type="bar"
                            height="400"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Dashboard;
