import React, { useEffect } from 'react';
import classnames from 'classnames';
import { usePagination, DOTS } from './usePagination';
import { faAngleLeft, faAngleRight, faCircleArrowLeft, faCircleArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Pagination = props => {
	const { onPageChange, totalCount, siblingCount = 1, currentPage, pageSize, className } = props;
	const paginationRange = usePagination({ currentPage, totalCount, siblingCount, pageSize });

	useEffect(() => {
		//console.log('pr',paginationRange)
	})

	if (currentPage === 0 || paginationRange.length < 2) {
		return null;
	}


	const onNext = () => {
		onPageChange(currentPage + 1);
	};

	const onPrevious = () => {
		onPageChange(currentPage - 1);
	};

	let lastPage = paginationRange[paginationRange.length - 1];

	return (
		<ul className='pagination justify-content-end mt-3' >
			{currentPage === 1 ?
				<li className='page-item disabled'>
					<a className="page-link"><FontAwesomeIcon icon={faAngleLeft} /></a>
				</li>
				:
				<li className='page-item' onClick={onPrevious}>
					<a className="page-link"><FontAwesomeIcon icon={faAngleLeft} /></a>
				</li>
			}

			{paginationRange.map(pageNumber => {
				if (pageNumber === DOTS) {
					return <li className="page-item dots" key={pageNumber}><a className="page-link">&#8230;</a></li>;
				}
				return (
					<li className={classnames('page-item', { active: pageNumber === currentPage })} onClick={() => onPageChange(pageNumber)} key={pageNumber}>
						<a className="page-link">{pageNumber}</a>
					</li>
				);
			})}

			{currentPage == lastPage ?
				<li className='page-item disabled'>
					<a className="page-link"><FontAwesomeIcon icon={faAngleRight} /></a>
				</li>
				:
				<li className='page-item' onClick={onNext}>
					<a className="page-link"><FontAwesomeIcon icon={faAngleRight} /></a>
				</li>
			}
		</ul>
	);
};

export default Pagination;