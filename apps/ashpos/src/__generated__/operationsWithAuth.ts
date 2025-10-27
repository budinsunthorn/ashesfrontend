// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { env } from '~/env';
import Cookies from 'universal-cookie';

import { useMutation, useQuery, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };

function fetcher<TData, TVariables>(query: string, variables?: TVariables) {
    const cookies = new Cookies();
    const token = cookies.get('token');
    return async (): Promise<TData> => {
        const res = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            ...{
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token,
                },
            },
            body: JSON.stringify({ query, variables }),
        });

        const json = await res.json();

        if (json.errors) {
            const { message } = json.errors[0];

            throw new Error(message);
        }

        return json.data;
    };
}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: { input: string; output: string };
    String: { input: string; output: string };
    Boolean: { input: boolean; output: boolean };
    Int: { input: number; output: number };
    Float: { input: number; output: number };
    DateTime: { input: any; output: any };
};

export type Customer = {
    MFType: MfType;
    birthday: Scalars['String']['output'];
    createdAt: Scalars['DateTime']['output'];
    dispensary: Dispensary;
    dispensaryId: Scalars['String']['output'];
    driverLicense: Scalars['String']['output'];
    driverLicenseExpirationDate: Scalars['String']['output'];
    email: Scalars['String']['output'];
    id: Scalars['String']['output'];
    isActive: Scalars['Boolean']['output'];
    isMedical: Scalars['Boolean']['output'];
    medicalLicense: Scalars['String']['output'];
    medicalLicenseExpirationDate: Scalars['String']['output'];
    name: Scalars['String']['output'];
    phone: Scalars['String']['output'];
    updatedAt: Scalars['DateTime']['output'];
};

export type CustomerCreateInput = {
    MFType: MfType;
    birthday: Scalars['String']['input'];
    dispensaryId: Scalars['String']['input'];
    driverLicense: Scalars['String']['input'];
    driverLicenseExpirationDate: Scalars['String']['input'];
    email: Scalars['String']['input'];
    isActive: Scalars['Boolean']['input'];
    isMedical: Scalars['Boolean']['input'];
    medicalLicense: Scalars['String']['input'];
    medicalLicenseExpirationDate: Scalars['String']['input'];
    name: Scalars['String']['input'];
    phone: Scalars['String']['input'];
};

export type CustomerUpdateInput = {
    MFType: MfType;
    birthday: Scalars['String']['input'];
    driverLicense: Scalars['String']['input'];
    driverLicenseExpirationDate: Scalars['String']['input'];
    email: Scalars['String']['input'];
    id: Scalars['String']['input'];
    isActive: Scalars['Boolean']['input'];
    isMedical: Scalars['Boolean']['input'];
    medicalLicense: Scalars['String']['input'];
    medicalLicenseExpirationDate: Scalars['String']['input'];
    name: Scalars['String']['input'];
    phone: Scalars['String']['input'];
};

export type Discount = {
    applyDurationSet: Scalars['Boolean']['output'];
    applyFrom: Scalars['String']['output'];
    applyTo: Scalars['String']['output'];
    color: Scalars['String']['output'];
    createdAt: Scalars['DateTime']['output'];
    discountPercent: Scalars['String']['output'];
    dispensaryId: Scalars['String']['output'];
    id: Scalars['String']['output'];
    isActive: Scalars['Boolean']['output'];
    isAdminPin: Scalars['Boolean']['output'];
    name: Scalars['String']['output'];
    type: DiscountType;
    updatedAt: Scalars['DateTime']['output'];
};

export type DiscountCreateInput = {
    applyDurationSet: Scalars['Boolean']['input'];
    applyFrom: Scalars['String']['input'];
    applyTo: Scalars['String']['input'];
    color: Scalars['String']['input'];
    discountPercent: Scalars['String']['input'];
    dispensaryId: Scalars['String']['input'];
    isActive: Scalars['Boolean']['input'];
    isAdminPin: Scalars['Boolean']['input'];
    name: Scalars['String']['input'];
    type: DiscountType;
};

export type DiscountType = 'OTHER' | 'STANDARD';

export type DiscountUpdateInput = {
    applyDurationSet: Scalars['Boolean']['input'];
    applyFrom: Scalars['String']['input'];
    applyTo: Scalars['String']['input'];
    color: Scalars['String']['input'];
    discountPercent: Scalars['String']['input'];
    id: Scalars['String']['input'];
    isActive: Scalars['Boolean']['input'];
    isAdminPin: Scalars['Boolean']['input'];
    name: Scalars['String']['input'];
    type: DiscountType;
};

export type Dispensary = {
    businessLicense: Scalars['String']['output'];
    createdAt: Scalars['DateTime']['output'];
    dispensaryType: DispensaryType;
    email: Scalars['String']['output'];
    id: Scalars['String']['output'];
    locationAddress: Scalars['String']['output'];
    locationCity: Scalars['String']['output'];
    locationState: Scalars['String']['output'];
    locationZipCode: Scalars['String']['output'];
    metrcApiKey?: Maybe<Scalars['String']['output']>;
    metrcConnectionStatus?: Maybe<Scalars['Boolean']['output']>;
    metrcLicenseNumber?: Maybe<Scalars['String']['output']>;
    name: Scalars['String']['output'];
    organization: Organization;
    organizationId: Scalars['String']['output'];
    phone: Scalars['String']['output'];
    updatedAt: Scalars['DateTime']['output'];
    users?: Maybe<Array<Maybe<User>>>;
};

export type DispensaryCreateInput = {
    businessLicense?: InputMaybe<Scalars['String']['input']>;
    dispensaryType: DispensaryType;
    email: Scalars['String']['input'];
    locationAddress?: InputMaybe<Scalars['String']['input']>;
    locationCity?: InputMaybe<Scalars['String']['input']>;
    locationState?: InputMaybe<Scalars['String']['input']>;
    locationZipCode?: InputMaybe<Scalars['String']['input']>;
    name: Scalars['String']['input'];
    organizationId: Scalars['String']['input'];
    phone: Scalars['String']['input'];
};

export type DispensaryType = 'MED' | 'MEDREC' | 'REC';

export type DispensaryUpdateInput = {
    businessLicense?: InputMaybe<Scalars['String']['input']>;
    dispensaryType: DispensaryType;
    email: Scalars['String']['input'];
    id: Scalars['String']['input'];
    locationAddress?: InputMaybe<Scalars['String']['input']>;
    locationCity?: InputMaybe<Scalars['String']['input']>;
    locationState?: InputMaybe<Scalars['String']['input']>;
    locationZipCode?: InputMaybe<Scalars['String']['input']>;
    name: Scalars['String']['input'];
    phone: Scalars['String']['input'];
};

export type ItemCategory = {
    createdAt: Scalars['DateTime']['output'];
    id: Scalars['String']['output'];
    name: Scalars['String']['output'];
    stateOfUsa: StateType;
    updatedAt: Scalars['DateTime']['output'];
};

export type ItemCategoryCreateInput = {
    name: Scalars['String']['input'];
    stateOfUsa: StateType;
};

export type ItemCategoryUpdateInput = {
    id: Scalars['String']['input'];
    name: Scalars['String']['input'];
};

export type Loyalty = {
    applyDurationSet: Scalars['Boolean']['output'];
    applyFrom: Scalars['String']['output'];
    applyTo: Scalars['String']['output'];
    color: Scalars['String']['output'];
    createdAt: Scalars['DateTime']['output'];
    dispensaryId: Scalars['String']['output'];
    id: Scalars['String']['output'];
    isActive: Scalars['Boolean']['output'];
    isAdminPin: Scalars['Boolean']['output'];
    name: Scalars['String']['output'];
    pointWorth: Scalars['String']['output'];
    type: LoyaltyType;
    updatedAt: Scalars['DateTime']['output'];
};

export type LoyaltyCreateInput = {
    applyDurationSet: Scalars['Boolean']['input'];
    applyFrom: Scalars['String']['input'];
    applyTo: Scalars['String']['input'];
    color: Scalars['String']['input'];
    dispensaryId: Scalars['String']['input'];
    isActive: Scalars['Boolean']['input'];
    isAdminPin: Scalars['Boolean']['input'];
    name: Scalars['String']['input'];
    pointWorth: Scalars['String']['input'];
    type: LoyaltyType;
};

export type LoyaltyType = 'OTHER' | 'STANDARD';

export type LoyaltyUpdateInput = {
    applyDurationSet: Scalars['Boolean']['input'];
    applyFrom: Scalars['String']['input'];
    applyTo: Scalars['String']['input'];
    color: Scalars['String']['input'];
    id: Scalars['String']['input'];
    isActive: Scalars['Boolean']['input'];
    isAdminPin: Scalars['Boolean']['input'];
    name: Scalars['String']['input'];
    pointWorth: Scalars['String']['input'];
    type: LoyaltyType;
};

export type MfType = 'FEMALE' | 'MALE';

export type MetrcConnectionInput = {
    dispensaryId: Scalars['String']['input'];
    metrcApiKey?: InputMaybe<Scalars['String']['input']>;
    metrcConnectionStatus: Scalars['Boolean']['input'];
    metrcLicenseNumber?: InputMaybe<Scalars['String']['input']>;
};

