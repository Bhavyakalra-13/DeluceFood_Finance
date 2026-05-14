"use client";

const KnowledgePage = () => {
  return (
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 capitalize">Knowledge</h1>
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Knowledge Base</h2>
          <p className="text-gray-500">Centralize internal documentation and Standard Operating Procedures.</p>
        </div>
      </div>
    </div>
  );
};

export default KnowledgePage;
