'use client';
import { useEffect, useState } from 'react';
import BackButton from '../components/BackButton';

function TeacherDashboard() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchStudents(selectedDate);
    }, [selectedDate]);

    const fetchStudents = async (date) => {
        try {
            setLoading(true);

            // Fetch student data first
            const response = await fetch(process.env.GETALLSTUDENTS);
            if (!response.ok) {
                throw new Error("Failed to fetch students");
            }
            const data = await response.json();

            if (Array.isArray(data.data)) {
                const formattedData = data.data.map(student => ({
                    studentId: student.studentId || "N/A",
                    isPresent: student.present === "Present",
                    studentName: student.name || "Unknown",
                    parentName: student.parentsName || "N/A",
                    parentContact: student.parentsContact || "N/A"
                }));

                // Get the current date in YYYY-MM-DD format
                const today = new Date().toISOString().split("T")[0];

                // Send attendance data to API
                const postResponse = await fetch("/api/attendance", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ date: today, students: formattedData }),
                });

                const result = await postResponse.json();

                if (!postResponse.ok) {
                    throw new Error(result.error || "Failed to submit attendance");
                }
                setStudents(students)
                alert("Attendance submitted successfully!");
            } else {
                throw new Error("Received data is not an array");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen items-center justify-start p-6 pt-20 bg-gray-100">
            <BackButton className="absolute top-6 left-6" />

            <div className="flex justify-between w-full max-w-4xl items-center mb-4">
                <h2 className="text-2xl font-bold">Teacher Dashboard</h2>
                <div>
                    <label htmlFor="date-picker" className="mr-2 font-medium">Select Date:</label>
                    <input
                        id="date-picker"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border rounded-lg px-3 py-1"
                    />
                </div>
            </div>

            <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Class Attendance for {selectedDate}</h3>
                {loading && <p>Loading students...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {!loading && !error && (
                    <table className="w-full table-fixed border-collapse">
                        <thead>
                            <tr className="bg-gray-200 text-left">
                                <th className="p-3 w-1/5">ID</th>
                                <th className="p-3 w-1/5">Name</th>
                                <th className="p-3 w-1/5">Parent</th>
                                <th className="p-3 w-1/5">Contact</th>
                                <th className="p-3 w-1/5">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length > 0 ? (
                                students.map((student, index) => (
                                    <tr key={index} className="border-t text-center">
                                        <td className="p-3">{student.studentId}</td>
                                        <td className="p-3">{student.studentName}</td>
                                        <td className="p-3">{student.parentName}</td>
                                        <td className="p-3">{student.parentContact}</td>
                                        <td className={`p-3 font-semibold ${student.isPresent ? "text-green-600" : "text-red-600"}`}>
                                            {student.isPresent ? "Present" : "Absent"}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-4">No attendance records for this date</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default TeacherDashboard;
