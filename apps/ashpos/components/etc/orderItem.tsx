import { useEffect, useState } from "react";
import ProductCategory from "./productCategory";
import { truncateToTwoDecimals, setFourDecimals } from "@/lib/utils";
import { FaBarcode } from "react-icons/fa";
import CopyButton from "./copyButton";
import { useOrderAmountInfoQuery } from "@/src/__generated__/operations";
import Decimal from 'decimal.js';  

export default function OrderItems({ orderItemData, taxSum }: any) {
    const [loyaltyPoints, setLoyaltyPoints] = useState(0);
    // console.log('orderItemData', orderItemData);

    const orderAmountInfo = useOrderAmountInfoQuery({id: orderItemData?.id})
    const orderAmountInfoData = orderAmountInfo?.data?.orderAmountInfo
    // console.log('orderAmountInfoData', orderAmountInfoData)
    // const cashAmount = setFourDecimals(orderItemData?.cashAmount || 0)
    // const otherAmount = setFourDecimals(orderItemData?.otherAmount || 0)
    // const changeDue = setFourDecimals(orderItemData?.changeDue || 0)
    // const discount = setFourDecimals(orderItemData?.discount || 0)
    // const loyalty = setFourDecimals(orderItemData?.loyalty || 0)
    // const tax = setFourDecimals(orderItemData?.tax || 0);

    // const grandTotal = setFourDecimals(cashAmount + otherAmount - changeDue)
    // const netTotal = setFourDecimals(grandTotal - tax)
    // const subTotal = setFourDecimals(grandTotal + discount)

    // const totalResult = {
    //     cashAmount,
    //     otherAmount,
    //     changeDue,
    //     discount,
    //     loyalty,
    //     tax,
    //     grandTotal,
    //     netTotal,
    //     subTotal
    // }

    // console.log("***** Total Result ********" , totalResult)

    useEffect(() => {
        if (orderItemData?.LoyaltyHistory.length > 0) {
            orderItemData?.LoyaltyHistory?.map((item: any) => {
                if(item.txType == "earn"){
                    setLoyaltyPoints(Number(truncateToTwoDecimals(item.value)))
                }
            })
        }
    }, [orderItemData])

    return (
        <div className="mx-auto bg-white text-dark dark-text-white-dark dark:text-inherit dark:bg-[#0f1727] rounded-lg shadow p-6 border-[1px] border-gray-200 dark:border-[#1a1e3b]">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Order Items</h2>
                {/* <button className="text-sm text-gray-600 dark:text-inherit border rounded-md px-3 py-1.5 hover:bg-gray-50 dark:bg-[#1c2942] hover:dark:bg-[#293d61] dark:border-[#1a1e3b]">
                    ⚡ Change Payment Type
                </button> */}
            </div>

            {/* Order Items */}
            <div className="mb-6 ">
                {orderItemData?.OrderItem?.length > 0 ? (
                    orderItemData?.OrderItem?.map((item: any, index: number) => (
                        <div className="mt-4 border-t-[1px] pt-2 border-gray-200 dark:border-[#1a1e3b]">
                            <OrderItem key={index} item={item} />
                        </div>
                    ))
                ) : (
                    <div>There is no order items</div>
                )}
            </div>

            {/* Calculations */}
            <div className="space-y-2 border-t dark:border-[#1a1e3b]  pt-4">
                {/* Loyalty Points */}
                <div className="flex justify-between mb-4 text-sm">
                    <p>Loyalty Points Earned</p>
                    <p>{loyaltyPoints.toFixed(0)}</p>
                </div>
                <div className="flex justify-between">
                    <p>Subtotal</p>
                    <p>${(orderAmountInfoData?.subTotal)}</p>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between">
                        <p>Tax</p>
                        <p>${(orderAmountInfoData?.tax)}</p>
                    </div>
                    {/* <div className="flex justify-between text-sm text-gray-600 pl-4">
                        <p>Cannabis Tax - VERIFY - 7%</p>
                        <p>${0}</p>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 pl-4">
                        <p>Sales Tax - VERIFY - 10.75%</p>
                        <p>${0}</p>
                    </div> */}
                </div>

                <div className="flex justify-between">
                    <p>Discount</p>
                    <p>-${(orderAmountInfoData?.discount)}</p>
                </div>

                <div className="flex justify-between font-medium">
                    <p>Net Total</p>
                    <p>${(orderAmountInfoData?.netTotal)}</p>
                </div>

                <div className="flex justify-between font-bold">
                    <p>Total</p>
                    <p>${(orderAmountInfoData?.total)}</p>
                </div>
            </div>

            {/* Payments */}
            <div className="border-t dark:border-[#1a1e3b] mt-4 pt-4 space-y-2">
                <h3 className="font-medium mb-2">Payments</h3>
                <div className="flex justify-between">
                    <p>Cash</p>
                    <p>${(orderAmountInfoData?.cash || 0)}</p>
                </div>
                <div className="flex justify-between">
                    <p>Other</p>
                    <p>${(orderAmountInfoData?.other || 0)}</p>
                </div>
            </div>

            {/* Totals */}
            <div className="border-t dark:border-[#1a1e3b] mt-4 pt-4 space-y-2">
                <div className="flex justify-between font-medium">
                    <p>Total Amount Received</p>
                    <p>${(Number(orderAmountInfoData?.cash) + Number(orderAmountInfoData?.other)).toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                    <p>Change Due</p>
                    <p>${(orderAmountInfoData?.changeDue || 0)}</p>
                </div>
            </div>
        </div>
    );
}

const OrderItem = ({ item }: { item: { product: any; quantity: number; productId: string; packageLabel: string; TaxHistory: any } }) => {
    const { product, quantity, productId, TaxHistory, packageLabel } = item;
    return (
        <div className="flex flex-col">
            <div className="flex justify-between mb-2">
                <div className="flex items-start justify-start">
                    <div className="flex flex-col justify-start">
                        <ProductCategory name={product?.itemCategory?.name} color={product?.itemCategory?.color} />
                        <div className="flex justify-start items-center text-sm font-gray-500 ml-1">
                            <FaBarcode className='mr-1'/>
                            {packageLabel.slice(-10).toUpperCase()}
                            <CopyButton 
                                text={packageLabel.slice(-10).toUpperCase()}
                                className=""
                            />
                        </div>
                    </div>
                    <div className="flex flex-col justify-start ml-2 mt-1">
                        <p className="font-medium">{product?.name}</p>
                        <div className="flex flex-col justify-start">
                            <p className="text-sm text-dark dark-text-white-dark">
                                ({quantity} {product?.productUnitOfMeasure})
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex">
                    <p className="font-medium">${truncateToTwoDecimals(product?.price || 0)}</p>
                </div>
            </div>
            {TaxHistory && TaxHistory.length > 0 ? (
                <div className="flex flex-col justify-center">
                    <span>Tax history</span>
                    {TaxHistory.map((tax: any, index: any) => {
                        if (tax?.taxAmount === 0) return null;
                        return (
                            <div key={index} className="flex justify-between items-center text-sm text-gray-600 pl-4 w-full">
                                <p>
                                    {tax?.taxName} - {truncateToTwoDecimals(tax?.taxPercent || 0)}%
                                </p>
                                <p>${truncateToTwoDecimals(tax?.taxAmount || 0)}</p>
                            </div>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
};
