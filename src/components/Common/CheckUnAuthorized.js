
import appRoutes from '../../configs/AppRoutes';
import { toast } from 'react-toastify';
export const CheckUnAuthorized = ({error, navigate, dispatch, callCommonAction}) => {
	console.log('CheckUnAuthorized error', error)
	toast.error(error.response.statusText)
	dispatch(callCommonAction({ loading: false }));	
	if (error.response !== undefined && error.response.data.message === 'Unauthenticated.') {
		dispatch(callCommonAction({ isLoggedIn: false, user: {}, token: null }));
		localStorage.clear();
		navigate(appRoutes.loginRoute);
	}
}