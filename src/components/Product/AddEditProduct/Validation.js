import STRINGS from '../../../common/strings/strings'

export function validateProductFormData(fieldName, product_id, data, description, product_images, categories, shippingPriceFieldVisibility, address) {
	//console.log('field name => ', fieldName)
	//console.log('categories => ', categories)
	let error = {};
	if(product_id === undefined && product_images.length > 0 && (fieldName == 'product_image' || fieldName == '')){
		const MIN_FILE_SIZE = 0.01 // 1MB
		const MAX_FILE_SIZE = 4 // 5MB
		product_images.map((file) => {
			const fileSizeKiloBytes = ((file.size) / 1024 / 1024)
			if (fileSizeKiloBytes > MAX_FILE_SIZE || fileSizeKiloBytes < MIN_FILE_SIZE) {
				error.product_images = "Each image size must be between of 10KB to 4MB";
			}
		})
	}

	if (product_id === undefined && product_images.length === 0 && (fieldName == 'product_image' || fieldName == '')){
		error.product_images = STRINGS.product.imageReq;
	}else{
		if(product_images.length > 6 ){
			error.product_images = STRINGS.product.imageMaxReq;
		}
	}
	if (data.title === "" && (fieldName == 'title' || fieldName == ''))
		error.title = STRINGS.product.titleReq;

	if (description === false && (fieldName == 'description' || fieldName == ''))
		error.description = STRINGS.product.descriptionReq;

	if (address == "" && (fieldName == 'address' || fieldName == ''))
		error.address = STRINGS.product.addressReq;

	if ((data.price === "" || data.price == '0' || data.price == '0.00') && (fieldName == 'price' || fieldName == ''))
		error.price = STRINGS.product.priceReq;

	// if ((data.quantity === "" || data.quantity == '0') && (fieldName == 'quantity' || fieldName == ''))
	// 	error.quantity = STRINGS.product.quantityReq;

	if (categories.length == '0' && (fieldName == 'categories' || fieldName == ''))
		error.category_id = STRINGS.product.categoryReq;

	if (data.delivery_method === "" && (fieldName == 'delivery_method' || fieldName == ''))
		error.delivery_method = STRINGS.product.deliveryMethodReq;

	if (data.delivery_time === "" && (fieldName == 'delivery_time' || fieldName == ''))
		error.delivery_time = STRINGS.product.deliveryTimeReq;

	if (data.item_type === "" && (fieldName == 'item_type' || fieldName == ''))
		error.item_type = STRINGS.product.itemTypeReq;

	if (data.status === "")
		error.status = STRINGS.product.statusReq;

	if (shippingPriceFieldVisibility === 'd-block') {

		if ((data.delivery_price === '' || data.delivery_price == '0')  && (fieldName == 'delivery_price' || fieldName == '')) {
			error.delivery_price = STRINGS.product.deliveryPrice;
		}
	}
	return error
}

export function prepareProductSubmitData(prod_id, productDetail, product_images, categories, description, prodTags,videoFiles) {

	const { title, quantity, delivery_method, delivery_price, item_type, price, tags, status, game, delivery_time, address, lat, lng } = productDetail;
	const formData = new FormData();
	const catIds = categories.map(item => item.value);

	if (product_images.length > 0)
		product_images.forEach(item => { formData.append(`images[]`, item) });

	if(videoFiles.length > 0)
		videoFiles.forEach(item => { formData.append(`video_files[]`, item) });


	formData.append('title', title);
	formData.append('description', description);
	formData.append('quantity', quantity);
	formData.append('delivery_method', parseInt(delivery_method));
	formData.append('delivery_price', delivery_price);
	formData.append('item_type', parseInt(item_type));
	formData.append('price', price);
	formData.append('status', status);
	formData.append('game', game);
	formData.append('address', address);
	formData.append('lat', lat);
	formData.append('lng', lng);
	formData.append('tags', JSON.stringify(prodTags));
	formData.append('delivery_time', delivery_time);
	formData.append('item_id', prod_id != undefined ? prod_id : 0);
	formData.append('category_id', catIds);
	return formData
}