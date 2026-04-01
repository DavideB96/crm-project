function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-800 shadow-inner">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">

                    <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                            <span className="text-slate-800 text-xs font-black">C</span>
                        </div>
                        <span className="text-slate-400 text-sm font-semibold">CRM</span>
                    </div>

                    <p className="text-slate-400 text-sm flex items-center gap-2">
                        <span> © {currentYear}</span>
                        <span>Built by</span>

                        <a
                            href="https://davideb96.github.io/EnPortfolio/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:text-slate-300 underline underline-offset-2 transition-colors"
                        >
                            Davide B.
                    </a>
                </p>

            </div>
        </div>
    </footer >
  );
}

export default Footer;