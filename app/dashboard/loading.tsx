function LoadingPage() {
    return (
        <div className="relative flex w-full animate-pulse gap-2 p-4">
            <div className="flex items-center w-full gap-x-4 h-[85px] border-b">
                <div className="mb-1 h-5 w-[200px] rounded-lg bg-slate-400 text-lg">
                    <p className="h-5 w-[90%] pr-8 rounded-lg bg-slate-400 text-sm ">
                    </p>
                </div>
                <div className="mb-1 h-5 w-[200px] rounded-lg bg-slate-400 text-lg">
                    <p className="h-5 w-[90%] pr-8 rounded-lg bg-slate-400 text-sm ">
                    </p>
                </div>
            </div>
        </div >
    )
}

export default LoadingPage;