export type Mutation = {
    createCustomer?: Maybe<Customer>;
    createDiscount?: Maybe<Discount>;
    createDispensary?: Maybe<Dispensary>;
    createItemCategory?: Maybe<ItemCategory>;
    createLoyalty?: Maybe<Loyalty>;
    createOrganization?: Maybe<Organization>;
    createTaxSetting?: Maybe<TaxSetting>;
    createUser?: Maybe<User>;
    deleteCustomer?: Maybe<Customer>;
    deleteDiscount?: Maybe<Discount>;
    deleteDispensary?: Maybe<Dispensary>;
    deleteItemCategory?: Maybe<ItemCategory>;
    deleteLoyalty?: Maybe<Loyalty>;
    deleteOrganization?: Maybe<Organization>;
    deleteTaxSetting?: Maybe<TaxSetting>;
    deleteUser?: Maybe<User>;
    loginUser: UserData;
    metrcConnectionUpdate?: Maybe<Dispensary>;
    updateCustomer?: Maybe<Customer>;
    updateDiscount?: Maybe<Discount>;
    updateDispensary?: Maybe<Dispensary>;
    updateItemCategory?: Maybe<ItemCategory>;
    updateLoyalty?: Maybe<Loyalty>;
    updateOrganization?: Maybe<Organization>;
    updateTaxSetting?: Maybe<TaxSetting>;
    updateUser?: Maybe<User>;
};

export type MutationCreateCustomerArgs = {
    input: CustomerCreateInput;
};

export type MutationCreateDiscountArgs = {
    input: DiscountCreateInput;
};

export type MutationCreateDispensaryArgs = {
    input: DispensaryCreateInput;
};

export type MutationCreateItemCategoryArgs = {
    input: ItemCategoryCreateInput;
};

export type MutationCreateLoyaltyArgs = {
    input: LoyaltyCreateInput;
};

export type MutationCreateOrganizationArgs = {
    input: OrganizationCreateInput;
};

export type MutationCreateTaxSettingArgs = {
    input: TaxSettingCreateInput;
};

export type MutationCreateUserArgs = {
    input: UserCreateInput;
};

export type MutationDeleteCustomerArgs = {
    id: Scalars['String']['input'];
};

export type MutationDeleteDiscountArgs = {
    id: Scalars['String']['input'];
};

export type MutationDeleteDispensaryArgs = {
    id: Scalars['String']['input'];
};

export type MutationDeleteItemCategoryArgs = {
    id: Scalars['String']['input'];
};

export type MutationDeleteLoyaltyArgs = {
    id: Scalars['String']['input'];
};

export type MutationDeleteOrganizationArgs = {
    id: Scalars['String']['input'];
};

export type MutationDeleteTaxSettingArgs = {
    id: Scalars['String']['input'];
};

export type MutationDeleteUserArgs = {
    id: Scalars['String']['input'];
};

export type MutationLoginUserArgs = {
    input: UserLoginInput;
};

export type MutationMetrcConnectionUpdateArgs = {
    input: MetrcConnectionInput;
};

export type MutationUpdateCustomerArgs = {
    input: CustomerUpdateInput;
};

export type MutationUpdateDiscountArgs = {
    input: DiscountUpdateInput;
};

export type MutationUpdateDispensaryArgs = {
    input: DispensaryUpdateInput;
};

export type MutationUpdateItemCategoryArgs = {
    input: ItemCategoryUpdateInput;
};

export type MutationUpdateLoyaltyArgs = {
    input: LoyaltyUpdateInput;
};

export type MutationUpdateOrganizationArgs = {
    input: OrganizationUpdateInput;
};

export type MutationUpdateTaxSettingArgs = {
    input: TaxSettingUpdateInput;
};

export type MutationUpdateUserArgs = {
    input: UserUpdateInput;
};

export type MutationResponse = {
    code: Scalars['String']['output'];
    success: Scalars['Boolean']['output'];
};

export type Organization = {
    createdAt: Scalars['DateTime']['output'];
    dispensaries?: Maybe<Array<Maybe<Dispensary>>>;
    id: Scalars['String']['output'];
    name: Scalars['String']['output'];
    phone: Scalars['String']['output'];
    updatedAt: Scalars['DateTime']['output'];
};

export type OrganizationCreateInput = {
    name: Scalars['String']['input'];
    phone: Scalars['String']['input'];
};

export type OrganizationUpdateInput = {
    id: Scalars['String']['input'];
    name: Scalars['String']['input'];
    phone: Scalars['String']['input'];
};

export type ProductCategoryInput = {
    label: Scalars['String']['input'];
    stateOfUsa: Scalars['String']['input'];
    value: Scalars['String']['input'];
};

export type ProductCategoryOutput = {
    label: Scalars['String']['output'];
    stateOfUsa: Scalars['String']['output'];
    value: Scalars['String']['output'];
};

export type ProductType = 'MJ' | 'NMJ';

export type Query = {
    allCustomersByDispensaryId?: Maybe<Array<Maybe<Customer>>>;
    allDiscountsByDispensaryId?: Maybe<Array<Maybe<Discount>>>;
    allDispensaries?: Maybe<Array<Maybe<Dispensary>>>;
    allDispensariesByOrganizationId?: Maybe<Array<Maybe<Dispensary>>>;
    allItemCategoriesByStateOfUsa?: Maybe<Array<Maybe<ItemCategory>>>;
    allLoyaltiesByDispensaryId?: Maybe<Array<Maybe<Loyalty>>>;
    allOrganizations?: Maybe<Array<Maybe<Organization>>>;
    allTaxSettingByDispensaryId?: Maybe<Array<Maybe<TaxSetting>>>;
    allUsersByDispensaryId?: Maybe<Array<Maybe<User>>>;
    customer?: Maybe<Customer>;
    discount?: Maybe<Discount>;
    dispensary?: Maybe<Dispensary>;
    itemCategory?: Maybe<ItemCategory>;
    loyalty?: Maybe<Loyalty>;
    metrcInfoByDispensaryId: MetrcInfo;
    organization?: Maybe<Organization>;
    taxSetting?: Maybe<TaxSetting>;
    user?: Maybe<User>;
};

export type QueryAllCustomersByDispensaryIdArgs = {
    dispensaryId: Scalars['String']['input'];
};

export type QueryAllDiscountsByDispensaryIdArgs = {
    dispensaryId: Scalars['String']['input'];
};

export type QueryAllDispensariesByOrganizationIdArgs = {
    organizationId: Scalars['String']['input'];
};

export type QueryAllItemCategoriesByStateOfUsaArgs = {
    stateOfUsa: StateType;
};

export type QueryAllLoyaltiesByDispensaryIdArgs = {
    dispensaryId: Scalars['String']['input'];
};

export type QueryAllTaxSettingByDispensaryIdArgs = {
    dispensaryId: Scalars['String']['input'];
};

export type QueryAllUsersByDispensaryIdArgs = {
    dispensaryId: Scalars['String']['input'];
};

export type QueryCustomerArgs = {
    id: Scalars['String']['input'];
};

export type QueryDiscountArgs = {
    id: Scalars['String']['input'];
};

export type QueryDispensaryArgs = {
    id: Scalars['String']['input'];
};

export type QueryItemCategoryArgs = {
    id: Scalars['String']['input'];
};

export type QueryLoyaltyArgs = {
    id: Scalars['String']['input'];
};

export type QueryMetrcInfoByDispensaryIdArgs = {
    dispensaryId: Scalars['String']['input'];
};

export type QueryOrganizationArgs = {
    id: Scalars['String']['input'];
};

export type QueryTaxSettingArgs = {
    id: Scalars['String']['input'];
};

export type QueryUserArgs = {
    id: Scalars['String']['input'];
};

export type StateType =
    | 'AK'
    | 'AL'
    | 'AR'
    | 'AZ'
    | 'CA'
    | 'CO'
    | 'CT'
    | 'DE'
    | 'FL'
    | 'GA'
    | 'HI'
    | 'IA'
    | 'ID'
    | 'IL'
    | 'IN'
    | 'KS'
    | 'KY'
    | 'LA'
    | 'MA'
    | 'MD'
    | 'ME'
    | 'MI'
    | 'MN'
    | 'MO'
    | 'MS'
    | 'MT'
    | 'NC'
    | 'ND'
    | 'NE'
    | 'NH'
    | 'NJ'
    | 'NM'
    | 'NV'
    | 'NY'
    | 'OH'
    | 'OK'
    | 'OR'
    | 'PA'
    | 'RI'
    | 'SC'
    | 'SD'
    | 'TN'
    | 'TX'
    | 'UT'
    | 'VA'
    | 'VT'
    | 'WA'
    | 'WI'
    | 'WV'
    | 'WY';

export type TaxSetting = {
    applyTo: Scalars['String']['output'];
    categories?: Maybe<Array<Maybe<ProductCategoryOutput>>>;
    createdAt: Scalars['DateTime']['output'];
    dispensaryId: Scalars['String']['output'];
    id: Scalars['String']['output'];
    name: Scalars['String']['output'];
    rate: Scalars['String']['output'];
    updatedAt: Scalars['DateTime']['output'];
};

export type TaxSettingCreateInput = {
    applyTo: Scalars['String']['input'];
    categories?: InputMaybe<Array<InputMaybe<ProductCategoryInput>>>;
    dispensaryId: Scalars['String']['input'];
    name: Scalars['String']['input'];
    rate: Scalars['String']['input'];
};

export type TaxSettingUpdateInput = {
    applyTo: Scalars['String']['input'];
    categories?: InputMaybe<Array<InputMaybe<ProductCategoryInput>>>;
    id: Scalars['String']['input'];
    name: Scalars['String']['input'];
    rate: Scalars['String']['input'];
};

export type User = {
    createdAt: Scalars['DateTime']['output'];
    dispensary: Dispensary;
    dispensaryId: Scalars['String']['output'];
    email: Scalars['String']['output'];
    id: Scalars['String']['output'];
    isActive: Scalars['Boolean']['output'];
    isDispensaryAdmin: Scalars['Boolean']['output'];
    isEmailVerified: Scalars['Boolean']['output'];
    isOrganizationAdmin: Scalars['Boolean']['output'];
    name: Scalars['String']['output'];
    password: Scalars['String']['output'];
    phone: Scalars['String']['output'];
    updatedAt: Scalars['DateTime']['output'];
    userType: UserType;
};

