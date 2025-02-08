import React, { useEffect, useState } from 'react'
import { listUsers } from '../utils/apiFunctions';
const List = () => {

    const [data,setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const users = await listUsers(); // Fetch users
           
            setData(users); // Update state with fetched data
        };
        fetchData();
    }, []);

  return (
    <div className="container ms-5">
        <table>
            <thead>
                <tr>
                   <th>Name</th>
                     <th>Email</th> 
                </tr>
            </thead>
            <tbody>
                {data.map(user => (
                    <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                    </tr>
                ))} 
            </tbody>
        </table>
    </div>
  )
}

export default List