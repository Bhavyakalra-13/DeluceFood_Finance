"use client";

const AppointmentsPage = () => {
  return (
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 capitalize">Appointments</h1>
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Appointments Module</h2>
          <p className="text-gray-500">Allow clients and suppliers to book meetings easily online.</p>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage;