export type UserCreateInput = {
    dispensaryId: Scalars['String']['input'];
    email: Scalars['String']['input'];
    isActive: Scalars['Boolean']['input'];
    isDispensaryAdmin: Scalars['Boolean']['input'];
    isOrganizationAdmin: Scalars['Boolean']['input'];
    name: Scalars['String']['input'];
    password: Scalars['String']['input'];
    phone: Scalars['String']['input'];
    userType: UserType;
};

export type UserLoginInput = {
    email: Scalars['String']['input'];
    password: Scalars['String']['input'];
};

export type UserType = 'ADMIN' | 'BUDTENDER' | 'MANAGER';

export type UserUpdateInput = {
    dispensaryId: Scalars['String']['input'];
    email: Scalars['String']['input'];
    id: Scalars['String']['input'];
    isActive: Scalars['Boolean']['input'];
    isDispensaryAdmin: Scalars['Boolean']['input'];
    isOrganizationAdmin: Scalars['Boolean']['input'];
    name: Scalars['String']['input'];
    phone: Scalars['String']['input'];
    userType: UserType;
};

export type MetrcInfo = {
    id: Scalars['String']['output'];
    metrcApiKey?: Maybe<Scalars['String']['output']>;
    metrcConnectionStatus: Scalars['Boolean']['output'];
    metrcLicenseNumber?: Maybe<Scalars['String']['output']>;
};

export type UserData = {
    token: Scalars['String']['output'];
};

export type CreateCustomerMutationVariables = Exact<{
    input: CustomerCreateInput;
}>;

export type CreateCustomerMutation = { createCustomer?: { id: string; name: string } | null };

export type CreateDiscountMutationVariables = Exact<{
    input: DiscountCreateInput;
}>;

export type CreateDiscountMutation = { createDiscount?: { id: string; name: string } | null };

export type CreateDispensaryMutationVariables = Exact<{
    input: DispensaryCreateInput;
}>;

export type CreateDispensaryMutation = {
    createDispensary?: {
        id: string;
        name: string;
        dispensaryType: DispensaryType;
        organizationId: string;
        businessLicense: string;
        phone: string;
        email: string;
        locationAddress: string;
        locationCity: string;
        locationState: string;
        locationZipCode: string;
    } | null;
};

export type CreateItemCategoryMutationVariables = Exact<{
    input: ItemCategoryCreateInput;
}>;

export type CreateItemCategoryMutation = { createItemCategory?: { id: string; name: string } | null };

export type CreateLoyaltyMutationVariables = Exact<{
    input: LoyaltyCreateInput;
}>;

export type CreateLoyaltyMutation = { createLoyalty?: { id: string; name: string } | null };

export type CreateOrganizationMutationVariables = Exact<{
    input: OrganizationCreateInput;
}>;

export type CreateOrganizationMutation = { createOrganization?: { name: string; phone: string; id: string; createdAt: any; updatedAt: any } | null };

export type CreateTaxSettingMutationVariables = Exact<{
    input: TaxSettingCreateInput;
}>;

export type CreateTaxSettingMutation = { createTaxSetting?: { id: string; name: string } | null };

export type CreateUserMutationVariables = Exact<{
    input: UserCreateInput;
}>;

export type CreateUserMutation = { createUser?: { id: string; name: string } | null };

export type DeleteCustomerMutationVariables = Exact<{
    id: Scalars['String']['input'];
}>;

export type DeleteCustomerMutation = { deleteCustomer?: { name: string } | null };

export type DeleteDiscountMutationVariables = Exact<{
    id: Scalars['String']['input'];
}>;

export type DeleteDiscountMutation = { deleteDiscount?: { name: string } | null };

export type DeleteDispensaryMutationVariables = Exact<{
    id: Scalars['String']['input'];
}>;

export type DeleteDispensaryMutation = { deleteDispensary?: { name: string } | null };

export type DeleteItemCategoryMutationVariables = Exact<{
    id: Scalars['String']['input'];
}>;

export type DeleteItemCategoryMutation = { deleteItemCategory?: { name: string } | null };

export type DeleteLoyaltyMutationVariables = Exact<{
    id: Scalars['String']['input'];
}>;

export type DeleteLoyaltyMutation = { deleteLoyalty?: { name: string } | null };

export type DeleteOrganizationMutationVariables = Exact<{
    id: Scalars['String']['input'];
}>;

export type DeleteOrganizationMutation = { deleteOrganization?: { id: string; name: string; phone: string; createdAt: any; updatedAt: any } | null };

export type DeleteTaxSettingMutationVariables = Exact<{
    id: Scalars['String']['input'];
}>;

export type DeleteTaxSettingMutation = { deleteTaxSetting?: { name: string } | null };

export type DeleteUserMutationVariables = Exact<{
    id: Scalars['String']['input'];
}>;

export type DeleteUserMutation = { deleteUser?: { name: string } | null };

export type LoginUserMutationVariables = Exact<{
    input: UserLoginInput;
}>;

export type LoginUserMutation = { loginUser: { token: string } };

export type MetrcConnectUpdateMutationVariables = Exact<{
    input: MetrcConnectionInput;
}>;

export type MetrcConnectUpdateMutation = { metrcConnectionUpdate?: { name: string; metrcApiKey?: string | null; metrcLicenseNumber?: string | null; metrcConnectionStatus?: boolean | null } | null };

export type UpdateCustomerMutationVariables = Exact<{
    input: CustomerUpdateInput;
}>;

export type UpdateCustomerMutation = { updateCustomer?: { name: string } | null };

export type UpdateDiscountMutationVariables = Exact<{
    input: DiscountUpdateInput;
}>;

export type UpdateDiscountMutation = { updateDiscount?: { name: string } | null };

export type UpdateDispensaryMutationVariables = Exact<{
    input: DispensaryUpdateInput;
}>;

export type UpdateDispensaryMutation = {
    updateDispensary?: {
        id: string;
        name: string;
        dispensaryType: DispensaryType;
        organizationId: string;
        businessLicense: string;
        phone: string;
        email: string;
        locationAddress: string;
        locationCity: string;
        locationState: string;
        locationZipCode: string;
    } | null;
};

export type UpdateItemCategoryMutationVariables = Exact<{
    input: ItemCategoryUpdateInput;
}>;

export type UpdateItemCategoryMutation = { updateItemCategory?: { name: string } | null };

export type UpdateLoyaltyMutationVariables = Exact<{
    input: LoyaltyUpdateInput;
}>;

export type UpdateLoyaltyMutation = { updateLoyalty?: { name: string } | null };

export type UpdateOrganizationMutationVariables = Exact<{
    input: OrganizationUpdateInput;
}>;

export type UpdateOrganizationMutation = { updateOrganization?: { id: string; name: string; phone: string; createdAt: any; updatedAt: any } | null };

export type UpdateTaxSettingMutationVariables = Exact<{
    input: TaxSettingUpdateInput;
}>;

export type UpdateTaxSettingMutation = { updateTaxSetting?: { name: string } | null };

export type UpdateUserMutationVariables = Exact<{
    input: UserUpdateInput;
}>;

export type UpdateUserMutation = { updateUser?: { name: string } | null };

export type AllCustomersByDispensaryIdQueryVariables = Exact<{
    dispensaryId: Scalars['String']['input'];
}>;

export type AllCustomersByDispensaryIdQuery = {
    allCustomersByDispensaryId?: Array<{
        id: string;
        name: string;
        MFType: MfType;
        birthday: string;
        email: string;
        phone: string;
        dispensaryId: string;
        isActive: boolean;
        driverLicense: string;
        driverLicenseExpirationDate: string;
        isMedical: boolean;
        medicalLicense: string;
        medicalLicenseExpirationDate: string;
        createdAt: any;
        updatedAt: any;
    } | null> | null;
};

export type AllDiscountsByDispensaryIdQueryVariables = Exact<{
    dispensaryId: Scalars['String']['input'];
}>;

export type AllDiscountsByDispensaryIdQuery = {
    allDiscountsByDispensaryId?: Array<{
        id: string;
        dispensaryId: string;
        name: string;
        type: DiscountType;
        applyDurationSet: boolean;
        applyTo: string;
        applyFrom: string;
        discountPercent: string;
        isActive: boolean;
        isAdminPin: boolean;
        color: string;
        createdAt: any;
        updatedAt: any;
    } | null> | null;
};

export type AllDispensariesQueryVariables = Exact<{ [key: string]: never }>;

export type AllDispensariesQuery = {
    allDispensaries?: Array<{
        id: string;
        name: string;
        dispensaryType: DispensaryType;
        organizationId: string;
        businessLicense: string;
        phone: string;
        email: string;
        locationAddress: string;
        locationCity: string;
        locationState: string;
        locationZipCode: string;
        createdAt: any;
        updatedAt: any;
    } | null> | null;
};

export type AllDispensariesByOrganizationIdQueryVariables = Exact<{
    organizationId: Scalars['String']['input'];
}>;

export type AllDispensariesByOrganizationIdQuery = {
    allDispensariesByOrganizationId?: Array<{
        id: string;
        name: string;
        dispensaryType: DispensaryType;
        organizationId: string;
        businessLicense: string;
        phone: string;
        email: string;
        locationAddress: string;
        locationCity: string;
        locationState: string;
        locationZipCode: string;
        createdAt: any;
        updatedAt: any;
    } | null> | null;
};

export type AllItemCategoriesByStateOfUsaQueryVariables = Exact<{
    stateOfUsa: StateType;
}>;

export type AllItemCategoriesByStateOfUsaQuery = { allItemCategoriesByStateOfUsa?: Array<{ id: string; name: string; stateOfUsa: StateType; createdAt: any; updatedAt: any } | null> | null };

export type AllLoyaltiesByDispensaryIdQueryVariables = Exact<{
    dispensaryId: Scalars['String']['input'];
}>;

