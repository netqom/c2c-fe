import SweetAlert from 'react-bootstrap-sweetalert';

const Alerts = {

	confirmDelete: function (selected_id, callback) {
		return (<SweetAlert
			warning
			showCancel
			confirmBtnText="Yes, delete it!"
			cancelBtnBsStyle="secondary"
			confirmBtnBsStyle="danger"
			title="Are you sure?"
			onConfirm={() => callback(selected_id)}
			onCancel={() => callback(0)}
			focusCancelBtn
			btnSize='sm'
			imageHeight='60px!important'
			imageWidth='60px!important'
			customClass='swal-style icon-class'
		>
			You will not be able to recover this data!
		</SweetAlert>);
	},
	showMessage: function (message) {
		return (<SweetAlert
			info
			focusCancelBtn
			title="This is required"
		>
			{message}
		</SweetAlert>);
	},
	verifyPaypalEmail: function (callback) {
		return (<SweetAlert
			info
			focusCancelBtn
			title="Alert"
			onConfirm={() => callback()}
		>
			{"Your Paypal email is not verified. Pleasse verify it from profile screen first."}
		</SweetAlert>);

	},
	confirmationPopup: function (selected_id, callback, title, chat_id) {
		return (<SweetAlert
			warning
			showCancel
			confirmBtnText="Yes"
			cancelBtnBsStyle="secondary"
			confirmBtnBsStyle="success"
			title={title}
			onConfirm={() => callback(selected_id,chat_id)}
			onCancel={() => callback(0)}
			focusCancelBtn
			btnSize='sm'
			imageHeight='60px!important'
			imageWidth='60px!important'
			customClass='swal-style icon-class'
		>
		</SweetAlert>);
	},
}

export default Alerts;