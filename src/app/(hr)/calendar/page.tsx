"use client";

const CalendarPage = () => {
  return (
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 capitalize">Calendar</h1>
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Calendar Module</h2>
          <p className="text-gray-500">Schedule company events, meetings, and synchronize timelines.</p>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