export type AllLoyaltiesByDispensaryIdQuery = {
    allLoyaltiesByDispensaryId?: Array<{
        id: string;
        dispensaryId: string;
        name: string;
        type: LoyaltyType;
        applyDurationSet: boolean;
        applyTo: string;
        applyFrom: string;
        pointWorth: string;
        isActive: boolean;
        isAdminPin: boolean;
        color: string;
        createdAt: any;
        updatedAt: any;
    } | null> | null;
};

export type AllOrganizationsQueryVariables = Exact<{ [key: string]: never }>;

export type AllOrganizationsQuery = { allOrganizations?: Array<{ id: string; name: string; phone: string; createdAt: any; updatedAt: any } | null> | null };

export type AllTaxSettingByDispensaryIdQueryVariables = Exact<{
    dispensaryId: Scalars['String']['input'];
}>;

export type AllTaxSettingByDispensaryIdQuery = {
    allTaxSettingByDispensaryId?: Array<{
        id: string;
        dispensaryId: string;
        name: string;
        rate: string;
        applyTo: string;
        createdAt: any;
        updatedAt: any;
        categories?: Array<{ value: string; label: string; stateOfUsa: string } | null> | null;
    } | null> | null;
};

export type AllUsersByDispensaryIdQueryVariables = Exact<{
    dispensaryId: Scalars['String']['input'];
}>;

export type AllUsersByDispensaryIdQuery = {
    allUsersByDispensaryId?: Array<{
        id: string;
        email: string;
        name: string;
        phone: string;
        dispensaryId: string;
        isActive: boolean;
        isDispensaryAdmin: boolean;
        isEmailVerified: boolean;
        isOrganizationAdmin: boolean;
        userType: UserType;
        createdAt: any;
        updatedAt: any;
    } | null> | null;
};

export type CustomerQueryVariables = Exact<{
    id: Scalars['String']['input'];
}>;

export type CustomerQuery = {
    customer?: {
        id: string;
        name: string;
        MFType: MfType;
        birthday: string;
        email: string;
        phone: string;
        dispensaryId: string;
        isActive: boolean;
        driverLicense: string;
        driverLicenseExpirationDate: string;
        isMedical: boolean;
        medicalLicense: string;
        medicalLicenseExpirationDate: string;
        createdAt: any;
        updatedAt: any;
    } | null;
};

export type DiscountQueryVariables = Exact<{
    id: Scalars['String']['input'];
}>;

export type DiscountQuery = {
    discount?: {
        id: string;
        dispensaryId: string;
        name: string;
        type: DiscountType;
        applyDurationSet: boolean;
        applyTo: string;
        applyFrom: string;
        discountPercent: string;
        isActive: boolean;
        isAdminPin: boolean;
        color: string;
        createdAt: any;
        updatedAt: any;
    } | null;
};

export type DispensaryQueryVariables = Exact<{
    id: Scalars['String']['input'];
}>;

export type DispensaryQuery = {
    dispensary?: {
        id: string;
        name: string;
        organizationId: string;
        dispensaryType: DispensaryType;
        email: string;
        phone: string;
        locationAddress: string;
        locationCity: string;
        locationState: string;
        locationZipCode: string;
        businessLicense: string;
    } | null;
};

export type ItemCategoryQueryVariables = Exact<{
    id: Scalars['String']['input'];
}>;

export type ItemCategoryQuery = { itemCategory?: { id: string; name: string; stateOfUsa: StateType; createdAt: any; updatedAt: any } | null };

export type LoyaltyQueryVariables = Exact<{
    id: Scalars['String']['input'];
}>;

export type LoyaltyQuery = {
    loyalty?: {
        id: string;
        dispensaryId: string;
        name: string;
        type: LoyaltyType;
        applyDurationSet: boolean;
        applyTo: string;
        applyFrom: string;
        pointWorth: string;
        isActive: boolean;
        isAdminPin: boolean;
        color: string;
        createdAt: any;
        updatedAt: any;
    } | null;
};

export type MetrcInfoByDispensaryIdQueryVariables = Exact<{
    dispensaryId: Scalars['String']['input'];
}>;

export type MetrcInfoByDispensaryIdQuery = { metrcInfoByDispensaryId: { id: string; metrcApiKey?: string | null; metrcConnectionStatus: boolean; metrcLicenseNumber?: string | null } };

export type OrganizationQueryVariables = Exact<{
    id: Scalars['String']['input'];
}>;

export type OrganizationQuery = {
    organization?: {
        id: string;
        name: string;
        phone: string;
        createdAt: any;
        updatedAt: any;
        dispensaries?: Array<{
            id: string;
            name: string;
            dispensaryType: DispensaryType;
            email: string;
            phone: string;
            locationAddress: string;
            locationCity: string;
            locationState: string;
            locationZipCode: string;
            businessLicense: string;
            createdAt: any;
            updatedAt: any;
        } | null> | null;
    } | null;
};

export type TaxSettingQueryVariables = Exact<{
    id: Scalars['String']['input'];
}>;

export type TaxSettingQuery = {
    taxSetting?: {
        id: string;
        dispensaryId: string;
        name: string;
        rate: string;
        applyTo: string;
        createdAt: any;
        updatedAt: any;
        categories?: Array<{ value: string; label: string; stateOfUsa: string } | null> | null;
    } | null;
};

export const CreateCustomerDocument = `
    mutation createCustomer($input: CustomerCreateInput!) {
  createCustomer(input: $input) {
    id
    name
  }
}
    `;

export const useCreateCustomerMutation = <TError = Error, TContext = unknown>(options?: UseMutationOptions<CreateCustomerMutation, TError, CreateCustomerMutationVariables, TContext>) => {
    return useMutation<CreateCustomerMutation, TError, CreateCustomerMutationVariables, TContext>(
        ['createCustomer'],
        (variables?: CreateCustomerMutationVariables) => fetcher<CreateCustomerMutation, CreateCustomerMutationVariables>(CreateCustomerDocument, variables)(),
        options,
    );
};

useCreateCustomerMutation.fetcher = (variables: CreateCustomerMutationVariables) => fetcher<CreateCustomerMutation, CreateCustomerMutationVariables>(CreateCustomerDocument, variables);

export const CreateDiscountDocument = `
    mutation createDiscount($input: DiscountCreateInput!) {
  createDiscount(input: $input) {
    id
    name
  }
}
    `;

export const useCreateDiscountMutation = <TError = Error, TContext = unknown>(options?: UseMutationOptions<CreateDiscountMutation, TError, CreateDiscountMutationVariables, TContext>) => {
    return useMutation<CreateDiscountMutation, TError, CreateDiscountMutationVariables, TContext>(
        ['createDiscount'],
        (variables?: CreateDiscountMutationVariables) => fetcher<CreateDiscountMutation, CreateDiscountMutationVariables>(CreateDiscountDocument, variables)(),
        options,
    );
};

useCreateDiscountMutation.fetcher = (variables: CreateDiscountMutationVariables) => fetcher<CreateDiscountMutation, CreateDiscountMutationVariables>(CreateDiscountDocument, variables);

export const CreateDispensaryDocument = `
    mutation createDispensary($input: DispensaryCreateInput!) {
  createDispensary(input: $input) {
    id
    name
    dispensaryType
    organizationId
    businessLicense
    phone
    email
    locationAddress
    locationCity
    locationState
    locationZipCode
  }
}
    `;

export const useCreateDispensaryMutation = <TError = Error, TContext = unknown>(options?: UseMutationOptions<CreateDispensaryMutation, TError, CreateDispensaryMutationVariables, TContext>) => {
    return useMutation<CreateDispensaryMutation, TError, CreateDispensaryMutationVariables, TContext>(
        ['createDispensary'],
        (variables?: CreateDispensaryMutationVariables) => fetcher<CreateDispensaryMutation, CreateDispensaryMutationVariables>(CreateDispensaryDocument, variables)(),
        options,
    );
};

useCreateDispensaryMutation.fetcher = (variables: CreateDispensaryMutationVariables) => fetcher<CreateDispensaryMutation, CreateDispensaryMutationVariables>(CreateDispensaryDocument, variables);

export const CreateItemCategoryDocument = `
    mutation createItemCategory($input: ItemCategoryCreateInput!) {
  createItemCategory(input: $input) {
    id
    name
  }
}
    `;

export const useCreateItemCategoryMutation = <TError = Error, TContext = unknown>(options?: UseMutationOptions<CreateItemCategoryMutation, TError, CreateItemCategoryMutationVariables, TContext>) => {
    return useMutation<CreateItemCategoryMutation, TError, CreateItemCategoryMutationVariables, TContext>(
        ['createItemCategory'],
        (variables?: CreateItemCategoryMutationVariables) => fetcher<CreateItemCategoryMutation, CreateItemCategoryMutationVariables>(CreateItemCategoryDocument, variables)(),
        options,
    );
};

useCreateItemCategoryMutation.fetcher = (variables: CreateItemCategoryMutationVariables) =>
    fetcher<CreateItemCategoryMutation, CreateItemCategoryMutationVariables>(CreateItemCategoryDocument, variables);

export const CreateLoyaltyDocument = `
    mutation createLoyalty($input: LoyaltyCreateInput!) {
  createLoyalty(input: $input) {
    id
    name
  }
}
    `;

export const useCreateLoyaltyMutation = <TError = Error, TContext = unknown>(options?: UseMutationOptions<CreateLoyaltyMutation, TError, CreateLoyaltyMutationVariables, TContext>) => {
    return useMutation<CreateLoyaltyMutation, TError, CreateLoyaltyMutationVariables, TContext>(
        ['createLoyalty'],
        (variables?: CreateLoyaltyMutationVariables) => fetcher<CreateLoyaltyMutation, CreateLoyaltyMutationVariables>(CreateLoyaltyDocument, variables)(),
        options,
    );
};

