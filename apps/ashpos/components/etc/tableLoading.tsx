function TableLoading({text}:{text:string}) {
    return (
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center cursor-wait">
            <div className="absolute top-0 left-0 w-full h-full dark:!bg-[#0f1727] backdrop-blur-sm z-[99999]"></div>
            <div className="absolute top-[50%] !z-[100000]">
                {/* <div className="text-center text-gray-600 dark:text-gray-400 text-lg !z-[99999] my-3">{text}</div> */}
                <div className="flex flex-row gap-2 justify-center">
                    <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce"></div>
                    <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.3s]"></div>
                    <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.5s]"></div>
                </div>
            </div>
        </div>
    );
}

export default TableLoading;
