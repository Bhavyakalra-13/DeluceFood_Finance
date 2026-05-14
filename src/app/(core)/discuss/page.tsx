"use client";

const DiscussPage = () => {
  return (
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 capitalize">Discuss</h1>
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Discuss Module</h2>
          <p className="text-gray-500">Communicate with colleagues through messages and notifications.</p>
        </div>
      </div>
    </div>
  );
};

export default DiscussPage;