useCreateLoyaltyMutation.fetcher = (variables: CreateLoyaltyMutationVariables) => fetcher<CreateLoyaltyMutation, CreateLoyaltyMutationVariables>(CreateLoyaltyDocument, variables);

export const CreateOrganizationDocument = `
    mutation createOrganization($input: OrganizationCreateInput!) {
  createOrganization(input: $input) {
    name
    phone
    id
    createdAt
    updatedAt
  }
}
    `;

export const useCreateOrganizationMutation = <TError = Error, TContext = unknown>(options?: UseMutationOptions<CreateOrganizationMutation, TError, CreateOrganizationMutationVariables, TContext>) => {
    return useMutation<CreateOrganizationMutation, TError, CreateOrganizationMutationVariables, TContext>(
        ['createOrganization'],
        (variables?: CreateOrganizationMutationVariables) => fetcher<CreateOrganizationMutation, CreateOrganizationMutationVariables>(CreateOrganizationDocument, variables)(),
        options,
    );
};

useCreateOrganizationMutation.fetcher = (variables: CreateOrganizationMutationVariables) =>
    fetcher<CreateOrganizationMutation, CreateOrganizationMutationVariables>(CreateOrganizationDocument, variables);

export const CreateTaxSettingDocument = `
    mutation createTaxSetting($input: TaxSettingCreateInput!) {
  createTaxSetting(input: $input) {
    id
    name
  }
}
    `;

export const useCreateTaxSettingMutation = <TError = Error, TContext = unknown>(options?: UseMutationOptions<CreateTaxSettingMutation, TError, CreateTaxSettingMutationVariables, TContext>) => {
    return useMutation<CreateTaxSettingMutation, TError, CreateTaxSettingMutationVariables, TContext>(
        ['createTaxSetting'],
        (variables?: CreateTaxSettingMutationVariables) => fetcher<CreateTaxSettingMutation, CreateTaxSettingMutationVariables>(CreateTaxSettingDocument, variables)(),
        options,
    );
};

useCreateTaxSettingMutation.fetcher = (variables: CreateTaxSettingMutationVariables) => fetcher<CreateTaxSettingMutation, CreateTaxSettingMutationVariables>(CreateTaxSettingDocument, variables);

export const CreateUserDocument = `
    mutation createUser($input: UserCreateInput!) {
  createUser(input: $input) {
    id
    name
  }
}
    `;

export const useCreateUserMutation = <TError = Error, TContext = unknown>(options?: UseMutationOptions<CreateUserMutation, TError, CreateUserMutationVariables, TContext>) => {
    return useMutation<CreateUserMutation, TError, CreateUserMutationVariables, TContext>(
        ['createUser'],
        (variables?: CreateUserMutationVariables) => fetcher<CreateUserMutation, CreateUserMutationVariables>(CreateUserDocument, variables)(),
        options,
    );
};

useCreateUserMutation.fetcher = (variables: CreateUserMutationVariables) => fetcher<CreateUserMutation, CreateUserMutationVariables>(CreateUserDocument, variables);

export const DeleteCustomerDocument = `
    mutation deleteCustomer($id: String!) {
  deleteCustomer(id: $id) {
    name
  }
}
    `;

export const useDeleteCustomerMutation = <TError = Error, TContext = unknown>(options?: UseMutationOptions<DeleteCustomerMutation, TError, DeleteCustomerMutationVariables, TContext>) => {
    return useMutation<DeleteCustomerMutation, TError, DeleteCustomerMutationVariables, TContext>(
        ['deleteCustomer'],
        (variables?: DeleteCustomerMutationVariables) => fetcher<DeleteCustomerMutation, DeleteCustomerMutationVariables>(DeleteCustomerDocument, variables)(),
        options,
    );
};

useDeleteCustomerMutation.fetcher = (variables: DeleteCustomerMutationVariables) => fetcher<DeleteCustomerMutation, DeleteCustomerMutationVariables>(DeleteCustomerDocument, variables);

export const DeleteDiscountDocument = `
    mutation deleteDiscount($id: String!) {
  deleteDiscount(id: $id) {
    name
  }
}
    `;

export const useDeleteDiscountMutation = <TError = Error, TContext = unknown>(options?: UseMutationOptions<DeleteDiscountMutation, TError, DeleteDiscountMutationVariables, TContext>) => {
    return useMutation<DeleteDiscountMutation, TError, DeleteDiscountMutationVariables, TContext>(
        ['deleteDiscount'],
        (variables?: DeleteDiscountMutationVariables) => fetcher<DeleteDiscountMutation, DeleteDiscountMutationVariables>(DeleteDiscountDocument, variables)(),
        options,
    );
};

useDeleteDiscountMutation.fetcher = (variables: DeleteDiscountMutationVariables) => fetcher<DeleteDiscountMutation, DeleteDiscountMutationVariables>(DeleteDiscountDocument, variables);

export const DeleteDispensaryDocument = `
    mutation deleteDispensary($id: String!) {
  deleteDispensary(id: $id) {
    name
  }
}
    `;

export const useDeleteDispensaryMutation = <TError = Error, TContext = unknown>(options?: UseMutationOptions<DeleteDispensaryMutation, TError, DeleteDispensaryMutationVariables, TContext>) => {
    return useMutation<DeleteDispensaryMutation, TError, DeleteDispensaryMutationVariables, TContext>(
        ['deleteDispensary'],
        (variables?: DeleteDispensaryMutationVariables) => fetcher<DeleteDispensaryMutation, DeleteDispensaryMutationVariables>(DeleteDispensaryDocument, variables)(),
        options,
    );
};

useDeleteDispensaryMutation.fetcher = (variables: DeleteDispensaryMutationVariables) => fetcher<DeleteDispensaryMutation, DeleteDispensaryMutationVariables>(DeleteDispensaryDocument, variables);

export const DeleteItemCategoryDocument = `
    mutation deleteItemCategory($id: String!) {
  deleteItemCategory(id: $id) {
    name
  }
}
    `;

export const useDeleteItemCategoryMutation = <TError = Error, TContext = unknown>(options?: UseMutationOptions<DeleteItemCategoryMutation, TError, DeleteItemCategoryMutationVariables, TContext>) => {
    return useMutation<DeleteItemCategoryMutation, TError, DeleteItemCategoryMutationVariables, TContext>(
        ['deleteItemCategory'],
        (variables?: DeleteItemCategoryMutationVariables) => fetcher<DeleteItemCategoryMutation, DeleteItemCategoryMutationVariables>(DeleteItemCategoryDocument, variables)(),
        options,
    );
};

useDeleteItemCategoryMutation.fetcher = (variables: DeleteItemCategoryMutationVariables) =>
    fetcher<DeleteItemCategoryMutation, DeleteItemCategoryMutationVariables>(DeleteItemCategoryDocument, variables);

export const DeleteLoyaltyDocument = `
    mutation deleteLoyalty($id: String!) {
  deleteLoyalty(id: $id) {
    name
  }
}
    `;

export const useDeleteLoyaltyMutation = <TError = Error, TContext = unknown>(options?: UseMutationOptions<DeleteLoyaltyMutation, TError, DeleteLoyaltyMutationVariables, TContext>) => {
    return useMutation<DeleteLoyaltyMutation, TError, DeleteLoyaltyMutationVariables, TContext>(
        ['deleteLoyalty'],
        (variables?: DeleteLoyaltyMutationVariables) => fetcher<DeleteLoyaltyMutation, DeleteLoyaltyMutationVariables>(DeleteLoyaltyDocument, variables)(),
        options,
    );
};

useDeleteLoyaltyMutation.fetcher = (variables: DeleteLoyaltyMutationVariables) => fetcher<DeleteLoyaltyMutation, DeleteLoyaltyMutationVariables>(DeleteLoyaltyDocument, variables);

export const DeleteOrganizationDocument = `
    mutation deleteOrganization($id: String!) {
  deleteOrganization(id: $id) {
    id
    name
    phone
    createdAt
    updatedAt
  }
}
    `;

export const useDeleteOrganizationMutation = <TError = Error, TContext = unknown>(options?: UseMutationOptions<DeleteOrganizationMutation, TError, DeleteOrganizationMutationVariables, TContext>) => {
    return useMutation<DeleteOrganizationMutation, TError, DeleteOrganizationMutationVariables, TContext>(
        ['deleteOrganization'],
        (variables?: DeleteOrganizationMutationVariables) => fetcher<DeleteOrganizationMutation, DeleteOrganizationMutationVariables>(DeleteOrganizationDocument, variables)(),
        options,
    );
};

useDeleteOrganizationMutation.fetcher = (variables: DeleteOrganizationMutationVariables) =>
    fetcher<DeleteOrganizationMutation, DeleteOrganizationMutationVariables>(DeleteOrganizationDocument, variables);

export const DeleteTaxSettingDocument = `
    mutation deleteTaxSetting($id: String!) {
  deleteTaxSetting(id: $id) {
    name
  }
}
    `;

export const useDeleteTaxSettingMutation = <TError = Error, TContext = unknown>(options?: UseMutationOptions<DeleteTaxSettingMutation, TError, DeleteTaxSettingMutationVariables, TContext>) => {
    return useMutation<DeleteTaxSettingMutation, TError, DeleteTaxSettingMutationVariables, TContext>(
        ['deleteTaxSetting'],
        (variables?: DeleteTaxSettingMutationVariables) => fetcher<DeleteTaxSettingMutation, DeleteTaxSettingMutationVariables>(DeleteTaxSettingDocument, variables)(),
        options,
    );
};

useDeleteTaxSettingMutation.fetcher = (variables: DeleteTaxSettingMutationVariables) => fetcher<DeleteTaxSettingMutation, DeleteTaxSettingMutationVariables>(DeleteTaxSettingDocument, variables);

