import {atom, useAtomValue, useSetAtom} from 'jotai'

export const spinnerAtom = atom<any>({
    isLoading: false,
    text: ""
});

// export const useSpinnerStatus = () =>  {
    
//     const isLoading = useAtomValue(spinnerAtom);
//     const setIsLoading = useSetAtom(spinnerAtom);
//     return { isLoading, setIsLoading };

// }