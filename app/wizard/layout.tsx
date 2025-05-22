
function WizardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className=" relative flex flex-col items-center justify-center h-screen w-full">
            {children}
        </div>
    )
}

export default WizardLayout