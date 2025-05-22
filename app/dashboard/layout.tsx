import Navbar from "@/components/Navbar";

function layout({ children }: { children: React.ReactNode }) {
    return (
        <div className=" relative flex h-screen w-full flex-col">
            <Navbar />
            <div className="w-full">
                {children}
            </div>
        </div>
    )
}

export default layout;