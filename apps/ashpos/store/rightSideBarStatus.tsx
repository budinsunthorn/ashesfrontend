import { atom } from "jotai";

export const rightSideBarStatus = atom<any>({
    show: false,
    data: {
        packageId: "",
        deliverId: 0
    }
})