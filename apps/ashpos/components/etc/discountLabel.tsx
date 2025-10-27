import React from 'react';
import Dropdown from '../dropdown';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { FaRegTimesCircle } from 'react-icons/fa';
import { useCancelDiscountForOrderMutation } from '@/src/__generated__/operations';
import warnAlert from '../notification/warnAlert';
import successAlert from '../notification/successAlert';
import Swal from 'sweetalert2';
interface DiscountLabelProps {
    discount: number;
    orderId: String;
}

const DiscountLabel: React.FC<any> = ({ discountData, orderId }) => {
    console.log('DiscountLabel DiscountData', discountData);
    const cancelDiscountMutation = useCancelDiscountForOrderMutation();
    const handleCacelDiscount = async () => {
        Swal.fire({
            icon: 'warning',
            title: 'Cancel Discount?',
            text: 'Are you going to really Cancel?',
            showCancelButton: true,
            confirmButtonText: 'Sure',
            padding: '2em',
            customClass: 'sweet-alerts sweet-alerts dark:bg-[#1b2e4b] dark:text-white',
        }).then(async (result) => {
            if (result.value) {
                await cancelDiscountMutation.mutate(
                    {
                        orderId: orderId,
                    },
                    {
                        onError(error) {
                            warnAlert(error.message);
                        },
                        onSuccess(data) {
                            if (!data) return;
                            successAlert('Discount Canceled Successfully!');
                        },
                    }
                );
            }
        });
    };
    return (
        <div className="inline-flex items-center justify-center text-xs">
            {/* <span className="mr-1">-{discount}%</span> */}
            <div className="dropdown">
                <Dropdown
                    placement={`${'bottom-end'}`}
                    btnClassName="dropdown-toggle flex justify-between items-center px-2 py-1 font-bold rounded border border-theme_green text-theme_green shadow-none hover:bg-theme_green hover:text-white"
                    button={
                        <>
                            000
                            <span>
                                <MdKeyboardArrowDown className="ml-S" />
                            </span>
                        </>
                    }
                >
                    <ul className="!min-w-[170px]">
                        {discountData?.map((item: any, key: any) => (
                            <li key={key}>
                                <div className="flex justify-between items-center px-4 py-2 text-gray-700 dark:text-inherit hover:bg-gray-100 hover:text-primary dark:hover:bg-primary/10">
                                    <div className="flex flex-col w-full items-center mr-5">
                                        <span className="text-lg text-nowrap">{item?.discountName}</span>
                                        <div className="flex justify-between items-center">
                                            <span className="text-md mr-2">{item?.discountMethod} </span>
                                            {item?.discountMethod == 'BYPERCENT' ? '' : '$'}
                                            <span>{item?.value}</span>
                                            {item?.discountMethod == 'BYPERCENT' ? '%' : ''}
                                        </div>
                                    </div>
                                    <FaRegTimesCircle className="text-warning text-xl cursor-pointer" onClick={() => handleCacelDiscount()} />
                                </div>
                            </li>
                        ))}
                    </ul>
                </Dropdown>
            </div>
        </div>
    );
};

export default DiscountLabel;
