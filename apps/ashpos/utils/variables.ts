import { DiscountType, PurchaseLimitType } from "@/src/__generated__/operations";

export const PRINTLIMIT = 99999999;
export const packageStatusArray = {
    ACCEPTED: 'Accepted',
    ACTIVE: 'Active',
    PENDING: 'Pending',
    HOLD: 'Hold',
    VOID: 'Void',
    VOIDED: 'Voided',
    FINISHED: 'Finished',
  }

export const customerStatusArray = {
  EMPLOYEE: 'Employee',
  MEDICALMEMBER: 'Patient',
  VETERAN: 'Veteran',
};

export const discountTypeArray = {
  MANUAL: 'Manual',
  OTHER: 'Other',
  STANDARD: 'Standard',
};

export const dispensaryTypeArray = {
  MED: 'Medical',
  REC: 'Recreational',
  MEDREC: 'Medical & Recreational',
};

export const userTypeArray = {
  USER: 'User',
  MANAGER_USER: 'Manager User',
  ADMIN_MANAGER_USER: 'Admin Manager User',
  SUPER_ADMIN_MANAGER_USER: 'Super Admin Manager User',
};

export const mfTypeArray = {
  MALE: 'Male',
  FEMALE: 'Female',
};

export const loyaltyTypeArray = {
  MANUAL: 'Manual',
  OTHER: 'Other',
  STANDARD: 'Standard',
};


export const taxSettingApplyToArray = {
  ALL: 'All',
  MJ: 'Medical Marijuana',
  NMJ: 'Non-Medical Marijuana',
};

export const supplierTypeArray = {
  Lab: 'Laboratory',
  Distributor: 'Distributor',
  Cultivator: 'Cultivator',
  DeliveryService: 'Delivery Service',
  Dispensary: 'Dispensary',
  Processor: 'Processor',
  Other: 'Other',
};

export const orderStatusArray = {
  EDIT: 'Edit',
  HOLD: 'Hold',
  VOID: 'Void',
  PAID: 'Paid',
};

export const payMethodArray = {
  CASH: 'Cash',
  CARD: 'Card',
  ATM: 'ATM',
};


export const drawerStatusArray = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
};

export const dropTypeArray = {
  IN: 'In',
  OUT: 'Out',
};

export const transferTypeArray = {
  Incoming: 'Incoming',
  Outgoing: 'Outgoing',
};

export const transferStatusArray = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  VOIDED: 'Voided',
};

export const orderTypeArray = {
  SALE: 'Sale',
  RETURN: 'Return',
};

export const orderMjTypeArray = {
  NONE: 'None',
  MJ: 'Medical Marijuana',
  NMJ: 'Non-Medical Marijuana',
};

export const timezonesArray = {
  EST: 'Eastern Standard Time',
  CST: 'Central Standard Time',
  MST: 'Mountain Standard Time',
  PST: 'Pacific Standard Time',
  AKST: 'Alaska Standard Time',
  HAST: 'Hawaii-Aleutian Standard Time',
};

export const discountMethodArray = {
  BYPERCENT: 'By Percent',
  BYAMOUNT: 'By Amount',
  TOAMOUNT: 'To Amount',
};

export const unitOfMeasureArray = {
  ea: 'Each',
  oz: 'Ounce',
  g: 'Gram',
  mg: 'Milligram',
};

export const syncTypeArray = {
  package: 'Package',
  transfer: 'Transfer',
};

export const purchaseLimitTypeArray = {
  flower: 'Flower',
  edible: 'Edible',
  liquidEdible: 'Liquid Edible',
  concentrate: 'Concentrate',
  topical: 'Topical',
  seed: 'Seed',
  clone: 'Clone',
};

export const purchaseLimitMethodArray = {
  transaction: 'Transaction',
  day: 'Day',
  month: 'Month',
};

export const discountOptions: Array<{ value: DiscountType; label: string }> = [
    { value: 'MANUAL', label: 'Manual' },
];

export const purchaseLimitOptions: Array<{ value: PurchaseLimitType; label: string }> = [  
  { value: 'Clone', label: 'Clone' },  
  { value: 'Concentrate', label: 'Concentrate' },  
  { value: 'Edible', label: 'Edible' },  
  { value: 'Flower', label: 'Flower' },  
  { value: 'LiquidEdible', label: 'Liquid Edible' },  
  { value: 'Seed', label: 'Seed' },  
  { value: 'Topical', label: 'Topical' },  
];


export const unitOfMeasureOptions: Array<{ value: string; label: string }> = [
  { value: 'ea', label: 'Each' },
  { value: 'oz', label: 'Ounce' },
  { value: 'g', label: 'Gram' },
  { value: 'mg', label: 'Milligram' },
];


export const quantityAbbreviations: { [key: string]: string } = {
  "Each": "ea",
  "Fluid Ounces": "fl oz",
  "Gallons": "gal",
  "Grams": "g",
  "Kilograms": "kg",
  "Liters": "l",
  "Milligrams": "mg",
  "Milliliters": "ml",
  "Ounces": "oz",
  "Pints": "pt",
  "Pounds": "lb",
  "Quarts": "qt",
  "": ""
};

export const quantityTypes: { [key: string]: string } = {
  "Each": "CountBased",
  "Fluid Ounces": "VolumeBased",
  "Gallons": "VolumeBased",
  "Grams": "WeightBased",
  "Kilograms": "WeightBased",
  "Liters": "VolumeBased",
  "Milligrams": "WeightBased",
  "Milliliters": "VolumeBased",
  "Ounces": "WeightBased",
  "Pints": "VolumeBased",
  "Pounds": "WeightBased",
  "Quarts": "VolumeBased"
};


export const registerLabel: { [key: string]: string } = {
  'register-1': 'Register 1',
  'register-2': 'Register 2',
  'register-3': 'Register 3',
  'register-4': 'Register 4',
};

// Example usage
// console.log(quantityAbbreviations["Gallons"]); // Output: "gal"
