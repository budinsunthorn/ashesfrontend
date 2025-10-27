import { FaUser } from 'react-icons/fa';  

const UserBadge = ({ userName } : {userName: string}) => {  
    // Function to determine color class based on the first letter of the username  
    const getColorClass = (name: any) => {  
        const firstLetter = name.charAt(0).toLowerCase();  
        if ('abc'.includes(firstLetter)) {  
            return 'text-success bg-success-light dark:bg-success-dark-light';  
        } else if ('defg'.includes(firstLetter)) {  
            return 'text-warning bg-warning-light dark:bg-warning-dark-light';  
        } else if ('hijklm'.includes(firstLetter)) {  
            return 'text-primary bg-primary-light dark:bg-primary-dark-light';  
        } else if ('nopqr'.includes(firstLetter)) {  
            return 'text-secondary bg-secondary-light dark:bg-secondary-dark-light';  
        } else {  
            return 'text-info bg-info-light dark:bg-info-dark-light';  
        }  
    };  

    // Get the color class based on the userName  
    const colorClass = getColorClass(userName);  

    return (  
        <span className={`flex justify-start text-[12px] items-center mx-1 badge ${colorClass}`}>  
            <FaUser className="mr-[3px]" />  
            {userName}  
        </span>  
    );  
};  

export default UserBadge;