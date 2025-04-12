import React from 'react'

export const LeaderboardPage = () => {
  return (
    <div className="bg-gray-50 font-sans text-gray-800 h-100">
        <h1 className="text-3xl font-bold text-center mt-10">Bảng xếp hạng</h1>
        <div className="flex justify-center mt-5">
            <table className="min-w-full bg-white border border-gray-300">
            <thead>
                <tr>
                <th className="py-2 px-4 border-b">#</th>
                <th className="py-2 px-4 border-b">Tên người dùng</th>
                <th className="py-2 px-4 border-b">Điểm số</th>
                </tr>
            </thead>
            <tbody>
                {/* Dữ liệu bảng xếp hạng sẽ được hiển thị ở đây */}
            </tbody>
            </table>
        </div>
    </div>
  )
}