export const DeleteUserDocument = `
    mutation deleteUser($id: String!) {
  deleteUser(id: $id) {
    name
  }
}
    `;

export const useDeleteUserMutation = <TError = Error, TContext = unknown>(options?: UseMutationOptions<DeleteUserMutation, TError, DeleteUserMutationVariables, TContext>) => {
    return useMutation<DeleteUserMutation, TError, DeleteUserMutationVariables, TContext>(
        ['deleteUser'],
        (variables?: DeleteUserMutationVariables) => fetcher<DeleteUserMutation, DeleteUserMutationVariables>(DeleteUserDocument, variables)(),
        options,
    );
};

useDeleteUserMutation.fetcher = (variables: DeleteUserMutationVariables) => fetcher<DeleteUserMutation, DeleteUserMutationVariables>(DeleteUserDocument, variables);

export const LoginUserDocument = `
    mutation loginUser($input: UserLoginInput!) {
  loginUser(input: $input) {
    token
  }
}
    `;

export const useLoginUserMutation = <TError = Error, TContext = unknown>(options?: UseMutationOptions<LoginUserMutation, TError, LoginUserMutationVariables, TContext>) => {
    return useMutation<LoginUserMutation, TError, LoginUserMutationVariables, TContext>(
        ['loginUser'],
        (variables?: LoginUserMutationVariables) => fetcher<LoginUserMutation, LoginUserMutationVariables>(LoginUserDocument, variables)(),
        options,
    );
};

useLoginUserMutation.fetcher = (variables: LoginUserMutationVariables) => fetcher<LoginUserMutation, LoginUserMutationVariables>(LoginUserDocument, variables);

export const MetrcConnectUpdateDocument = `
    mutation metrcConnectUpdate($input: MetrcConnectionInput!) {
  metrcConnectionUpdate(input: $input) {
    name
    metrcApiKey
    metrcLicenseNumber
    metrcConnectionStatus
  }
}
    `;

export const useMetrcConnectUpdateMutation = <TError = Error, TContext = unknown>(options?: UseMutationOptions<MetrcConnectUpdateMutation, TError, MetrcConnectUpdateMutationVariables, TContext>) => {
    return useMutation<MetrcConnectUpdateMutation, TError, MetrcConnectUpdateMutationVariables, TContext>(
        ['metrcConnectUpdate'],
        (variables?: MetrcConnectUpdateMutationVariables) => fetcher<MetrcConnectUpdateMutation, MetrcConnectUpdateMutationVariables>(MetrcConnectUpdateDocument, variables)(),
        options,
    );
};

useMetrcConnectUpdateMutation.fetcher = (variables: MetrcConnectUpdateMutationVariables) =>
    fetcher<MetrcConnectUpdateMutation, MetrcConnectUpdateMutationVariables>(MetrcConnectUpdateDocument, variables);

export const UpdateCustomerDocument = `
    mutation updateCustomer($input: CustomerUpdateInput!) {
  updateCustomer(input: $input) {
    name
  }
}
    `;

export const useUpdateCustomerMutation = <TError = Error, TContext = unknown>(options?: UseMutationOptions<UpdateCustomerMutation, TError, UpdateCustomerMutationVariables, TContext>) => {
    return useMutation<UpdateCustomerMutation, TError, UpdateCustomerMutationVariables, TContext>(
        ['updateCustomer'],
        (variables?: UpdateCustomerMutationVariables) => fetcher<UpdateCustomerMutation, UpdateCustomerMutationVariables>(UpdateCustomerDocument, variables)(),
        options,
    );
};

useUpdateCustomerMutation.fetcher = (variables: UpdateCustomerMutationVariables) => fetcher<UpdateCustomerMutation, UpdateCustomerMutationVariables>(UpdateCustomerDocument, variables);

export const UpdateDiscountDocument = `
    mutation updateDiscount($input: DiscountUpdateInput!) {
  updateDiscount(input: $input) {
    name
  }
}
    `;

export const useUpdateDiscountMutation = <TError = Error, TContext = unknown>(options?: UseMutationOptions<UpdateDiscountMutation, TError, UpdateDiscountMutationVariables, TContext>) => {
    return useMutation<UpdateDiscountMutation, TError, UpdateDiscountMutationVariables, TContext>(
        ['updateDiscount'],
        (variables?: UpdateDiscountMutationVariables) => fetcher<UpdateDiscountMutation, UpdateDiscountMutationVariables>(UpdateDiscountDocument, variables)(),
        options,
    );
};

useUpdateDiscountMutation.fetcher = (variables: UpdateDiscountMutationVariables) => fetcher<UpdateDiscountMutation, UpdateDiscountMutationVariables>(UpdateDiscountDocument, variables);

export const UpdateDispensaryDocument = `
    mutation updateDispensary($input: DispensaryUpdateInput!) {
  updateDispensary(input: $input) {
    id
    name
    dispensaryType
    organizationId
    businessLicense
    phone
    email
    locationAddress
    locationCity
    locationState
    locationZipCode
  }
}
    `;

export const useUpdateDispensaryMutation = <TError = Error, TContext = unknown>(options?: UseMutationOptions<UpdateDispensaryMutation, TError, UpdateDispensaryMutationVariables, TContext>) => {
    return useMutation<UpdateDispensaryMutation, TError, UpdateDispensaryMutationVariables, TContext>(
        ['updateDispensary'],
        (variables?: UpdateDispensaryMutationVariables) => fetcher<UpdateDispensaryMutation, UpdateDispensaryMutationVariables>(UpdateDispensaryDocument, variables)(),
        options,
    );
};

useUpdateDispensaryMutation.fetcher = (variables: UpdateDispensaryMutationVariables) => fetcher<UpdateDispensaryMutation, UpdateDispensaryMutationVariables>(UpdateDispensaryDocument, variables);

export const UpdateItemCategoryDocument = `
    mutation updateItemCategory($input: ItemCategoryUpdateInput!) {
  updateItemCategory(input: $input) {
    name
  }
}
    `;

export const useUpdateItemCategoryMutation = <TError = Error, TContext = unknown>(options?: UseMutationOptions<UpdateItemCategoryMutation, TError, UpdateItemCategoryMutationVariables, TContext>) => {
    return useMutation<UpdateItemCategoryMutation, TError, UpdateItemCategoryMutationVariables, TContext>(
        ['updateItemCategory'],
        (variables?: UpdateItemCategoryMutationVariables) => fetcher<UpdateItemCategoryMutation, UpdateItemCategoryMutationVariables>(UpdateItemCategoryDocument, variables)(),
        options,
    );
};

useUpdateItemCategoryMutation.fetcher = (variables: UpdateItemCategoryMutationVariables) =>
    fetcher<UpdateItemCategoryMutation, UpdateItemCategoryMutationVariables>(UpdateItemCategoryDocument, variables);

export const UpdateLoyaltyDocument = `
    mutation updateLoyalty($input: LoyaltyUpdateInput!) {
  updateLoyalty(input: $input) {
    name
  }
}
    `;

export const useUpdateLoyaltyMutation = <TError = Error, TContext = unknown>(options?: UseMutationOptions<UpdateLoyaltyMutation, TError, UpdateLoyaltyMutationVariables, TContext>) => {
    return useMutation<UpdateLoyaltyMutation, TError, UpdateLoyaltyMutationVariables, TContext>(
        ['updateLoyalty'],
        (variables?: UpdateLoyaltyMutationVariables) => fetcher<UpdateLoyaltyMutation, UpdateLoyaltyMutationVariables>(UpdateLoyaltyDocument, variables)(),
        options,
    );
};

useUpdateLoyaltyMutation.fetcher = (variables: UpdateLoyaltyMutationVariables) => fetcher<UpdateLoyaltyMutation, UpdateLoyaltyMutationVariables>(UpdateLoyaltyDocument, variables);

export const UpdateOrganizationDocument = `
    mutation updateOrganization($input: OrganizationUpdateInput!) {
  updateOrganization(input: $input) {
    id
    name
    phone
    createdAt
    updatedAt
  }
}
    `;

export const useUpdateOrganizationMutation = <TError = Error, TContext = unknown>(options?: UseMutationOptions<UpdateOrganizationMutation, TError, UpdateOrganizationMutationVariables, TContext>) => {
    return useMutation<UpdateOrganizationMutation, TError, UpdateOrganizationMutationVariables, TContext>(
        ['updateOrganization'],
        (variables?: UpdateOrganizationMutationVariables) => fetcher<UpdateOrganizationMutation, UpdateOrganizationMutationVariables>(UpdateOrganizationDocument, variables)(),
        options,
    );
};

useUpdateOrganizationMutation.fetcher = (variables: UpdateOrganizationMutationVariables) =>
    fetcher<UpdateOrganizationMutation, UpdateOrganizationMutationVariables>(UpdateOrganizationDocument, variables);

export const UpdateTaxSettingDocument = `
    mutation updateTaxSetting($input: TaxSettingUpdateInput!) {
  updateTaxSetting(input: $input) {
    name
  }
}
    `;

export const useUpdateTaxSettingMutation = <TError = Error, TContext = unknown>(options?: UseMutationOptions<UpdateTaxSettingMutation, TError, UpdateTaxSettingMutationVariables, TContext>) => {
    return useMutation<UpdateTaxSettingMutation, TError, UpdateTaxSettingMutationVariables, TContext>(
        ['updateTaxSetting'],
        (variables?: UpdateTaxSettingMutationVariables) => fetcher<UpdateTaxSettingMutation, UpdateTaxSettingMutationVariables>(UpdateTaxSettingDocument, variables)(),
        options,
    );
};

useUpdateTaxSettingMutation.fetcher = (variables: UpdateTaxSettingMutationVariables) => fetcher<UpdateTaxSettingMutation, UpdateTaxSettingMutationVariables>(UpdateTaxSettingDocument, variables);

