'use client';
import PanelCodeHighlight from '@/components/panel-code-highlight';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import successAlert from '@/components/notification/successAlert';
import { stateOfUsaData } from '@/store/stateOfUsa';

import { Formik, Form, Field, FieldProps } from 'formik';
import * as Yup from 'yup';
import warnAlert from '@/components/notification/warnAlert';
import MaskedInput from 'react-text-mask';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import '@/styles/flatpickr-dark.css';
import { IRootState } from '@/store';
import { useDispensaryQuery, useUpdateDispensaryMutation } from '@/src/__generated__/operations';
import { useQueryClient } from '@tanstack/react-query';
import { userDataSave } from '@/store/userData';
import { useSelector } from 'react-redux';
import CustomSelect from '@/components/etc/customeSelect';

const PageContent = () => {
    const { userData } = userDataSave();
    const dispensaryId = userData.dispensaryId;
    const queryClient = useQueryClient();
    const dispensary = useDispensaryQuery({ id: dispensaryId });
    const updateDispensaryMutation = useUpdateDispensaryMutation();
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const [customOptions, setCustomOptions] = useState<any>([])
    const [currentStats, setCurrentStats] = useState("")

    const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(false);
    const [currentDispensary, setCurrentDispensary] = useState<any>(dispensary.data?.dispensary);

    const Timezones = [
        { value: "AKST", displayName: "Alaska Standard Time" },
        { value: "CST", displayName: "Central Standard Time" },
        { value: "EST", displayName: "Eastern Standard Time" },
        { value: "HAST", displayName: "Hawaii-Aleutian Standard Time" },
        { value: "MST", displayName: "Mountain Standard Time" },
        { value: "PST", displayName: "Pacific Standard Time" }
      ]

    useEffect(() => {
        if (!currentDispensary) setCurrentDispensary(dispensary.data?.dispensary);
    }, [dispensary]);

    const handleUpdateDispensary = async (currentDispensaryInput: any) => {
        await updateDispensaryMutation.mutate(
            {
                input: {
                    id: dispensaryId,
                    name: currentDispensaryInput.name,
                    dispensaryType: currentDispensary.dispensaryType,
                    cannabisLicense: currentDispensary.cannabisLicense,
                    cannabisLicenseExpireDate: currentDispensary.cannabisLicenseExpireDate,
                    businessLicense: currentDispensary.businessLicense.toUpperCase(),
                    phone: currentDispensaryInput.phone,
                    email: currentDispensaryInput.email,
                    locationAddress: currentDispensaryInput.locationAddress,
                    locationCity: currentDispensaryInput.locationCity,
                    locationState: currentDispensary.locationState,
                    locationZipCode: currentDispensaryInput.locationZipCode,
                    storeTimeZone: currentDispensary.storeTimeZone,
                    isCustomerAgeVerify: currentDispensary.isCustomerAgeVerify,
                    customerAgeLimit: +currentDispensary.customerAgeLimit,
                },
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    if (!data) return;
                    const refetch = async () => {
                        return await queryClient.refetchQueries(['Dispensary']);
                    };
                    refetch();
                    successAlert(currentDispensaryInput.name + ' has been updated successfully!');
                },
                onSettled() {
                    setIsSaveButtonDisabled(false);
                },
            }
        );
    };

    const submitForm = (currentDispensaryInput: any) => {
        setIsSaveButtonDisabled(true);
        handleUpdateDispensary(currentDispensaryInput);
    };

    const formSchema = Yup.object().shape({
        name: Yup.string().required('Please fill the name'),
        phone: Yup.string().required('Please fill the phone'),
        email: Yup.string().required('Please fill the email'),
        locationAddress: Yup.string().required('Please fill the locationAddress'),
        locationCity: Yup.string().required('Please fill the locationCity'),
        locationState: Yup.string().required('Please fill the locationState'),
        locationZipCode: Yup.string().required('Please fill the locationZipCode'),
        cannabisLicenseExpireDate: Yup.string().required('Please fill the cannabisLicenseExpireDate'),

    });

    const handleStatsChange = (value: any) => {
        setCurrentDispensary({ ...currentDispensary, locationState: value });
        const statsName = stateOfUsaData.find((item) => item.value == value)?.label
        setCurrentStats(statsName || "")
    }

    useEffect(() => {
        const statsName = stateOfUsaData.find((item) => item.value == currentDispensary?.locationState)?.label
        setCurrentStats(statsName || "")
    },[currentDispensary?.locationState])

    if (currentDispensary)
        return (
            <div>
                {/* <ul className="flex space-x-2 rtl:space-x-reverse">
                    <li>
                        <Link href="#" className="text-primary hover:underline">
                            Setting
                        </Link>
                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <span>Store</span>
                    </li>
                </ul> */}
                <div className="grid grid-cols-1 gap-6 pt-5">
                    <Formik
                        initialValues={{
                            name: currentDispensary.name,
                            cannabisLicenseExpireDate: currentDispensary.cannabisLicenseExpireDate,
                            phone: currentDispensary.phone,
                            email: currentDispensary.email,
                            locationAddress: currentDispensary.locationAddress,
                            locationCity: currentDispensary.locationCity,
                            locationState: currentDispensary.locationState,
                            locationZipCode: currentDispensary.locationZipCode,

                        }}
                        validationSchema={formSchema}
                        onSubmit={() => {
                            // props.modalMode === "new" ? handleCreateOrganization() : handleUpdateOrganization()
                        }}
                    >
                        {({ errors, submitCount, touched, values, handleChange, handleBlur }) => (
                            <Form className="space-y-5">
                                <PanelCodeHighlight title="Store Details">
                                    <div className="mb-5 space-y-5">
                                        <div className={`flex flex-col sm:flex-row gap-6 items-center ${submitCount ? (errors.name ? 'has-error' : '') : ''}`}>
                                            <label htmlFor="name" className="relative pt-1 lg:text-right mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                Store Name
                                                <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                            </label>
                                            <Field id="name" name="name" type="text" placeholder="Enter Store Name" className="form-input flex-1"/>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-6">
                                            <label className="pt-1 lg:text-right rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">Store Type</label>
                                            <div className="flex-1">
                                                <div className="mb-2">
                                                    <label className="mt-1 inline-flex cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="dispensaryType"
                                                            className="form-radio text-dark dark:text-white-dark"
                                                            value="MED"
                                                            checked={currentDispensary.dispensaryType === 'MED' ? true : false}
                                                            disabled
                                                        />
                                                        <span className="text-white-dark">Medical</span>
                                                    </label>
                                                </div>
                                                <div className="mb-2">
                                                    <label className="mt-1 inline-flex cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="dispensaryType"
                                                            className="form-radio"
                                                            value="REC"
                                                            checked={currentDispensary.dispensaryType === 'REC' ? true : false}
                                                            disabled
                                                        />
                                                        <span className="text-white-dark">Recreational</span>
                                                    </label>
                                                </div>
                                                <div>
                                                    <label className="mt-1 inline-flex">
                                                        <input
                                                            type="radio"
                                                            name="dispensaryType"
                                                            className="form-radio"
                                                            value="MEDREC"
                                                            checked={currentDispensary.dispensaryType === 'MEDREC' ? true : false}
                                                            disabled
                                                        />
                                                        <span className="text-white-dark">Med/Rec</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-6 items-center">
                                            <label htmlFor="cannabisLicense" className="pt-1 lg:text-right mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                Cannabis License
                                            </label>
                                            <input
                                                id="cannabisLicense"
                                                type="text"
                                                placeholder="Enter Cannabis License"
                                                className="uppercase form-input flex-1 disabled:pointer-events-none disabled:bg-[#eee] dark:disabled:bg-[#1b2e4b] cursor-not-allowed"
                                                value={currentDispensary.cannabisLicense}
                                                disabled
                                            />
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-6 items-center">
                                            <label htmlFor="cannabisLicense" className="relative pt-1 lg:text-right mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                Cannabis License Expire Date
                                                <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                            </label>
                                            <Flatpickr
                                                id="cannabisLicenseExpireDate"
                                                name='cannabisLicenseExpireDate'
                                                value={currentDispensary.cannabisLicenseExpireDate}
                                                options={{
                                                    dateFormat: 'm/d/Y',
                                                    position: isRtl ? 'auto right' : 'auto left',
                                                }}
                                                className={`form-input flex-1 ${!currentDispensary.cannabisLicenseExpireDate ? "!border-[#e7515a] !bg-[#e7515a14] " : ""}`}
                                                onChange={(date) => {
                                                    setCurrentDispensary({ ...currentDispensary, cannabisLicenseExpireDate: date[0] });
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-6 items-center">
                                            <label htmlFor="businessLicense" className="pt-1 lg:text-right mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                Business License
                                            </label>
                                            <input
                                                id="businessLicense"
                                                type="text"
                                                placeholder="Enter Business License"
                                                className="form-input flex-1 uppercase"
                                                value={currentDispensary.businessLicense}
                                                onChange={(e: any) => {
                                                    setCurrentDispensary({ ...currentDispensary, businessLicense: e.target.value });
                                                }}
                                            />
                                        </div>
                                        <div className={`flex flex-col sm:flex-row gap-6 items-center ${submitCount ? (errors.phone ? 'has-error' : '') : ''}`}>
                                            <label htmlFor="phone" className="relative pt-1 lg:text-right mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                Phone
                                                <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                            </label>
                                            {/* <MaskedInput
                                                id="phone"
                                                type="text"
                                                placeholder="(___) ___-____"
                                                value={currentDispensary.phone}
                                                onChange={(e: any) => {
                                                    setCurrentDispensary({ ...currentDispensary, phone: e.target.value });
                                                }}
                                                className="form-input flex-1"
                                                mask={['(', /[0-9]/, /[0-9]/, /[0-9]/, ')', ' ', /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/]}
                                            /> */}
                                            <Field name="phone">
                                                {({ field }: FieldProps) => (
                                                    <MaskedInput
                                                        {...field}
                                                        id="phone"
                                                        name='phone'
                                                        type="text"
                                                        placeholder="(___) ___-____"
                                                        className="form-input flex-1"
                                                        mask={['(', /[0-9]/, /[0-9]/, /[0-9]/, ')', ' ', /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/]}
                                                    />
                                                )}
                                            </Field>
                                        </div>
                                        <div className={`flex flex-col sm:flex-row gap-6 items-center border-b border-white-light pb-8 dark:border-[#1b2e4b] ${submitCount ? (errors.email ? 'has-error' : '') : ''}`}>
                                            <label htmlFor="email" className="relative pt-1 lg:text-right mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                Email
                                                <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                            </label>
                                            <Field
                                                id="email"
                                                name="email"
                                                type="text"
                                                placeholder="Enter Store Email"
                                                className="form-input flex-1"
                                                // value={currentDispensary.email}
                                                // onChange={(e: any) => {
                                                //     setCurrentDispensary({ ...currentDispensary, email: e.target.value });
                                                // }}
                                            />
                                        </div>
                                        <h5 className="text-lg font-semibold dark:text-white-dark">Store Location</h5>
                                        <div className="flex flex-col sm:flex-row gap-6 items-center">
                                            <label htmlFor="locationAddress" className="pt-1 lg:text-right mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                Store TimeZone
                                            </label>
                                            <select
                                                onChange={(e) => {
                                                    setCurrentDispensary({ ...currentDispensary, storeTimeZone: e.target.value });
                                                }}
                                                id="timezone"
                                                className="flex-initial w-64 form-select mt-1"
                                                placeholder='select the timezone'
                                                name="timezone"
                                                defaultValue={currentDispensary.storeTimeZone}
                                            >
                                                {/* <option value="" className="text-dark dark:text-white-dark" disabled={true}>
                                                    select the timezone
                                                </option> */}
                                                {Timezones?.map((row) => {
                                                    return (
                                                        <option key={row.value} value={row.value}>
                                                            {row.displayName}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                        <div className={`flex flex-col sm:flex-row gap-6 items-center ${submitCount ? (errors.locationAddress ? 'has-error' : '') : ''}`}>
                                            <label htmlFor="locationAddress" className="relative pt-1 lg:text-right mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                Address
                                                <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                            </label>
                                            <Field
                                                id="locationAddress"
                                                name="locationAddress"
                                                type="text"
                                                placeholder="Enter Store Address"
                                                className="form-input flex-1"
                                                // value={currentDispensary.locationAddress}
                                                // onChange={(e: any) => {
                                                //     setCurrentDispensary({ ...currentDispensary, locationAddress: e.target.value });
                                                // }}
                                            />
                                        </div>
                                        <div className={`flex flex-col sm:flex-row gap-6 items-center ${submitCount ? (errors.locationCity ? 'has-error' : '') : ''}`}>
                                            <label htmlFor="locationCity" className="relative pt-1 lg:text-right mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                City
                                                <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                            </label>
                                            <Field
                                                id="locationCity"
                                                name="locationCity"
                                                type="text"
                                                placeholder="Enter City"
                                                className="form-input flex-1"
                                                // value={currentDispensary.locationCity}
                                                // onChange={(e: any) => {
                                                //     setCurrentDispensary({ ...currentDispensary, locationCity: e.target.value });
                                                // }}
                                            />
                                        </div>
                                        <div className={`flex flex-col sm:flex-row gap-6 items-center ${submitCount ? (errors.locationState ? 'has-error' : '') : ''}`}>
                                            <label htmlFor="locationState" className="relative pt-1 lg:text-right mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                State
                                                <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                            </label>
                                            {/* <select
                                                onChange={(e) => {
                                                    setCurrentDispensary({ ...currentDispensary, locationState: e.target.value });
                                                }}
                                                id="locationState"
                                                className="flex-initial w-64 form-select mt-1"
                                                name="locationState"
                                                defaultValue={currentDispensary.locationState}
                                            >
                                                {stateOfUsaData?.map((row) => {
                                                    return (
                                                        <option key={row.value} value={row.value}>
                                                            {row.label}
                                                        </option>
                                                    );
                                                })}
                                            </select> */}
                                            <div className='w-[500px]'>
                                            <CustomSelect
                                                options={stateOfUsaData}
                                                onChange={handleStatsChange}
                                                currentOption={currentStats || currentDispensary?.locationState}
                                                showingText='Select State'
                                                disabled={false}
                                                showingSearch={false}
                                            /></div>
                                        </div>
                                        <div className={`flex flex-col sm:flex-row gap-6 items-center border-b border-white-light pb-8 dark:border-[#1b2e4b] ${submitCount ? (errors.locationZipCode ? 'has-error' : '') : ''}`}>
                                            <label htmlFor="locationZipCode" className="pt-1 lg:text-right mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                Zip Code
                                            </label>
                                            <Field name="locationZipCode">
                                                {({ field }: FieldProps) => (
                                                    <MaskedInput
                                                        {...field}
                                                        id="locationZipCode"
                                                        name="locationZipCode"
                                                        type="text"
                                                        placeholder="Enter Zip Code"
                                                        className="form-input flex-1"
                                                        mask={[/[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/]}
                                                    />
                                                )}
                                            </Field>
                                            {/* <MaskedInput
                                                id="locationZipCode"
                                                type="text"
                                                placeholder="Enter Zip Code"
                                                value={currentDispensary.locationZipCode}
                                                onChange={(e: any) => {
                                                    setCurrentDispensary({ ...currentDispensary, locationZipCode: e.target.value });
                                                }}
                                                className="form-input flex-1"
                                                mask={[/[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/]}
                                            /> */}
                                        </div>
                                        <h5 className="text-lg font-semibold dark:text-white-dark">Customer</h5>
                                        <div className="flex flex-col sm:flex-row gap-6 items-center">
                                            <label htmlFor="locationZipCode" className="pt-1 lg:text-right mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                Age Verification
                                            </label>
                                            <label className="w-9 h-6 relative cursor-pointer mb-0">
                                                <input
                                                    type="checkbox"
                                                    className="peer absolute w-full h-full opacity-0 z-10 focus:ring-0 focus:outline-none cursor-pointer"
                                                    id="custom_switch_checkbox1"
                                                    checked={currentDispensary.isCustomerAgeVerify}
                                                    onChange={(e: any) => {
                                                        setCurrentDispensary({ ...currentDispensary, isCustomerAgeVerify: e.target.checked });
                                                    }}
                                                />
                                                <span className="rounded-full border border-[#adb5bd] bg-white peer-checked:bg-primary peer-checked:border-primary dark:bg-dark block h-full before:absolute ltr:before:left-0.5 rtl:before:right-0.5 ltr:peer-checked:before:left-3.5 rtl:peer-checked:before:right-3.5 peer-checked:before:bg-white before:bg-[#adb5bd] dark:before:bg-white-dark before:bottom-[2px] before:w-5 before:h-5 before:rounded-full before:transition-all before:duration-300"></span>
                                            </label>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-6 items-center">
                                            <label htmlFor="CustomerAgeLimit" className="pt-1 lg:text-right mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                Standard Age
                                            </label>
                                            <MaskedInput
                                                id="CustomerAgeLimit"
                                                type="text"
                                                placeholder="Enter Age Limit"
                                                value={currentDispensary.customerAgeLimit}
                                                onChange={(e: any) => {
                                                    setCurrentDispensary({ ...currentDispensary, customerAgeLimit: e.target.value });
                                                }}
                                                className="form-input flex-1"
                                                mask={[/[0-9]/, /[0-9]/]}
                                            />
                                        </div>
                                        <div className="flex flex-col sm:flex-row justify-end">
                                            <button
                                                onClick={() => {
                                                    if (Object.keys(touched).length !== 0 &&Object.keys(errors).length === 0) {
                                                        submitForm(values);
                                                    } else {
                                                    }
                                                }}
                                                type="submit"
                                                className="btn btn-primary w-20 !mt-6"
                                                disabled={isSaveButtonDisabled}
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </PanelCodeHighlight>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        );
    else return <div>Store ...</div>;
};

export default PageContent;