export const UpdateUserDocument = `
    mutation updateUser($input: UserUpdateInput!) {
  updateUser(input: $input) {
    name
  }
}
    `;

export const useUpdateUserMutation = <TError = Error, TContext = unknown>(options?: UseMutationOptions<UpdateUserMutation, TError, UpdateUserMutationVariables, TContext>) => {
    return useMutation<UpdateUserMutation, TError, UpdateUserMutationVariables, TContext>(
        ['updateUser'],
        (variables?: UpdateUserMutationVariables) => fetcher<UpdateUserMutation, UpdateUserMutationVariables>(UpdateUserDocument, variables)(),
        options,
    );
};

useUpdateUserMutation.fetcher = (variables: UpdateUserMutationVariables) => fetcher<UpdateUserMutation, UpdateUserMutationVariables>(UpdateUserDocument, variables);

export const AllCustomersByDispensaryIdDocument = `
    query AllCustomersByDispensaryId($dispensaryId: String!) {
  allCustomersByDispensaryId(dispensaryId: $dispensaryId) {
    id
    name
    MFType
    birthday
    email
    phone
    dispensaryId
    isActive
    driverLicense
    driverLicenseExpirationDate
    isMedical
    medicalLicense
    medicalLicenseExpirationDate
    createdAt
    updatedAt
  }
}
    `;

export const useAllCustomersByDispensaryIdQuery = <TData = AllCustomersByDispensaryIdQuery, TError = Error>(
    variables: AllCustomersByDispensaryIdQueryVariables,
    options?: UseQueryOptions<AllCustomersByDispensaryIdQuery, TError, TData>,
) => {
    return useQuery<AllCustomersByDispensaryIdQuery, TError, TData>(
        ['AllCustomersByDispensaryId', variables],
        fetcher<AllCustomersByDispensaryIdQuery, AllCustomersByDispensaryIdQueryVariables>(AllCustomersByDispensaryIdDocument, variables),
        options,
    );
};

useAllCustomersByDispensaryIdQuery.fetcher = (variables: AllCustomersByDispensaryIdQueryVariables) =>
    fetcher<AllCustomersByDispensaryIdQuery, AllCustomersByDispensaryIdQueryVariables>(AllCustomersByDispensaryIdDocument, variables);

export const AllDiscountsByDispensaryIdDocument = `
    query AllDiscountsByDispensaryId($dispensaryId: String!) {
  allDiscountsByDispensaryId(dispensaryId: $dispensaryId) {
    id
    dispensaryId
    name
    type
    applyDurationSet
    applyTo
    applyFrom
    discountPercent
    isActive
    isAdminPin
    color
    createdAt
    updatedAt
  }
}
    `;

export const useAllDiscountsByDispensaryIdQuery = <TData = AllDiscountsByDispensaryIdQuery, TError = Error>(
    variables: AllDiscountsByDispensaryIdQueryVariables,
    options?: UseQueryOptions<AllDiscountsByDispensaryIdQuery, TError, TData>,
) => {
    return useQuery<AllDiscountsByDispensaryIdQuery, TError, TData>(
        ['AllDiscountsByDispensaryId', variables],
        fetcher<AllDiscountsByDispensaryIdQuery, AllDiscountsByDispensaryIdQueryVariables>(AllDiscountsByDispensaryIdDocument, variables),
        options,
    );
};

useAllDiscountsByDispensaryIdQuery.fetcher = (variables: AllDiscountsByDispensaryIdQueryVariables) =>
    fetcher<AllDiscountsByDispensaryIdQuery, AllDiscountsByDispensaryIdQueryVariables>(AllDiscountsByDispensaryIdDocument, variables);

export const AllDispensariesDocument = `
    query AllDispensaries {
  allDispensaries {
    id
    name
    dispensaryType
    organizationId
    businessLicense
    phone
    email
    locationAddress
    locationCity
    locationState
    locationZipCode
    createdAt
    updatedAt
  }
}
    `;

export const useAllDispensariesQuery = <TData = AllDispensariesQuery, TError = Error>(variables?: AllDispensariesQueryVariables, options?: UseQueryOptions<AllDispensariesQuery, TError, TData>) => {
    return useQuery<AllDispensariesQuery, TError, TData>(
        variables === undefined ? ['AllDispensaries'] : ['AllDispensaries', variables],
        fetcher<AllDispensariesQuery, AllDispensariesQueryVariables>(AllDispensariesDocument, variables),
        options,
    );
};

useAllDispensariesQuery.fetcher = (variables?: AllDispensariesQueryVariables) => fetcher<AllDispensariesQuery, AllDispensariesQueryVariables>(AllDispensariesDocument, variables);

export const AllDispensariesByOrganizationIdDocument = `
    query AllDispensariesByOrganizationId($organizationId: String!) {
  allDispensariesByOrganizationId(organizationId: $organizationId) {
    id
    name
    dispensaryType
    organizationId
    businessLicense
    phone
    email
    locationAddress
    locationCity
    locationState
    locationZipCode
    createdAt
    updatedAt
  }
}
    `;

export const useAllDispensariesByOrganizationIdQuery = <TData = AllDispensariesByOrganizationIdQuery, TError = Error>(
    variables: AllDispensariesByOrganizationIdQueryVariables,
    options?: UseQueryOptions<AllDispensariesByOrganizationIdQuery, TError, TData>,
) => {
    return useQuery<AllDispensariesByOrganizationIdQuery, TError, TData>(
        ['AllDispensariesByOrganizationId', variables],
        fetcher<AllDispensariesByOrganizationIdQuery, AllDispensariesByOrganizationIdQueryVariables>(AllDispensariesByOrganizationIdDocument, variables),
        options,
    );
};

useAllDispensariesByOrganizationIdQuery.fetcher = (variables: AllDispensariesByOrganizationIdQueryVariables) =>
    fetcher<AllDispensariesByOrganizationIdQuery, AllDispensariesByOrganizationIdQueryVariables>(AllDispensariesByOrganizationIdDocument, variables);

export const AllItemCategoriesByStateOfUsaDocument = `
    query AllItemCategoriesByStateOfUsa($stateOfUsa: StateType!) {
  allItemCategoriesByStateOfUsa(stateOfUsa: $stateOfUsa) {
    id
    name
    stateOfUsa
    createdAt
    updatedAt
  }
}
    `;

export const useAllItemCategoriesByStateOfUsaQuery = <TData = AllItemCategoriesByStateOfUsaQuery, TError = Error>(
    variables: AllItemCategoriesByStateOfUsaQueryVariables,
    options?: UseQueryOptions<AllItemCategoriesByStateOfUsaQuery, TError, TData>,
) => {
    return useQuery<AllItemCategoriesByStateOfUsaQuery, TError, TData>(
        ['AllItemCategoriesByStateOfUsa', variables],
        fetcher<AllItemCategoriesByStateOfUsaQuery, AllItemCategoriesByStateOfUsaQueryVariables>(AllItemCategoriesByStateOfUsaDocument, variables),
        options,
    );
};

useAllItemCategoriesByStateOfUsaQuery.fetcher = (variables: AllItemCategoriesByStateOfUsaQueryVariables) =>
    fetcher<AllItemCategoriesByStateOfUsaQuery, AllItemCategoriesByStateOfUsaQueryVariables>(AllItemCategoriesByStateOfUsaDocument, variables);

export const AllLoyaltiesByDispensaryIdDocument = `
    query AllLoyaltiesByDispensaryId($dispensaryId: String!) {
  allLoyaltiesByDispensaryId(dispensaryId: $dispensaryId) {
    id
    dispensaryId
    name
    type
    applyDurationSet
    applyTo
    applyFrom
    pointWorth
    isActive
    isAdminPin
    color
    createdAt
    updatedAt
  }
}
    `;

export const useAllLoyaltiesByDispensaryIdQuery = <TData = AllLoyaltiesByDispensaryIdQuery, TError = Error>(
    variables: AllLoyaltiesByDispensaryIdQueryVariables,
    options?: UseQueryOptions<AllLoyaltiesByDispensaryIdQuery, TError, TData>,
) => {
    return useQuery<AllLoyaltiesByDispensaryIdQuery, TError, TData>(
        ['AllLoyaltiesByDispensaryId', variables],
        fetcher<AllLoyaltiesByDispensaryIdQuery, AllLoyaltiesByDispensaryIdQueryVariables>(AllLoyaltiesByDispensaryIdDocument, variables),
        options,
    );
};

useAllLoyaltiesByDispensaryIdQuery.fetcher = (variables: AllLoyaltiesByDispensaryIdQueryVariables) =>
    fetcher<AllLoyaltiesByDispensaryIdQuery, AllLoyaltiesByDispensaryIdQueryVariables>(AllLoyaltiesByDispensaryIdDocument, variables);

export const AllOrganizationsDocument = `
    query AllOrganizations {
  allOrganizations {
    id
    name
    phone
    createdAt
    updatedAt
  }
}
    `;

export const useAllOrganizationsQuery = <TData = AllOrganizationsQuery, TError = Error>(
    variables?: AllOrganizationsQueryVariables,
    options?: UseQueryOptions<AllOrganizationsQuery, TError, TData>,
) => {
    return useQuery<AllOrganizationsQuery, TError, TData>(
        variables === undefined ? ['AllOrganizations'] : ['AllOrganizations', variables],
        fetcher<AllOrganizationsQuery, AllOrganizationsQueryVariables>(AllOrganizationsDocument, variables),
        options,
    );
};

useAllOrganizationsQuery.fetcher = (variables?: AllOrganizationsQueryVariables) => fetcher<AllOrganizationsQuery, AllOrganizationsQueryVariables>(AllOrganizationsDocument, variables);

export const AllTaxSettingByDispensaryIdDocument = `
    query AllTaxSettingByDispensaryId($dispensaryId: String!) {
  allTaxSettingByDispensaryId(dispensaryId: $dispensaryId) {
    id
    dispensaryId
    name
    rate
    categories {
      value
      label
      stateOfUsa
    }
    applyTo
    createdAt
    updatedAt
  }
}
    `;

export const useAllTaxSettingByDispensaryIdQuery = <TData = AllTaxSettingByDispensaryIdQuery, TError = Error>(
    variables: AllTaxSettingByDispensaryIdQueryVariables,
    options?: UseQueryOptions<AllTaxSettingByDispensaryIdQuery, TError, TData>,
) => {
    return useQuery<AllTaxSettingByDispensaryIdQuery, TError, TData>(
        ['AllTaxSettingByDispensaryId', variables],
        fetcher<AllTaxSettingByDispensaryIdQuery, AllTaxSettingByDispensaryIdQueryVariables>(AllTaxSettingByDispensaryIdDocument, variables),
        options,
    );
};

useAllTaxSettingByDispensaryIdQuery.fetcher = (variables: AllTaxSettingByDispensaryIdQueryVariables) =>
    fetcher<AllTaxSettingByDispensaryIdQuery, AllTaxSettingByDispensaryIdQueryVariables>(AllTaxSettingByDispensaryIdDocument, variables);

export const AllUsersByDispensaryIdDocument = `
    query AllUsersByDispensaryId($dispensaryId: String!) {
  allUsersByDispensaryId(dispensaryId: $dispensaryId) {
    id
    email
    name
    phone
    dispensaryId
    isActive
    isDispensaryAdmin
    isEmailVerified
    isOrganizationAdmin
    userType
    createdAt
    updatedAt
  }
}
    `;

export const useAllUsersByDispensaryIdQuery = <TData = AllUsersByDispensaryIdQuery, TError = Error>(
    variables: AllUsersByDispensaryIdQueryVariables,
    options?: UseQueryOptions<AllUsersByDispensaryIdQuery, TError, TData>,
) => {
    return useQuery<AllUsersByDispensaryIdQuery, TError, TData>(
        ['AllUsersByDispensaryId', variables],
        fetcher<AllUsersByDispensaryIdQuery, AllUsersByDispensaryIdQueryVariables>(AllUsersByDispensaryIdDocument, variables),
        options,
    );
};

useAllUsersByDispensaryIdQuery.fetcher = (variables: AllUsersByDispensaryIdQueryVariables) =>
    fetcher<AllUsersByDispensaryIdQuery, AllUsersByDispensaryIdQueryVariables>(AllUsersByDispensaryIdDocument, variables);

export const CustomerDocument = `
    query Customer($id: String!) {
  customer(id: $id) {
    id
    name
    MFType
    birthday
    email
    phone
    dispensaryId
    isActive
    driverLicense
    driverLicenseExpirationDate
    isMedical
    medicalLicense
    medicalLicenseExpirationDate
    createdAt
    updatedAt
  }
}
    `;

export const useCustomerQuery = <TData = CustomerQuery, TError = Error>(variables: CustomerQueryVariables, options?: UseQueryOptions<CustomerQuery, TError, TData>) => {
    return useQuery<CustomerQuery, TError, TData>(['Customer', variables], fetcher<CustomerQuery, CustomerQueryVariables>(CustomerDocument, variables), options);
};

useCustomerQuery.fetcher = (variables: CustomerQueryVariables) => fetcher<CustomerQuery, CustomerQueryVariables>(CustomerDocument, variables);

export const DiscountDocument = `
    query Discount($id: String!) {
  discount(id: $id) {
    id
    dispensaryId
    name
    type
    applyDurationSet
    applyTo
    applyFrom
    discountPercent
    isActive
    isAdminPin
    color
    createdAt
    updatedAt
  }
}
    `;

export const useDiscountQuery = <TData = DiscountQuery, TError = Error>(variables: DiscountQueryVariables, options?: UseQueryOptions<DiscountQuery, TError, TData>) => {
    return useQuery<DiscountQuery, TError, TData>(['Discount', variables], fetcher<DiscountQuery, DiscountQueryVariables>(DiscountDocument, variables), options);
};

useDiscountQuery.fetcher = (variables: DiscountQueryVariables) => fetcher<DiscountQuery, DiscountQueryVariables>(DiscountDocument, variables);

export const DispensaryDocument = `
    query Dispensary($id: String!) {
  dispensary(id: $id) {
    id
    name
    organizationId
    dispensaryType
    email
    phone
    locationAddress
    locationCity
    locationState
    locationZipCode
    businessLicense
  }
}
    `;

export const useDispensaryQuery = <TData = DispensaryQuery, TError = Error>(variables: DispensaryQueryVariables, options?: UseQueryOptions<DispensaryQuery, TError, TData>) => {
    return useQuery<DispensaryQuery, TError, TData>(['Dispensary', variables], fetcher<DispensaryQuery, DispensaryQueryVariables>(DispensaryDocument, variables), options);
};

useDispensaryQuery.fetcher = (variables: DispensaryQueryVariables) => fetcher<DispensaryQuery, DispensaryQueryVariables>(DispensaryDocument, variables);

export const ItemCategoryDocument = `
    query ItemCategory($id: String!) {
  itemCategory(id: $id) {
    id
    name
    stateOfUsa
    createdAt
    updatedAt
  }
}
    `;

export const useItemCategoryQuery = <TData = ItemCategoryQuery, TError = Error>(variables: ItemCategoryQueryVariables, options?: UseQueryOptions<ItemCategoryQuery, TError, TData>) => {
    return useQuery<ItemCategoryQuery, TError, TData>(['ItemCategory', variables], fetcher<ItemCategoryQuery, ItemCategoryQueryVariables>(ItemCategoryDocument, variables), options);
};

useItemCategoryQuery.fetcher = (variables: ItemCategoryQueryVariables) => fetcher<ItemCategoryQuery, ItemCategoryQueryVariables>(ItemCategoryDocument, variables);

export const LoyaltyDocument = `
    query Loyalty($id: String!) {
  loyalty(id: $id) {
    id
    dispensaryId
    name
    type
    applyDurationSet
    applyTo
    applyFrom
    pointWorth
    isActive
    isAdminPin
    color
    createdAt
    updatedAt
  }
}
    `;

export const useLoyaltyQuery = <TData = LoyaltyQuery, TError = Error>(variables: LoyaltyQueryVariables, options?: UseQueryOptions<LoyaltyQuery, TError, TData>) => {
    return useQuery<LoyaltyQuery, TError, TData>(['Loyalty', variables], fetcher<LoyaltyQuery, LoyaltyQueryVariables>(LoyaltyDocument, variables), options);
};

useLoyaltyQuery.fetcher = (variables: LoyaltyQueryVariables) => fetcher<LoyaltyQuery, LoyaltyQueryVariables>(LoyaltyDocument, variables);

export const MetrcInfoByDispensaryIdDocument = `
    query MetrcInfoByDispensaryId($dispensaryId: String!) {
  metrcInfoByDispensaryId(dispensaryId: $dispensaryId) {
    id
    metrcApiKey
    metrcConnectionStatus
    metrcLicenseNumber
  }
}
    `;

export const useMetrcInfoByDispensaryIdQuery = <TData = MetrcInfoByDispensaryIdQuery, TError = Error>(
    variables: MetrcInfoByDispensaryIdQueryVariables,
    options?: UseQueryOptions<MetrcInfoByDispensaryIdQuery, TError, TData>,
) => {
    return useQuery<MetrcInfoByDispensaryIdQuery, TError, TData>(
        ['MetrcInfoByDispensaryId', variables],
        fetcher<MetrcInfoByDispensaryIdQuery, MetrcInfoByDispensaryIdQueryVariables>(MetrcInfoByDispensaryIdDocument, variables),
        options,
    );
};

useMetrcInfoByDispensaryIdQuery.fetcher = (variables: MetrcInfoByDispensaryIdQueryVariables) =>
    fetcher<MetrcInfoByDispensaryIdQuery, MetrcInfoByDispensaryIdQueryVariables>(MetrcInfoByDispensaryIdDocument, variables);

export const OrganizationDocument = `
    query Organization($id: String!) {
  organization(id: $id) {
    id
    name
    phone
    dispensaries {
      id
      name
      dispensaryType
      email
      phone
      locationAddress
      locationCity
      locationState
      locationZipCode
      businessLicense
      createdAt
      updatedAt
    }
    createdAt
    updatedAt
  }
}
    `;

export const useOrganizationQuery = <TData = OrganizationQuery, TError = Error>(variables: OrganizationQueryVariables, options?: UseQueryOptions<OrganizationQuery, TError, TData>) => {
    return useQuery<OrganizationQuery, TError, TData>(['Organization', variables], fetcher<OrganizationQuery, OrganizationQueryVariables>(OrganizationDocument, variables), options);
};

useOrganizationQuery.fetcher = (variables: OrganizationQueryVariables) => fetcher<OrganizationQuery, OrganizationQueryVariables>(OrganizationDocument, variables);

export const TaxSettingDocument = `
    query TaxSetting($id: String!) {
  taxSetting(id: $id) {
    id
    dispensaryId
    name
    rate
    categories {
      value
      label
      stateOfUsa
    }
    applyTo
    createdAt
    updatedAt
  }
}
    `;

export const useTaxSettingQuery = <TData = TaxSettingQuery, TError = Error>(variables: TaxSettingQueryVariables, options?: UseQueryOptions<TaxSettingQuery, TError, TData>) => {
    return useQuery<TaxSettingQuery, TError, TData>(['TaxSetting', variables], fetcher<TaxSettingQuery, TaxSettingQueryVariables>(TaxSettingDocument, variables), options);
};

useTaxSettingQuery.fetcher = (variables: TaxSettingQueryVariables) => fetcher<TaxSettingQuery, TaxSettingQueryVariables>(TaxSettingDocument, variables);
